import pdfplumber
import re


def extract_transcript_data(pdf_path):
    """
    Extract structured data from an unofficial academic transcript PDF.

    Works with Ellucian Banner transcripts from any institution (e.g.,
    Roosevelt University, Northeastern Illinois University, etc.) regardless
    of whether the PDF was exported directly or saved from the web self-service.

    Returns a dict with:
      - name: Student's full name
      - major: Declared major
      - minor: Declared minor (if any)
      - year: Academic year/classification (based on earned credit hours)
      - classes: List of dicts, each with {course, title, grade, credits, term}
    """

    # ── 1. Pull all raw text and word positions from every page ────────
    all_words = []  # list of {text, x0, x1, top, bottom, page}
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page_num, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
            # Also extract word-level data for position-based parsing
            for w in page.extract_words():
                all_words.append({
                    'text': w['text'], 'x0': w['x0'], 'x1': w['x1'],
                    'top': w['top'], 'bottom': w.get('bottom', w['top'] + 10),
                    'page': page_num
                })

    # ── 2. Clean up web-page noise (Banner Self-Service saved as PDF) ──
    # Remove URLs, page footers, timestamps
    full_text = re.sub(r'https?://\S+', '', full_text)
    full_text = re.sub(r'Page \d+ of \d+', '', full_text)

    # ── 3. Extract INSTITUTION NAME ──────────────────────────────────
    # Look for a line that contains a university/institute name.
    # Skip section header lines like "College Major Minor".
    institution = "Unknown"
    # Patterns that indicate a real institution name (not a column header)
    inst_keywords = re.compile(
        r'\b(University|Institute|Polytechnic)\b', re.IGNORECASE
    )
    # Patterns for header labels we should skip
    header_labels = re.compile(
        r'^(College\s+Major|Curriculum|Student|Transcript)', re.IGNORECASE
    )
    for line in full_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        if header_labels.match(line):
            continue
        if inst_keywords.search(line):
            # Clean up noise (timestamps, etc.)
            clean = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4},?\s*\d{1,2}:\d{2}\s*[AP]M', '', line).strip()
            if clean:
                institution = clean
                break
    # Fallback: first non-boilerplate line
    if institution == "Unknown":
        for line in full_text.split('\n'):
            line = line.strip()
            if (line and 'transcript' not in line.lower()
                    and 'academic' not in line.lower()
                    and not line.startswith('(')
                    and not header_labels.match(line)):
                institution = line
                break

    # ── 4. Extract NAME ──────────────────────────────────────────────
    # Pattern 1: "Name Birth Date\n<FullName> <DD-MON>"  (Banner standard)
    # Pattern 2: "<Name>,\n<First>." or "<Last>, <First>." header style
    name_match = re.search(
        r'Name\s+Birth\s+Date\n(.+?)\s+\d{2}-[A-Z]{3}', full_text
    )
    if not name_match:
        # Web self-service format: "Name Birth Date" then name on next line
        name_match = re.search(
            r'Name\s+Birth\s+Date\s*\n\s*(.+?)\s+\d{2}-[A-Z]{3}', full_text
        )
    if not name_match:
        # Some transcripts: "<Last>, <First>\nStudent Academic Transcript"
        name_match = re.search(
            r'^([A-Z][a-z]+,\s*[A-Z][a-z]+\.?)', full_text, re.MULTILINE
        )
    name = name_match.group(1).strip() if name_match else "Unknown"

    # ── 5. Extract MAJOR and MINOR ───────────────────────────────────
    # Try several patterns used by different Banner configurations:

    # Pattern A: "Primary Degree\nMajor\n<value>" or
    #            "Primary Degree\nMajor Minor\n<value1> <value2>"
    major = "Unknown"
    minor = None

    # Check for "Primary Degree" → "Major [Minor] [Major Concentration]" block
    primary_header = re.search(
        r'Primary\s+Degree\s*\n'
        r'(Major(?:\s+Minor)?(?:\s+Major\s+Concentration)?)\s*\n'
        r'(.+)',
        full_text
    )
    if primary_header:
        header_line = primary_header.group(1).strip()
        value_line = primary_header.group(2).strip()
        has_minor_field = 'Minor' in header_line

        # Try splitting by 2+ spaces first (works for well-spaced PDFs)
        value_fields = re.split(r'\s{2,}', value_line)
        if len(value_fields) >= 2 and has_minor_field:
            major = value_fields[0].strip()
            minor = value_fields[1].strip()
        elif has_minor_field:
            # Spacing was lost — use word-level positions to split columns.
            # Find the x-position of the "Minor" header word, then split
            # the value row at that x-position.
            minor_x = None
            for w in all_words:
                if w['text'] == 'Minor':
                    minor_x = w['x0']
                    break
            if minor_x is not None:
                # Find all words on the value line (same vertical position)
                # by finding words near the "Primary Degree" label's y-position + offset
                major_words = []
                minor_words = []
                primary_y = None
                for w in all_words:
                    if w['text'] == 'Primary':
                        primary_y = w['top']
                        break
                if primary_y is not None:
                    # Value line is ~2 lines below the Primary Degree header
                    for w in all_words:
                        # Check if this word is on the value line (between header rows)
                        if abs(w['top'] - (primary_y + 50)) < 20:  # approximate
                            pass  # we'll use a different approach
                    # More robust: find words that appear right after "Primary Degree" → "Major Minor" line
                    # Group all_words by approximate y-position (top)
                    from collections import defaultdict
                    y_groups = defaultdict(list)
                    for w in all_words:
                        # Round to nearest 2 pixels to group words on the same line
                        y_key = round(w['top'] / 2) * 2
                        y_groups[y_key].append(w)
                    # Find the line containing "Minor"
                    minor_line_y = None
                    for y_key, words in sorted(y_groups.items()):
                        texts = [w['text'] for w in words]
                        if 'Minor' in texts and 'Major' in texts:
                            minor_line_y = y_key
                            break
                    if minor_line_y is not None:
                        # The value line is the very next y-group
                        sorted_ys = sorted(y_groups.keys())
                        val_idx = sorted_ys.index(minor_line_y) + 1
                        if val_idx < len(sorted_ys):
                            val_line_words = sorted(y_groups[sorted_ys[val_idx]], key=lambda w: w['x0'])
                            major_words = [w['text'] for w in val_line_words if w['x0'] < minor_x - 5]
                            minor_words = [w['text'] for w in val_line_words if w['x0'] >= minor_x - 5]
                            if major_words:
                                major = ' '.join(major_words)
                            if minor_words:
                                minor = ' '.join(minor_words)
            if major == "Unknown":
                # Last resort: take the whole line as major
                major = value_line
        else:
            major = value_fields[0].strip()

    if major == "Unknown":
        # Pattern B: "College Major [Minor]\n<college>  <major>  [<minor>]"
        col_header = re.search(
            r'College\s+Major(?:\s+(Minor|Concentration))?\s*\n'
            r'(.+)',
            full_text
        )
        if col_header:
            has_minor_col = col_header.group(1) is not None
            value_line = col_header.group(2).strip()
            parts = re.split(r'\s{2,}', value_line)
            # First part is college name, second is major
            if len(parts) >= 2:
                major = parts[1].strip()
            if has_minor_col and len(parts) >= 3:
                minor = parts[2].strip()

    if major == "Unknown":
        # Pattern C: "Major\n<value>" standalone
        major_match = re.search(r'\bMajor\s*\n\s*(.+)', full_text)
        if major_match:
            major = major_match.group(1).strip()

    # ── 6. Determine YEAR (classification) ────────────────────────────
    # Find "Overall" totals line — works across institutions:
    #   "Overall  108.000  108.000  108.000  105.00  388.00  3.70"
    earned_hours = 0.0
    # Try multiple patterns for the "Overall" totals line
    overall_match = re.search(
        r'Overall\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)', full_text
    )
    if overall_match:
        # 3rd number is typically "Earned Hours"
        earned_hours = float(overall_match.group(3))
    else:
        # Fallback: look for cumulative totals in the last term block
        cum_matches = list(re.finditer(
            r'Cumulative\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)', full_text
        ))
        if cum_matches:
            last_cum = cum_matches[-1]
            earned_hours = float(last_cum.group(3))

    if earned_hours >= 90:
        year = "Senior"
    elif earned_hours >= 60:
        year = "Junior"
    elif earned_hours >= 30:
        year = "Sophomore"
    elif earned_hours > 0:
        year = "Freshman"
    else:
        year = "Unknown"

    # ── 7. Extract COURSES ────────────────────────────────────────────
    classes = []

    # --- 7a. Transfer credits ---
    # Find transfer credit sections (case-insensitive)
    transfer_section = re.search(
        r'TRANSFER\s+CREDIT\s+ACCEPTED\s+BY\s+INSTITUTION\s*\n'
        r'(.+?)'
        r'(?=INSTITUTION\s+CREDIT|Transcript\s+Totals|TRANSCRIPT\s+TOTALS|$)',
        full_text, re.DOTALL | re.IGNORECASE
    )
    if transfer_section:
        transfer_text = transfer_section.group(1)

        # Transfer courses: SUBJECT COURSE TITLE GRADE CREDITS QUALITY_POINTS
        transfer_pattern = re.compile(
            r'^([A-Z]{2,5})\s+'                    # Subject (2-5 uppercase letters)
            r'(\d{1,3}[A-Z]{0,3})\s+'              # Course number (e.g., 210, 3XX, 1XX)
            r'(.+?)\s+'                             # Title
            r'([A-F][+-]?|P|TCR)\s+'                # Grade
            r'(\d+\.\d{3})\s+'                      # Credit hours
            r'(\d+\.\d{2})',                        # Quality points
            re.MULTILINE
        )
        for match in transfer_pattern.finditer(transfer_text):
            title = match.group(3).strip()
            # Skip header lines that got caught
            if title in ('Title', 'Subject') or 'Attempt Hours' in title:
                continue
            classes.append({
                'course': f"{match.group(1)} {match.group(2)}",
                'title': title,
                'grade': match.group(4).strip(),
                'credits': float(match.group(5)),
                'term': "Transfer",
            })

    # --- 7b. Institution (completed) courses ---
    # Split by "Term:" or "Term :" headers
    term_blocks = re.split(r'(?=Term\s*:\s+)', full_text)

    # Locate where "COURSE(S) IN PROGRESS" section starts
    in_progress_idx = full_text.upper().find("COURSE(S) IN PROGRESS")

    for block in term_blocks:
        term_match = re.search(r'Term\s*:\s+(.+)', block)
        if not term_match:
            continue
        term_name = term_match.group(1).strip()

        # Determine if this block is inside the in-progress section
        block_start = full_text.find(block)
        is_in_progress = (in_progress_idx != -1 and block_start >= in_progress_idx)

        if is_in_progress:
            # In-progress courses — various formats:
            # Format 1 (Roosevelt): "SUBJECT COURSE CAMPUS LEVEL TITLE CREDITS"
            # Format 2 (NEIU):      "SUBJECT COURSE LEVEL TITLE CREDITS"
            ip_pattern = re.compile(
                r'^([A-Z]{1,5})\s+'                  # Subject
                r'(\d{1,3}[A-Z]?)\s+'                # Course number
                r'(?:(?:CHICAGO\s+CAMPUS|ONLINE(?:\s+CAMPUS)?|false)\s+)?'  # Optional campus
                r'(?:U(?:G)?|G)\s+'                   # Level (U, UG, G)
                r'(.+?)\s+'                            # Title
                r'(\d+\.\d{3})\s*$',                   # Credits
                re.MULTILINE
            )
            for match in ip_pattern.finditer(block):
                title = match.group(3).strip()
                if title in ('Title',) or 'Attempt' in title:
                    continue
                classes.append({
                    'course': f"{match.group(1)} {match.group(2)}",
                    'title': title,
                    'grade': "In Progress",
                    'credits': float(match.group(4)),
                    'term': term_name,
                })

            # Some transcripts have in-progress courses with broken line wrapping
            # where credits appear on same line as subject: "ECON 217 UG Principl3es.000"
            # We handle those by a more relaxed fallback
            if not any(c['term'] == term_name for c in classes):
                ip_fallback = re.compile(
                    r'^([A-Z]{1,5})\s+'
                    r'(\d{1,3}[A-Z]?)\s+'
                    r'(?:U(?:G)?|G)\s+'
                    r'(.+?)(\d+\.\d{3})',
                    re.MULTILINE
                )
                for match in ip_fallback.finditer(block):
                    title = match.group(3).strip()
                    classes.append({
                        'course': f"{match.group(1)} {match.group(2)}",
                        'title': title,
                        'grade': "In Progress",
                        'credits': float(match.group(4)),
                        'term': term_name,
                    })
        else:
            # Completed courses with grades
            # This pattern covers multiple campus/level formats:
            #   "CST 280 CHICAGO U INTRODUCTION ... B- 3.000 8.01"
            #   "CS 100 false UG Computers and Society A 3.000 12.00"
            #   "CST 280 CHICAGO CAMPUS U INTRODUCTION ... B- 3.000 8.01"
            #   "CST 280     CHICAGO    U  TITLE    A   3.000  12.00"
            #                CAMPUS
            course_pattern = re.compile(
                r'^([A-Z]{1,5})\s+'                          # Subject
                r'(\d{1,3}[A-Z]?)\s+'                        # Course number
                r'(?:'
                    r'(?:CHICAGO\s+(?:CAMPUS\s+)?|ONLINE\s+(?:CAMPUS\s+)?|false\s+)'  # Campus
                    r'(?:U(?:G)?|G)\s+'                      # Level
                r')?'
                r'(.+?)\s+'                                  # Title (greedy-lazy)
                r'([A-F][+-]?|P|W|WP|WF|I|IP|TCR)\s+'       # Grade
                r'(\d+\.\d{3})\s+'                           # Credit hours
                r'(\d+\.\d{2})',                              # Quality points
                re.MULTILINE
            )

            for match in course_pattern.finditer(block):
                title = match.group(3).strip()
                # Filter out header/noise lines
                if title in ('Title', 'Subject') or 'Attempt' in title:
                    continue
                # Clean up multi-line campus text that may have bled into title
                title = re.sub(r'^CAMPUS\s+', '', title)
                classes.append({
                    'course': f"{match.group(1)} {match.group(2)}",
                    'title': title,
                    'grade': match.group(4).strip(),
                    'credits': float(match.group(5)),
                    'term': term_name,
                })

    # ── 8. Handle multi-line titles (CAMPUS wrapping) ─────────────────
    # Roosevelt transcripts often wrap:
    #   "CST 280 CHICAGO U INTRODUCTION TO B- 3.000 8.01"
    #   "CAMPUS ALGORITHMS"
    # The second line "CAMPUS ALGORITHMS" means campus label bled onto next line.
    # We already handle this via regex, but some titles may be truncated.
    # Let's do a second pass on the raw text to catch wrapped titles.
    lines = full_text.split('\n')
    for i, cls in enumerate(classes):
        if cls['grade'] == "In Progress" or cls['term'] == "Transfer":
            continue
        # Find where this course appears in full_text
        course_parts = cls['course'].split()
        subj, num = course_parts[0], course_parts[1]
        # Look for the course line in full text, then check the next line
        pattern = re.compile(
            rf'^{re.escape(subj)}\s+{re.escape(num)}\s+.+{re.escape(cls["grade"])}\s+',
            re.MULTILINE
        )
        match = pattern.search(full_text)
        if match:
            line_end = full_text.find('\n', match.start())
            if line_end != -1 and line_end + 1 < len(full_text):
                next_line = full_text[line_end + 1: full_text.find('\n', line_end + 1)]
                next_line = next_line.strip()
                # If next line starts with "CAMPUS " and has more text,
                # that text is the continuation of the title
                campus_cont = re.match(r'^CAMPUS\s+(.+)', next_line)
                if campus_cont:
                    continuation = campus_cont.group(1).strip()
                    # Don't append if it looks like a header or new course
                    if not re.match(r'^[A-Z]{2,5}\s+\d', continuation):
                        cls['title'] = cls['title'] + " " + continuation

    return {
        'name': name,
        'institution': institution,
        'major': major,
        'minor': minor,
        'year': year,
        'classes': classes,
    }


