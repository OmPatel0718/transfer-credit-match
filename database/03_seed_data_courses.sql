-- =====================================================
-- 03_seed_data_courses.sql - All Courses and KU Associations
-- This is part 2 of seed data (separated for readability)
-- Run this after 03_seed_data.sql
-- =====================================================

-- -----------------------------------------------------
-- COURSES - Roosevelt University
-- -----------------------------------------------------
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
-- Computer Science Program
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Introduction to Programming', 'CS101', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Data Structures and Algorithms', 'CS201', 4),

-- Cyber Security and Information Assurance Program
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Computer Science I', 'CSIA 150', 4),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Intro to Prob. & Stats', 'CSIA 217', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Python Script Programming', 'CSIA 236', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Data Communications', 'CSIA 246', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Computer Science II', 'CSIA 250', 4),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Open Source Communities', 'CSIA 255', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Computer Organization', 'CSIA 261', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Computer Networking', 'CSIA 301', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Operating Systems', 'CSIA 317', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'UNIX and System Administration', 'CSIA 318', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Cyber Ops', 'CSIA 319', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Software Engineering', 'CSIA 327', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Database Systems', 'CSIA 333', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Ethical Hack & Countermeasures', 'CSIA 335', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Practical Computing with Data in Python', 'CSIA 336', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Network Design', 'CSIA 352', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Introduction to Programming', 'CSIA 354', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Applied Cryptography', 'CSIA 355', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Intro to Computer Security', 'CSIA 359', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Internet Security', 'CSIA 368', 3),

((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
 'Senior Project', 'CSIA 399', 3);

-- -----------------------------------------------------
-- COURSES - Harold Washington College
-- -----------------------------------------------------
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
-- Information Technology Program
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'),
 (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
 'IT Fundamentals', 'IT101', 3),

-- Software Development Program
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'),
 (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
 'Web Development', 'SD102', 3),

((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'),
 (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
 'Database Development', 'SD201', 3);

-- -----------------------------------------------------
-- COURSES - City Colleges of Chicago
-- -----------------------------------------------------
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
-- Cyber Security and Information Assurance Program
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Introduction to Cybersecurity', 'CCC-CSIA-101', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Network Security Fundamentals', 'CCC-CSIA-201', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'System Administration', 'CCC-CSIA-202', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Ethical Hacking Basics', 'CCC-CSIA-203', 3),

-- Computer Systems Technology Program
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Introduction to Programming', 'CCC-CST-101', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Computer Networking', 'CCC-CST-201', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Operating Systems', 'CCC-CST-202', 3),

((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')),
 'Database Concepts', 'CCC-CST-203', 3);

-- -----------------------------------------------------
-- COURSES - National Louis University
-- -----------------------------------------------------
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
-- Computer Science Program
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Computational Thinking and Technical Writing', 'CSS100', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Open-Source Data and Software', 'CSS101', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Introduction to Information Systems', 'CSS200', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Operating Systems', 'CSS205', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Introduction to Networking', 'CSS210', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Introduction to Applied Programming', 'CSS225', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Applied Object-Oriented Programming', 'CSS301', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'User Interface Development', 'CSS303', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Application Design and Development', 'CSS304', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Systems Analysis', 'CSS315', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Discrete Structures', 'CSS320', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Mobile App Development', 'CSS403', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Back End Web Development', 'CSS404', 3),

((SELECT institution_id FROM institutions WHERE name = 'National Louis University'),
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
 'Cutting Edge AI', 'CSS450', 3);

-- -----------------------------------------------------
-- COURSES - University of Chicago
-- -----------------------------------------------------
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
-- Information Technology Program
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')),
 'IT Fundamentals', 'UC-IT101', 3),

-- Cloud Computing Program
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'),
 (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')),
 'Virtualization', 'UC-CC201', 3);
