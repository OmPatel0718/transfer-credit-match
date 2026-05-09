================================================================================
  TRANSFER CREDIT MATCH — Data Science Branch
  Proof of Concept Documentation
================================================================================

BRANCH: Data_Science
LAST UPDATED: April 2026
TEAM ROLE: Data Science / Database Pipeline

--------------------------------------------------------------------------------
OVERVIEW
--------------------------------------------------------------------------------

This branch contains the Data Science layer of the Transfer Credit Match system.
The goal of this component is to support intelligent course-to-course matching
across institutions using structured academic data, knowledge unit (KU) mappings,
and a PDF transcript parser.

The system helps students who transfer between Chicago-area colleges identify
which courses they have already completed and which ones may satisfy requirements
at their destination institution.

--------------------------------------------------------------------------------
FOLDER STRUCTURE
--------------------------------------------------------------------------------

Data_Science/
├── readme.txt                   ← You are here
├── TranscriptPDF_reader/
│   └── pdf_reader.py            ← PDF transcript parser script
└── csv_exports/
    ├── institutions.csv         ← Participating institutions
    ├── programs.csv             ← Academic programs per institution
    ├── courses.csv              ← Course catalog across institutions
    ├── knowledge_units.csv      ← KU taxonomy (CAE-aligned)
    ├── course_ku.csv            ← Course ↔ KU mapping (many-to-many)
    ├── students.csv             ← Student enrollment records
    ├── transfer_requests.csv    ← Student-submitted transfer requests
    ├── course_match.csv         ← Matched course pairs (with status)
    ├── match_history.csv        ← Historical match audit log
    ├── admins.csv               ← Admin user records
    ├── directors.csv            ← Program director records
    └── users.csv                ← All system users

--------------------------------------------------------------------------------
INSTITUTIONS (Proof of Concept)
--------------------------------------------------------------------------------

The system currently seeds four real Chicago-area institutions:

  ID | Institution                  | Location
  ---|------------------------------|-------------
   1 | Roosevelt University         | Chicago, IL
   2 | National Louis University    | Chicago, IL
   3 | University of Chicago        | Chicago, IL
   4 | Harold Washington College    | Chicago, IL

--------------------------------------------------------------------------------
ACADEMIC PROGRAMS
--------------------------------------------------------------------------------

Each institution offers one or more programs that students enroll in:

  Program ID | Institution                | Program Name
  -----------|----------------------------|----------------------------------
      1      | Roosevelt University        | Computer Science
      2      | Roosevelt University        | Cybersecurity
      3      | Harold Washington College  | Information Technology
      4      | Harold Washington College  | Software Development
      5      | National Louis University  | Computer Forensics
      6      | National Louis University  | Computer Science
      7      | University of Chicago       | Cloud Computing
      8      | University of Chicago       | Information Technology
      9      | Roosevelt University        | Cyber Security & Info Assurance

--------------------------------------------------------------------------------
COURSE CATALOG (Sample — 25 Courses Seeded)
--------------------------------------------------------------------------------

Courses are tied to institutions and programs. Below is a sample:

  Course ID | Code       | Course Name                           | Credits
  ----------|------------|---------------------------------------|--------
      1     | CS101      | Data Structures and Algorithms        |   4
      2     | CYB201     | Network Security                      |   3
      3     | IT101      | IT Fundamentals                       |   3
      4     | SD102      | Web Development                       |   3
      5     | CSIA 150   | Computer Science I                    |   4
      6     | CSIA 217   | Intro to Prob. & Stats                |   3
      7     | CSIA 236   | Python Script Programming             |   3
      8     | CSIA 246   | Data Communications                   |   3
      9     | CSIA 250   | Computer Science II                   |   4
     10     | CSIA 255   | Open Source Communities               |   3
     11     | CSIA 261   | Computer Organization                 |   3
     12     | CSIA 301   | Computer Networking                   |   3
     13     | CSIA 317   | Operating Systems                     |   3
     14     | CSIA 318   | UNIX and System Administration        |   3
     15     | CSIA 319   | Cyber Ops                             |   3
     16     | CSIA 327   | Software Engineering                  |   3
     17     | CSIA 333   | Database Systems                      |   3
     18     | CSIA 335   | Ethical Hack & Countermeasures        |   3
     19     | CSIA 336   | Practical Computing with Data/Python  |   3
     20     | CSIA 352   | Network Design                        |   3
     ...    | ...        | (+ 5 more courses seeded)             |  ...

--------------------------------------------------------------------------------
KNOWLEDGE UNITS (KU TAXONOMY — CAE-Aligned)
--------------------------------------------------------------------------------

