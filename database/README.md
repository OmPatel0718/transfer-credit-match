# Transfer Credit Match - Database Setup

This directory contains the consolidated database files for the Transfer Credit Match application.

## Files Overview

| File | Description |
|------|-------------|
| `01_schema.sql` | Database schema - creates all tables with constraints |
| `02_knowledge_units.sql` | Standardized Knowledge Units (KUs) - deduplicated from all contributors |
| `03_seed_data.sql` | Users, directors, students, admins, institutions, and programs |
| `03_seed_data_courses.sql` | All courses from 5 institutions |
| `04_course_ku_associations.sql` | Course-to-Knowledge-Unit mappings for transfer matching |
| `setup_database.sql` | **One-command setup** - runs all files in order |

## Quick Setup (Recommended)

Run the complete setup in one command:

```bash
mysql -u root -p < setup_database.sql
```

Or with a specific database:

```bash
mysql -u root -p transfer_credit < setup_database.sql
```

## Manual Setup (Step by Step)

If you prefer to run files individually:

```bash
# 1. Create database schema
mysql -u root -p transfer_credit < 01_schema.sql

# 2. Insert standardized Knowledge Units
mysql -u root -p transfer_credit < 02_knowledge_units.sql

# 3. Insert users, institutions, and programs
mysql -u root -p transfer_credit < 03_seed_data.sql

# 4. Insert all courses
mysql -u root -p transfer_credit < 03_seed_data_courses.sql

# 5. Create course-to-KU associations
mysql -u root -p transfer_credit < 04_course_ku_associations.sql
```

## Data Sources Consolidated

The following contributor files were combined to create this standardized dataset:

- `seed_data.sql` - Initial Roosevelt + HWC data (4 basic KUs)
- `seed_data2.sql` - Extended Roosevelt CSIA courses (22 detailed KUs)
- `seed_data_combined.sql` - Multi-institution data (Roosevelt, HWC, NLU, UChicago, CCC)
- `Practice Data` - NLU and UChicago student/course data

### Changes Made During Consolidation

1. **Knowledge Units Deduplicated**: Similar KUs merged with best descriptions
   - Example: "Programming Concepts" + "Code Programming Concepts" → "Programming Concepts"

2. **Institutions Standardized**:
   - "National Luis University" → "National Louis University" (spelling fix)

3. **Course Codes Unique**: All course codes are unique across institutions
   - Example: NLU "CS101" changed to "CSS100" to avoid conflict with Roosevelt "CS101"

4. **KU Descriptions Enhanced**: Combined best descriptions from multiple sources

## Knowledge Units (27 Total)

### Core Programming & Development
- Programming Concepts
- Basic Scripting and Programming
- Low Level Programming

### Cybersecurity
- Cybersecurity Basics
- Cybersecurity Foundations
- Cybersecurity Principles
- Cybersecurity Ethics

### Networking
- Networking Fundamentals
- Basic Networking
- Network Defense
- Advanced Network Technology and Protocols
- Network Technology and Protocols
- Digital Communications

### Systems & OS
- IT Systems Components
- Operating Systems Concepts
- Operating Systems Theory
- Operating Systems Administration

### Database
- Database Management
- Databases
- Database Management Systems

### Security Specializations
- Basic Cryptography
- Network Security Administration
- Intrusion Detection/Prevention Systems
- Vulnerability Analysis
- Web Application Security

### Cloud & Emerging Tech
- Cloud Computing
- Cloud Architecture
- Digital Forensics Fundamentals
- Computational Thinking
- Open Source Technologies

## Institutions (5)

1. Roosevelt University
2. Harold Washington College
3. National Louis University
4. University of Chicago
5. City Colleges of Chicago

## Total Data Counts

- **Institutions**: 5
- **Programs**: 11
- **Courses**: 50+
- **Knowledge Units**: 27
- **Users**: 22 (6 directors, 12 students, 4 admins)
- **Course-KU Associations**: 100+

## Validation

To verify the database was set up correctly:

```sql
-- Count records in each table
SELECT 
    (SELECT COUNT(*) FROM institutions) as institutions,
    (SELECT COUNT(*) FROM programs) as programs,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM knowledge_units) as knowledge_units,
    (SELECT COUNT(*) FROM course_ku) as course_ku_associations,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM students) as students,
    (SELECT COUNT(*) FROM directors) as directors;
```

Expected output:
```
institutions: 5
programs: 11
courses: 50+
knowledge_units: 27
course_ku_associations: 100+
users: 22
students: 12
directors: 6
```

## Troubleshooting

### Duplicate Entry Errors
If you see "Duplicate entry" errors, the database may already have data. Either:
1. Drop and recreate the database: `DROP DATABASE transfer_credit; CREATE DATABASE transfer_credit;`
2. Or use `INSERT IGNORE` instead of `INSERT` (modify SQL files)

### Foreign Key Errors
Ensure files are run in order (01 → 02 → 03 → 04). The setup_database.sql handles this automatically.

### Permission Errors
Ensure your MySQL user has CREATE, INSERT, and REFERENCES permissions.
