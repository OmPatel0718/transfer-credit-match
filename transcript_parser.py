"""
Sprint 2 — Transcript Parser
TransferPro | CST 378 Software Engineering

Flow:
  PDF transcript
      ↓
  pdfplumber  (extract raw text)
      ↓
  Gemini API  (parse into structured courses)
      ↓
  MySQL       (insert into TransferPro DB)
      ↓
  Sprint 3 Matcher (KU-based evaluation)
"""

import os
import re
import json
import pdfplumber
import mysql.connector
import google.generativeai as genai
from datetime import datetime


# ─────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────

# Set your Gemini API key as an environment variable:
#   Mac/Linux:  export GEMINI_API_KEY="your_key_here"
#   Windows:    set GEMINI_API_KEY=your_key_here
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

DB_CONFIG = {
    "host":     "127.0.0.1",
    "port":     3306,
    "user":     "appuser",
    "password": "apppass",
    "database": "TransferPro",
}


# ─────────────────────────────────────────────
#  STEP 1 — EXTRACT TEXT FROM PDF
# ─────────────────────────────────────────────

def extract_text_from_pdf(pdf_path):
    """
    Use pdfplumber to extract all text from a transcript PDF.
    Returns the full raw text as a single string.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    print(f"📄 Reading PDF: {pdf_path}")
    full_text = ""

    with pdfplumber.open(pdf_path) as pdf:
        print(f"   Pages found: {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
                print(f"   ✅ Page {i + 1}: extracted {len(page_text)} characters")
            else:
                print(f"   ⚠️  Page {i + 1}: no text found (scanned image?)")

    if not full_text.strip():
        raise ValueError(
            "No text could be extracted from the PDF. "
            "It may be a scanned image — OCR support coming in a future sprint."
        )

    print(f"   Total text extracted: {len(full_text)} characters\n")
    return full_text


# ─────────────────────────────────────────────
#  STEP 2 — PARSE COURSES WITH GEMINI
# ─────────────────────────────────────────────

def parse_courses_with_gemini(transcript_text):
    """
    Send raw transcript text to Gemini and get back a structured
    list of courses as JSON.

    Returns a list of dicts:
      [{ "course_code": "CS101",
         "course_name": "Intro to Programming",
         "credits": 3,
         "grade": "A" }, ...]
    """
    if not GEMINI_API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set.\n"
            "Run: export GEMINI_API_KEY='your_key_here'"
        )

    print("🤖 Sending transcript to Gemini for parsing...")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
You are an academic transcript parser.

Extract all completed courses from the transcript below.

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.
Each object must have exactly these fields:
  - course_code  (string, e.g. "CS101")
  - course_name  (string, e.g. "Introduction to Programming")
  - credits      (number, e.g. 3)
  - grade        (string, e.g. "A", "B+", "C", "P", or "N/A" if missing)

If a field is missing from the transcript, use null for that field.
Do not include courses with a grade of W (withdrawn) or IP (in progress).

Transcript:
{transcript_text}
"""

    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences if Gemini wraps in ```json ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        courses = json.loads(raw)
        print(f"   ✅ Gemini parsed {len(courses)} courses\n")
        return courses
    except json.JSONDecodeError as e:
        print(f"   ❌ Failed to parse Gemini response as JSON: {e}")
        print(f"   Raw response:\n{raw}")
        raise


# ─────────────────────────────────────────────
#  STEP 3 — VALIDATE & CLEAN COURSES
# ─────────────────────────────────────────────

def validate_courses(raw_courses):
    """
    Clean and validate the parsed course list.
    - Ensures required fields exist
    - Converts credits to float
    - Filters out invalid entries
    """
    cleaned = []
    for c in raw_courses:
        course_code = str(c.get("course_code") or "").strip()
        course_name = str(c.get("course_name") or "").strip()
        grade       = str(c.get("grade") or "N/A").strip()

        try:
            credits = float(c.get("credits") or 0)
        except (ValueError, TypeError):
            credits = 0.0

        if not course_code or not course_name:
            print(f"   ⚠️  Skipping invalid entry: {c}")
            continue

        cleaned.append({
            "course_code": course_code,
            "course_name": course_name,
            "credits":     credits,
            "grade":       grade,
        })

    print(f"✅ Validated {len(cleaned)} courses (dropped "
          f"{len(raw_courses) - len(cleaned)} invalid)\n")
    return cleaned


# ─────────────────────────────────────────────
#  STEP 4 — INSERT INTO MYSQL
# ─────────────────────────────────────────────

def insert_courses_to_db(courses, institution_id, program_id):
    """
    Insert parsed courses into the TransferPro database.
    Skips courses that already exist (same code + institution).
    Returns list of inserted course_ids.
    """
    print("💾 Connecting to MySQL...")
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    inserted_ids = []
    skipped      = 0
    now          = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for course in courses:
        # Check if course already exists
        cursor.execute(
            "SELECT course_id FROM courses "
            "WHERE course_code = %s AND institution_id = %s",
            (course["course_code"], institution_id)
        )
        existing = cursor.fetchone()

        if existing:
            print(f"   ⏭️  Already exists: {course['course_code']} — skipping")
            inserted_ids.append(existing[0])
            skipped += 1
            continue

        # Insert new course
        cursor.execute(
            """INSERT INTO courses
               (institution_id, program_id, course_name, course_code, credits, created_at)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (institution_id,
             program_id,
             course["course_name"],
             course["course_code"],
             course["credits"],
             now)
        )
        course_id = cursor.lastrowid
        inserted_ids.append(course_id)
        print(f"   ✅ Inserted: [{course['course_code']}] "
              f"{course['course_name']} ({course['credits']} cr) → ID {course_id}")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n✅ Done: {len(inserted_ids) - skipped} inserted, "
          f"{skipped} already existed\n")
    return inserted_ids


# ─────────────────────────────────────────────
#  STEP 5 — CREATE TRANSFER REQUESTS
# ─────────────────────────────────────────────

def create_transfer_request(student_id, source_course_ids, target_institution):
    """
    Create transfer request entries in the DB for each parsed course.
    These will be evaluated by the Sprint 3 KU matcher.
    """
    print("📋 Creating transfer requests...")
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    now    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Get student's institution
    cursor.execute(
        "SELECT institution_id FROM students WHERE student_id = %s",
        (student_id,)
    )
    row = cursor.fetchone()
    if not row:
        print(f"   ❌ Student ID {student_id} not found in DB")
        conn.close()
        return

    source_institution = row[0]

    for course_id in source_course_ids:
        cursor.execute(
            """INSERT INTO transfer_requests
               (student_id, course_from, course_to,
                institution_from, institution_to, status, request_date)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (student_id,
             course_id,
             None,
             source_institution,
             target_institution,
             "Pending",
             now)
        )
        print(f"   ✅ Transfer request created for course_id {course_id}")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"\n✅ {len(source_course_ids)} transfer requests created\n")


# ─────────────────────────────────────────────
#  PRINT PARSED COURSES
# ─────────────────────────────────────────────

def print_parsed_courses(courses):
    """Print a clean table of parsed courses."""
    print("\n" + "=" * 65)
    print("  PARSED TRANSCRIPT COURSES")
    print("=" * 65)
    print(f"  {'Code':<12} {'Credits':<9} {'Grade':<7} Course Name")
    print("  " + "-" * 60)
    for c in courses:
        print(f"  {c['course_code']:<12} {c['credits']:<9} "
              f"{c['grade']:<7} {c['course_name']}")
    print("=" * 65 + "\n")


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    print("🚀 Sprint 2 — Transcript Parser")
    print("=" * 65)

    # ── CONFIG: update these for each student ──────────────────────
    PDF_PATH           = "transcript.pdf"   # path to the student's PDF
    STUDENT_ID         = 1                  # student_id in your DB
    INSTITUTION_ID     = 1                  # source institution (Roosevelt = 1)
    PROGRAM_ID         = 9                  # source program
    TARGET_INSTITUTION = 4                  # institution transferring TO
    # ───────────────────────────────────────────────────────────────

    # Step 1: Extract text from PDF
    transcript_text = extract_text_from_pdf(PDF_PATH)

    # Step 2: Parse with Gemini
    raw_courses = parse_courses_with_gemini(transcript_text)

    # Step 3: Validate
    courses = validate_courses(raw_courses)

    # Step 4: Display
    print_parsed_courses(courses)

    # Step 5: Insert into DB
    course_ids = insert_courses_to_db(courses, INSTITUTION_ID, PROGRAM_ID)

    # Step 6: Create transfer requests
    create_transfer_request(STUDENT_ID, course_ids, TARGET_INSTITUTION)

    print("🎯 Sprint 2 complete!")
    print("   Next: run sprint3_matcher.py to evaluate KU-based transfer matches.")


if __name__ == "__main__":
    main()