Knowledge Units represent standardized academic competency areas. Each course
is mapped to one or more KUs to enable semantic matching across institutions.

  KU ID | Knowledge Unit Name                      | Description
  ------|------------------------------------------|-------------------------------
    1   | Programming Concepts                     | Fundamental logic and syntax
    2   | Cybersecurity Basics                     | Intro security concepts
    3   | Networking Fundamentals                  | Basic networking principles
    4   | Database Management                      | SQL and NoSQL principles
    5   | Cybersecurity Foundations                | Core cybersecurity concepts
    6   | Cybersecurity Principles                 | Security design fundamentals
    7   | IT Systems Components                    | IT system roles/operations
    8   | Basic Scripting and Programming          | Script/program creation basics
    9   | Basic Networking                         | Network build/operate/analyze
   10   | Network Defense                          | Network threat protection
   11   | Basic Cryptography                       | Cryptography usage
   12   | Operating Systems Concepts               | OS roles and services
   13   | Advanced Network Technology & Protocols  | Advanced networking security
   14   | Cloud Computing                          | Cloud models and security
   15   | Cybersecurity Ethics                     | Ethics in cyber contexts
   16   | Database Management Systems              | DBMS utilization skills
   17   | Databases                                | DB usage, management, issues
   18   | Digital Communications                   | Modern digital comm protocols
   19   | Intrusion Detection/Prevention Systems   | Vulnerability detection/mitigation
   20   | Low Level Programming                    | Secure low-level programming
   21   | Network Security Administration          | Enterprise security infra
   22   | Network Technology and Protocols         | Common protocols/interactions
   23   | Operating Systems Administration         | OS system admin operations
   24   | Operating Systems Theory                 | OS concepts/components/interfaces
   25   | Vulnerability Analysis                   | System vulnerability coverage
   26   | Web Application Security                 | Web app tools and practices

  Total KUs seeded: 26

--------------------------------------------------------------------------------
COURSE ↔ KNOWLEDGE UNIT MAPPING (Many-to-Many)
--------------------------------------------------------------------------------

Courses are mapped to multiple KUs to enable cross-institution matching.
Example mappings:

  Course ID | Course Name                  | Mapped KU IDs
  ----------|------------------------------|----------------------------------
      1     | Data Structures & Algorithms | KU 1 (Programming Concepts)
      2     | Network Security             | KU 2 (Cybersecurity Basics)
      3     | IT Fundamentals              | KU 3 (Networking Fundamentals)
      4     | Web Development              | KU 4 (Database Management)
     23     | Intro to Computer Security   | KU 5, 6, 11, 15, 19, 25, 26
     13     | Operating Systems            | KU 7, 12, 14, 24
     12     | Computer Networking          | KU 9, 13, 18, 22
     17     | Database Systems             | KU 16, 17
     24     | Internet Security            | KU 10, 21, 24, 26

  Total course-KU links seeded: 32

  → This mapping is the core driver of the matching algorithm. Two courses
    from different institutions are considered equivalent when they share
    a sufficient overlap of Knowledge Units.

--------------------------------------------------------------------------------
PROOF OF CONCEPT — TRANSFER REQUEST EXAMPLE
--------------------------------------------------------------------------------

The following is a real end-to-end example seeded in the system:

  STUDENT
  -------
  Student ID : 1
  Enrolled at: Roosevelt University (Institution 1)
  Program    : Computer Science (Program 1)

  TRANSFER REQUEST
  ----------------
  Request ID     : 1
  From           : Roosevelt University (Institution 1)
  To             : Harold Washington College (Institution 4)
  Course From    : CS101 — Data Structures and Algorithms (Course 1, 4 credits)
  Course To      : SD102 — Web Development (Course 4, 3 credits)
  Status         : Pending
  Date Submitted : 2026-02-16

  COURSE MATCH RECORD
  -------------------
  Match ID       : 1
  Institution From: Roosevelt University → Harold Washington College
  Course From    : CS101 — Data Structures and Algorithms
  Course To      : SD102 — Web Development
  Match Status   : Pending

  → When the system processes this request, it compares the KU profiles of
    CS101 and SD102. If enough KU overlap is found, the match is approved.
    A director at Harold Washington College reviews and finalizes the decision.

--------------------------------------------------------------------------------
PDF TRANSCRIPT PARSER
--------------------------------------------------------------------------------

File: TranscriptPDF_reader/pdf_reader.py

