import pandas as pd
import os
from datetime import datetime

# ─────────────────────────────────────────────
#  DATA LOADING
# ─────────────────────────────────────────────

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "project_files", "Proj", "csv_exports")

def load_data():
    """Load all CSVs into DataFrames."""
    courses        = pd.read_csv(f"{BASE_DIR}/courses.csv")
    knowledge_units = pd.read_csv(f"{BASE_DIR}/knowledge_units.csv")
    course_ku      = pd.read_csv(f"{BASE_DIR}/course_ku.csv")
    institutions   = pd.read_csv(f"{BASE_DIR}/institutions.csv")
    programs       = pd.read_csv(f"{BASE_DIR}/programs.csv")
    students       = pd.read_csv(f"{BASE_DIR}/students.csv")
    users          = pd.read_csv(f"{BASE_DIR}/users.csv")
    course_match   = pd.read_csv(f"{BASE_DIR}/course_match.csv")
    match_history  = pd.read_csv(f"{BASE_DIR}/match_history.csv")
    return (courses, knowledge_units, course_ku, institutions,
            programs, students, users, course_match, match_history)


# ─────────────────────────────────────────────
#  KU RETRIEVAL  (FR2 & FR3)
# ─────────────────────────────────────────────

def get_ku_ids_for_course(course_id, course_ku):
    """Return the set of KU IDs mapped to a given course."""
    rows = course_ku[course_ku["course_id"] == course_id]
    return set(rows["ku_id"].tolist())


# ─────────────────────────────────────────────
#  COVERAGE SCORING  (FR4)
#
#  Coverage = |KU_source ∩ KU_target| / |KU_target|
# ─────────────────────────────────────────────

def compute_coverage(source_ku_ids, target_ku_ids):
    """
    Compute KU coverage score between source and target course.
    Returns a float between 0.0 and 1.0.
    Returns 0.0 if target has no KUs mapped.
    """
    if not target_ku_ids:
        return 0.0
    intersection = source_ku_ids & target_ku_ids
    return len(intersection) / len(target_ku_ids)


# ─────────────────────────────────────────────
#  MATCH CLASSIFICATION  (FR5 & FR7)
# ─────────────────────────────────────────────

def classify_match(coverage_score):
    """
    Convert a coverage score into a 3-tier match status.
      >= 0.80  →  Full Transfer
      >= 0.40  →  Partial Transfer
      <  0.40  →  No Transfer
    """
    if coverage_score >= 0.80:
        return "Full Transfer"
    elif coverage_score >= 0.40:
        return "Partial Transfer"
    else:
        return "No Transfer"


# ─────────────────────────────────────────────
#  POLICY CONSTRAINT CHECK  (FR6)
# ─────────────────────────────────────────────

def check_policy(source_course, target_course):
    """
    Enforce institutional policies:
      1. Credit hours: source must have >= target credits
      2. Course level: source level must be within 100 of target level
    Returns (passes: bool, reasons: list[str])
    """
    issues = []

    # Credit check
    src_credits = source_course["credits"]
    tgt_credits = target_course["credits"]
    if src_credits < tgt_credits:
        issues.append(
            f"Insufficient credits: source has {src_credits}, target requires {tgt_credits}"
        )

    # Level check (extract numeric part of course code, e.g. CSIA 317 → 317)
    def extract_level(code):
        import re
        nums = re.findall(r"\d+", str(code))
        return int(nums[0]) if nums else 100

    src_level = extract_level(source_course["course_code"])
    tgt_level = extract_level(target_course["course_code"])
    if abs(src_level - tgt_level) > 100:
        issues.append(
            f"Level mismatch: source level ~{src_level}, target level ~{tgt_level}"
        )

    return (len(issues) == 0), issues


# ─────────────────────────────────────────────
#  EXPLANATION GENERATOR  (FR8)
# ─────────────────────────────────────────────

def generate_explanation(source_ku_ids, target_ku_ids, knowledge_units, policy_issues):
    """
    Build a human-readable explanation for a match result.
    Shows matched KUs, missing KUs, and any policy flags.
    """
    matched_ku_ids = source_ku_ids & target_ku_ids
    missing_ku_ids = target_ku_ids - source_ku_ids

    def ku_names(ku_ids):
        rows = knowledge_units[knowledge_units["ku_id"].isin(ku_ids)]
        return rows["ku_name"].tolist()

    matched_names = ku_names(matched_ku_ids)
    missing_names = ku_names(missing_ku_ids)

    explanation = {}
    explanation["matched_kus"]  = matched_names
    explanation["missing_kus"]  = missing_names
    explanation["policy_flags"] = policy_issues if policy_issues else ["None"]
    return explanation