def print_transcript_summary(data):
    """Pretty-print the extracted transcript data."""
    print("=" * 64)
    print(f"  Institution: {data.get('institution', 'N/A')}")
    print(f"  Name:        {data['name']}")
    print(f"  Major:       {data['major']}")
    if data.get('minor'):
        print(f"  Minor:       {data['minor']}")
    print(f"  Year:        {data['year']}")
    print("=" * 64)

    total_credits = 0
    # Group by term
    terms = {}
    for c in data['classes']:
        terms.setdefault(c['term'], []).append(c)

    for term, courses in terms.items():
        print(f"\n  ── {term} ──")
        for c in courses:
            print(f"    {c['course']:<12} {c['title']:<40} {c['grade']:<12} {c['credits']:.1f} cr")
            total_credits += c['credits']

    print(f"\n{'=' * 64}")
    print(f"  Total Classes: {len(data['classes'])}")
    print(f"  Total Credits: {total_credits:.1f}")
    print("=" * 64)


if __name__ == "__main__":
    import sys
    import glob

    # Accept a PDF path as argument, or process all PDFs in current directory
    if len(sys.argv) > 1:
        pdf_files = sys.argv[1:]
    else:
        pdf_files = glob.glob("*.pdf") + glob.glob("**/*.pdf", recursive=True)

    if not pdf_files:
        print("Usage: python pdf_reader.py <transcript.pdf> [transcript2.pdf ...]")
        print("   Or run in a directory containing PDF files.")
        sys.exit(1)

    for pdf_path in pdf_files:
        print(f"\n{'▓' * 64}")
        print(f"  Processing: {pdf_path}")
        print(f"{'▓' * 64}")
        try:
            data = extract_transcript_data(pdf_path)
            print_transcript_summary(data)
        except Exception as e:
            print(f"  ⚠ Error processing {pdf_path}: {e}")