PURPOSE:
  Parses student academic transcripts in PDF format (Banner-based and
  web-saved PDFs) to extract:
    - Course codes
    - Course names
    - Grades
    - Credit hours

  The extracted data is used to auto-populate transfer request submissions,
  reducing manual entry errors and speeding up the matching workflow.

USAGE:
  python pdf_reader.py --pdf <path_to_transcript.pdf>

SUPPORTED FORMATS:
  - Banner-generated PDF transcripts
  - Web-saved/printed PDF transcripts (with layout noise handling)

LIBRARIES USED:
  - pdfplumber  — for table-based extraction from structured PDFs
  - re          — for regex-based fallback parsing
  - pandas      — for structuring and exporting extracted data


--------------------------------------------------------------------------------
DATA STANDARDIZATION AND VALIDATION LAYER
--------------------------------------------------------------------------------

PURPOSE:
  This layer supports the reliability of the Transfer Credit Match system by
  preparing, standardizing, and validating academic data before it is used by
  the KU matching process.

  Since unofficial transcripts, course names, and KU labels may appear in
  different formats across institutions, this step helps ensure that the data
  entering the matching pipeline is clean, structured, and consistent.

WHY THIS LAYER IS NEEDED:
  The parser may successfully extract course information from a transcript, but
  extracted data can still be incomplete, inconsistent, or differently phrased.
  For example:
    - course codes may be missing
    - course titles may use different naming conventions
    - KU-related terminology may vary across institutions
    - some transcript rows may be partially extracted or noisy

  Without standardization and validation, these inconsistencies can reduce the
  accuracy and trustworthiness of downstream KU matching.

CORE RESPONSIBILITIES:
  - Standardize transcript-derived course data into a structured format
  - Normalize KU terminology into a consistent internal naming scheme
  - Validate parser output for missing or incomplete fields
  - Generate synthetic/sample datasets for early-stage development
  - Build benchmark cases for future evaluation of KU matching quality

EXAMPLE USE CASES:
  1. KU Normalization
     Different labels such as "binary arithmetic" and "base conversion" may
     refer to the same competency area. This layer maps such variants into a
     common KU label for consistency.

  2. Parser Output Validation
     Parsed transcript rows are checked for missing values such as course code,
     course title, credits, or malformed records before being used in matching.

  3. Benchmark Dataset Creation
     Sample and benchmark records are created so the team can test the matching
     pipeline even before large volumes of real data are available.

SAMPLE CODE SNIPPETS:

  KU Normalization Example
  ------------------------
  ku_map = {
      "binary arithmetic": "KU_BINARY_ARITH",
      "base conversion": "KU_BINARY_ARITH",
      "assembly language": "KU_ASSEMBLY",
      "computer organization basics": "KU_COMP_ORG"
  }

  raw_kus = ["binary arithmetic", "assembly language", "base conversion"]
  normalized_kus = [ku_map.get(ku.lower(), ku) for ku in raw_kus]

  Parser Output Validation Example
  --------------------------------
  import pandas as pd

  df = pd.DataFrame([
      {"course_code": "CSC210", "course_title": "Assembly and Binary", "credits": 3},
      {"course_code": None, "course_title": "Networking Basics", "credits": 3},
      {"course_code": "CSC101", "course_title": None, "credits": 3}
  ])

  df["missing_course_code"] = df["course_code"].isna()
  df["missing_course_title"] = df["course_title"].isna()
  df["missing_credits"] = df["credits"].isna()

VALUE TO THE SYSTEM:
  This layer improves the overall quality of the Transfer Credit Match pipeline
  by making the data cleaner, more consistent, and easier to evaluate. It also
  gives the team a foundation for future analytics, confidence scoring, and KU
  matching performance assessment.

  In short:
    parser extracts the data,
    this layer cleans and validates the data,
    and the matching system uses better-quality input as a result.

--------------------------------------------------------------------------------
DATA PIPELINE SUMMARY
--------------------------------------------------------------------------------

  [Student PDF Transcript]
          ↓
  [pdf_reader.py] — parse courses from transcript
          ↓
  [Transfer Request submitted to DB]
          ↓
  [KU Mapping engine] — compare KU profiles of source vs target course
          ↓
  [course_match record created] — status: Pending
          ↓
  [Director reviews & approves/denies]
          ↓
  [match_history updated] — audit trail preserved

--------------------------------------------------------------------------------
CONTRIBUTORS (Data Science Branch)
--------------------------------------------------------------------------------

  - Data modeling and CSV seed data
  - PDF transcript parsing pipeline
  - Knowledge Unit taxonomy design
  - Course-to-KU mapping for CAE-aligned programs

================================================================================
END OF DOCUMENT
================================================================================