# ─────────────────────────────────────────────
#  CORE MATCHING FUNCTION  (FR5)
# ─────────────────────────────────────────────

def match_course(source_course_id, target_course_id,
                 courses, course_ku, knowledge_units):
    """
    Evaluate whether a source course can transfer to satisfy a target course.
    Returns a result dict with score, status, policy info, and explanation.
    """
    source_course = courses[courses["course_id"] == source_course_id].iloc[0]
    target_course = courses[courses["course_id"] == target_course_id].iloc[0]

    # KU retrieval
    source_ku_ids = get_ku_ids_for_course(source_course_id, course_ku)
    target_ku_ids = get_ku_ids_for_course(target_course_id, course_ku)

    # Coverage score
    score = compute_coverage(source_ku_ids, target_ku_ids)

    # Match classification
    status = classify_match(score)

    # Policy check
    policy_pass, policy_issues = check_policy(source_course, target_course)

    # Downgrade if policy fails
    if not policy_pass and status == "Full Transfer":
        status = "Partial Transfer"

    # Explanation
    explanation = generate_explanation(
        source_ku_ids, target_ku_ids, knowledge_units, policy_issues
    )

    # Flag for human review if partial or policy issues exist
    needs_review = (status == "Partial Transfer") or (not policy_pass)

    return {
        "source_course_id":   source_course_id,
        "target_course_id":   target_course_id,
        "source_course_name": source_course["course_name"],
        "target_course_name": target_course["course_name"],
        "source_code":        source_course["course_code"],
        "target_code":        target_course["course_code"],
        "source_credits":     source_course["credits"],
        "target_credits":     target_course["credits"],
        "coverage_score":     round(score, 3),
        "match_status":       status,
        "policy_pass":        policy_pass,
        "policy_issues":      policy_issues,
        "needs_review":       needs_review,
        "explanation":        explanation,
    }


# ─────────────────────────────────────────────
#  STUDENT EVALUATION REPORT  (FR7)
# ─────────────────────────────────────────────

def evaluate_student_transfer(student_id, target_program_id,
                               courses, course_ku, knowledge_units,
                               students, programs):
    """
    Given a student and a target program, evaluate all possible
    course transfer matches and return a full report.
    """
    # Get student's institution
    student_row = students[students["student_id"] == student_id]
    if student_row.empty:
        print(f"Student {student_id} not found.")
        return []

    source_institution_id = student_row.iloc[0]["institution_id"]
    source_program_id     = student_row.iloc[0]["program_id"]

    # Source courses (from student's institution/program)
    source_courses = courses[
        (courses["institution_id"] == source_institution_id) &
        (courses["program_id"] == source_program_id)
    ]

    # Target courses (from target program)
    target_program_row = programs[programs["program_id"] == target_program_id]
    if target_program_row.empty:
        print(f"Target program {target_program_id} not found.")
        return []

    target_institution_id = target_program_row.iloc[0]["institution_id"]
    target_courses = courses[
        (courses["institution_id"] == target_institution_id) &
        (courses["program_id"] == target_program_id)
    ]

    results = []

    for _, src in source_courses.iterrows():
        best_result = None
        best_score  = -1

        for _, tgt in target_courses.iterrows():
            result = match_course(
                src["course_id"], tgt["course_id"],
                courses, course_ku, knowledge_units
            )
            if result["coverage_score"] > best_score:
                best_score  = result["coverage_score"]
                best_result = result

        if best_result and best_result["coverage_score"] > 0:
            results.append(best_result)

    return results


# ─────────────────────────────────────────────
#  SAVE RESULTS TO CSV  (simulates DB write)
# ─────────────────────────────────────────────

def save_results_to_csv(results, course_match, match_history):
    """
    Append new match results to course_match and log to match_history.
    Saves updated CSVs back to csv_exports/.
    """
    if not results:
        print("No results to save.")
        return

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Get next match_id
    next_match_id = (course_match["match_id"].max() + 1
                     if not course_match.empty else 1)

    new_matches  = []
    new_history  = []

    for i, r in enumerate(results):
        match_id = next_match_id + i

        # Build course_match row
        new_matches.append({
            "match_id":         match_id,
            "institution_from": None,   # would be filled from student data
            "institution_to":   None,
            "course_from":      r["source_course_id"],
            "course_to":        r["target_course_id"],
            "match_status":     r["match_status"],
            "created_at":       now,
        })

        # Build match_history row
        new_history.append({
            "log_id":      match_id,
            "match_id":    match_id,
            "changed_by":  "system",
            "change_type": "auto_evaluated",
            "change_date": now,
        })

    # Append and save
    updated_matches = pd.concat(
        [course_match, pd.DataFrame(new_matches)], ignore_index=True
    )
    updated_history = pd.concat(
        [match_history, pd.DataFrame(new_history)], ignore_index=True
    )

    updated_matches.to_csv(f"{BASE_DIR}/course_match.csv",   index=False)
    updated_history.to_csv(f"{BASE_DIR}/match_history.csv",  index=False)

    print(f"\n✅ Saved {len(new_matches)} matches to course_match.csv")
    print(f"✅ Saved {len(new_history)} entries to match_history.csv")


# ─────────────────────────────────────────────
#  PRINT REPORT
# ─────────────────────────────────────────────

def print_report(results, student_id):
    """Print a clean evaluation report to the console."""
    print("\n" + "=" * 65)
    print(f"  TRANSFER CREDIT EVALUATION REPORT — Student ID: {student_id}")
    print("=" * 65)

    if not results:
        print("  No transfer matches found.")
        return

    full     = [r for r in results if r["match_status"] == "Full Transfer"]
    partial  = [r for r in results if r["match_status"] == "Partial Transfer"]
    none_    = [r for r in results if r["match_status"] == "No Transfer"]

    def print_section(title, items):
        if not items:
            return
        print(f"\n  {title}")
        print("  " + "-" * 60)
        for r in items:
            print(f"  [{r['source_code']}] {r['source_course_name']}")
            print(f"    → [{r['target_code']}] {r['target_course_name']}")
            print(f"    Coverage Score : {r['coverage_score'] * 100:.1f}%")
            print(f"    Credits        : {r['source_credits']} → {r['target_credits']}")
            print(f"    Policy Pass    : {'✅ Yes' if r['policy_pass'] else '⚠️  No'}")
            if r["policy_issues"]:
                for issue in r["policy_issues"]:
                    print(f"    ⚠️  {issue}")
            print(f"    Matched KUs    : {', '.join(r['explanation']['matched_kus']) or 'None'}")
            if r["explanation"]["missing_kus"]:
                print(f"    Missing KUs    : {', '.join(r['explanation']['missing_kus'])}")
            if r["needs_review"]:
                print(f"    🔍 Flagged for human review")
            print()

    print_section("✅ FULL TRANSFER",    full)
    print_section("⚠️  PARTIAL TRANSFER", partial)
    print_section("❌ NO TRANSFER",      none_)

    print("=" * 65)
    print(f"  Summary: {len(full)} Full | {len(partial)} Partial | {len(none_)} No Transfer")
    print("=" * 65 + "\n")


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    print("🚀 Sprint 3 — KU-Based Transfer Credit Matcher")
    print("=" * 65)

    # Load data
    (courses, knowledge_units, course_ku, institutions,
     programs, students, users, course_match, match_history) = load_data()

    print(f"✅ Loaded {len(courses)} courses, {len(knowledge_units)} KUs, "
          f"{len(course_ku)} KU mappings")

    # ── Demo: direct course-pair evaluations using real KU overlaps ──
    demo_pairs = [
        (23, 24, "CSIA 359 → CSIA 368  [shares KU: Web Application Security]"),
        (13, 24, "CSIA 317 → CSIA 368  [shares KU: IT Systems Components]"),
        (25, 23, "CSIA 399 → CSIA 359  [shares KU: Cybersecurity Ethics]"),
        (11, 13, "CSIA 261 → CSIA 317  [shares KU: Low Level Programming]"),
        (5,  3,  "CSIA 150 → IT101     [no KU overlap]"),
        (1,  4,  "CS101    → SD102     [no KU overlap]"),
    ]

    print("\n🔬 Course-Pair Evaluation Demo")
    print("=" * 65)

    demo_results = []
    for src_id, tgt_id, label in demo_pairs:
        r = match_course(src_id, tgt_id, courses, course_ku, knowledge_units)
        demo_results.append(r)
        status_icon = {"Full Transfer": "✅", "Partial Transfer": "⚠️ ", "No Transfer": "❌"}
        icon = status_icon[r["match_status"]]
        print(f"\n  {label}")
        print(f"  {icon} {r['match_status']}  |  Coverage: {r['coverage_score']*100:.1f}%"
              f"  |  Policy: {'✅' if r['policy_pass'] else '⚠️'}")
        if r["explanation"]["matched_kus"]:
            print(f"     Matched KUs : {', '.join(r['explanation']['matched_kus'])}")
        if r["explanation"]["missing_kus"]:
            print(f"     Missing KUs : {', '.join(r['explanation']['missing_kus'])}")
        if r["policy_issues"]:
            for issue in r["policy_issues"]:
                print(f"     ⚠️  {issue}")

    print("\n" + "=" * 65)
    save_results_to_csv(demo_results, course_match, match_history)


if __name__ == "__main__":
    main()
