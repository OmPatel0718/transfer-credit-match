-- =====================================================
-- setup_database.sql - One-Command Database Setup
-- Transfer Credit Match - Complete Database Initialization
-- 
-- Usage: mysql -u root -p [database_name] < setup_database.sql
-- Or:    mysql -u root -p < setup_database.sql
--
-- This script runs all SQL files in the correct order:
-- 1. Schema (tables)
-- 2. Knowledge Units (standardized KUs)
-- 3. Seed Data (users, institutions, programs)
-- 4. Courses (all courses from 5 institutions)
-- 5. Course-KU Associations (mappings for matching)
-- =====================================================

-- Set error handling
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Display progress
SELECT '>>> Starting Transfer Credit Match Database Setup <<<' as '';

-- =====================================================
-- STEP 1: Create Database Schema
-- =====================================================
SELECT '>>> Step 1/5: Creating database schema...' as '';

-- -----------------------------------------------------
-- Table: users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'director', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: institutions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions (
    institution_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: programs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    UNIQUE KEY unique_program_per_institution (institution_id, program_name)
);

-- -----------------------------------------------------
-- Table: courses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    program_id INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    credits INT NOT NULL,
    skill_earned VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: knowledge_units
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_units (
    ku_id INT PRIMARY KEY AUTO_INCREMENT,
    ku_name VARCHAR(255) NOT NULL UNIQUE,
    ku_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: course_ku
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS course_ku (
    course_id INT NOT NULL,
    ku_id INT NOT NULL,
    PRIMARY KEY (course_id, ku_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (ku_id) REFERENCES knowledge_units(ku_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: students
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    institution_id INT NOT NULL,
    program_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: directors
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS directors (
    director_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    institution_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: admins
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: course_match
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS course_match (
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_from INT NOT NULL,
    institution_to INT NOT NULL,
    course_from INT NOT NULL,
    course_to INT NOT NULL,
    match_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_from) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (institution_to) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (course_from) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (course_to) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: transfer_requests
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transfer_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_from INT NOT NULL,
    course_to INT NOT NULL,
    institution_from INT NOT NULL,
    institution_to INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_from) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (course_to) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (institution_from) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (institution_to) REFERENCES institutions(institution_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: match_history
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS match_history (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    changed_by INT NOT NULL,
    change_type ENUM('Created', 'Updated', 'Deleted') NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES course_match(match_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE CASCADE
);

SELECT '>>> Schema created successfully <<<' as '';

-- =====================================================
-- STEP 2: Insert Knowledge Units
-- =====================================================
SELECT '>>> Step 2/5: Inserting standardized Knowledge Units...' as '';

INSERT INTO knowledge_units (ku_name, ku_description) VALUES 
('Programming Concepts', 'Covers fundamental programming logic, syntax, and software development principles'),
('Basic Scripting and Programming', 'Covers simple script/program creation, algorithm implementation, and basic security practices in scripting/programming'),
('Low Level Programming', 'Covers programming securely with low level programming languages and system-level development'),
('Cybersecurity Basics', 'Introduction to security concepts, threats, and best practices'),
('Cybersecurity Foundations', 'Covers fundamental concepts behind cybersecurity principles and frameworks'),
('Cybersecurity Principles', 'Covers basic security design fundamentals and defensive strategies'),
('Cybersecurity Ethics', 'Covers ethical considerations, professional responsibility, and legal issues in cyber contexts'),
('Networking Fundamentals', 'Covers basic networking principles, protocols, and network architecture'),
('Basic Networking', 'Covers how networks are built and operated, network analysis tools, and vulnerabilities'),
('Network Defense', 'Covers defense of networks, basic tools/techniques to protect networks, and communication assets from cyber threats'),
('Advanced Network Technology and Protocols', 'Covers advanced networking concepts in technology, security, and communication'),
('Network Technology and Protocols', 'Covers common network protocols, interaction between network components, and network evolution'),
('Digital Communications', 'Covers protocols and methodologies in modern digital communications systems'),
('IT Systems Components', 'Covers components in an IT system and their roles in system operation'),
('Operating Systems Concepts', 'Covers roles of operating systems, basic functions, and services provided by operating systems'),
('Operating Systems Theory', 'Covers implementation of operating system concepts, components, and interfaces'),
('Operating Systems Administration', 'Covers basic operations involved in system administration of operating systems'),
('Database Management', 'Covers SQL and NoSQL database principles, design, and management'),
('Databases', 'Covers how database systems are used, managed, and associated issues'),
('Database Management Systems', 'Covers skills to utilize database management systems effectively'),
('Basic Cryptography', 'Covers how and where cryptography is used for secure communications'),
('Network Security Administration', 'Covers maintaining comprehensive enterprise security infrastructure'),
('Intrusion Detection/Prevention Systems', 'Covers skills related to detecting/analyzing vulnerabilities and risk mitigation'),
('Vulnerability Analysis', 'Covers system vulnerabilities, assessment techniques, and remediation strategies'),
('Web Application Security', 'Covers technology, tools, and practices associated with securing web applications'),
('Cloud Computing', 'Covers technologies and services that enable cloud computing, types of cloud computing models, and security/legal issues with cloud computing'),
('Cloud Architecture', 'Covers principles and design patterns for building scalable cloud-based solutions'),
('Digital Forensics Fundamentals', 'Covers digital evidence, forensics process, and legal considerations'),
('Computational Thinking', 'Covers problem-solving methods, algorithmic thinking, and technical communication skills'),
('Open Source Technologies', 'Covers open-source software ecosystems, tools, and collaborative development practices');

SELECT CONCAT('>>> ', ROW_COUNT(), ' Knowledge Units inserted <<<') as '';

-- =====================================================
-- STEP 3: Insert Institutions, Programs, Users
-- =====================================================
SELECT '>>> Step 3/5: Inserting institutions, programs, and users...' as '';

-- Institutions
INSERT INTO institutions (name, location) VALUES 
('Roosevelt University', 'Chicago, IL'),
('Harold Washington College', 'Chicago, IL'),
('National Louis University', 'Chicago, IL'),
('University of Chicago', 'Chicago, IL'),
('City Colleges of Chicago', 'Chicago, IL');

-- Programs
INSERT INTO programs (institution_id, program_name) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Computer Science'),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Cybersecurity'),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Cyber Security and Information Assurance'),
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 'Information Technology'),
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 'Software Development'),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 'Computer Science'),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 'Computer Forensics'),
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 'Cloud Computing'),
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 'Information Technology'),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), 'Cyber Security and Information Assurance'),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), 'Computer Systems Technology');

-- Users (plain-text passwords match AuthService.login — use demo password below for every seeded account)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Alice Johnson', 'alice.johnson@roosevelt.edu', 'demo123', 'director'),
('Bob Smith', 'bob.smith@hwc.edu', 'demo123', 'director'),
('Sophia Bennett', 'sophia.bennett@roosevelt.edu', 'demo123', 'director'),
('Ethan Hayes', 'ethan.hayes@hwc.edu', 'demo123', 'director'),
('Morgan Blake', 'morgan.blake@NLU.edu', 'demo123', 'director'),
('Jordan Grant', 'jordan.grant@uofc.edu', 'demo123', 'director'),
('Charlie Davis', 'charlie.davis@roosevelt.edu', 'demo123', 'student'),
('Sam Harper', 'sam.harper@roosevelt.edu', 'demo123', 'student'),
('Elena Brooks', 'elena.brooks@roosevelt.edu', 'demo123', 'student'),
('Diana Lee', 'diana.lee@hwc.edu', 'demo123', 'student'),
('Liam Carter', 'liam.carter@hwc.edu', 'demo123', 'student'),
('Mason Reed', 'mason.reed@hwc.edu', 'demo123', 'student'),
('Amara Santos', 'amara.santos@NLU.edu', 'demo123', 'student'),
('Kai Mendoza', 'kai.mendoza@NLU.edu', 'demo123', 'student'),
('Elliot Harper', 'elliot.harper@NLU.edu', 'demo123', 'student'),
('Arjun Patel', 'arjun.patel@uofc.edu', 'demo123', 'student'),
('Amina Hassan', 'amina.hassan@uofc.edu', 'demo123', 'student'),
('Carter Hayes', 'carter.hayes@uofc.edu', 'demo123', 'student'),
('Eve Thompson', 'eve.thompson@admin.com', 'demo123', 'admin'),
('Chloe Dawson', 'chloe.dawson@admin.com', 'demo123', 'admin'),
('Mike Wells', 'mike.wells@admin.com', 'demo123', 'admin'),
('Susan Bennett', 'susan.bennett@admin.com', 'demo123', 'admin');

-- Directors
INSERT INTO directors (user_id, institution_id) VALUES 
((SELECT user_id FROM users WHERE email = 'alice.johnson@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
((SELECT user_id FROM users WHERE email = 'bob.smith@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
((SELECT user_id FROM users WHERE email = 'ethan.hayes@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
((SELECT user_id FROM users WHERE email = 'sophia.bennett@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
((SELECT user_id FROM users WHERE email = 'morgan.blake@NLU.edu'), (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
((SELECT user_id FROM users WHERE email = 'jordan.grant@uofc.edu'), (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'));

-- Students
INSERT INTO students (user_id, institution_id, program_id) VALUES 
((SELECT user_id FROM users WHERE email = 'charlie.davis@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),
((SELECT user_id FROM users WHERE email = 'sam.harper@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),
((SELECT user_id FROM users WHERE email = 'elena.brooks@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cybersecurity' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),
((SELECT user_id FROM users WHERE email = 'diana.lee@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),
((SELECT user_id FROM users WHERE email = 'liam.carter@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),
((SELECT user_id FROM users WHERE email = 'mason.reed@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),
((SELECT user_id FROM users WHERE email = 'amara.santos@NLU.edu'), (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),
((SELECT user_id FROM users WHERE email = 'kai.mendoza@NLU.edu'), (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Forensics' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),
((SELECT user_id FROM users WHERE email = 'elliot.harper@NLU.edu'), (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Forensics' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),
((SELECT user_id FROM users WHERE email = 'arjun.patel@uofc.edu'), (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'))),
((SELECT user_id FROM users WHERE email = 'amina.hassan@uofc.edu'), (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'))),
((SELECT user_id FROM users WHERE email = 'carter.hayes@uofc.edu'), (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')));

-- Admins
INSERT INTO admins (user_id) VALUES 
((SELECT user_id FROM users WHERE email = 'eve.thompson@admin.com')),
((SELECT user_id FROM users WHERE email = 'chloe.dawson@admin.com')),
((SELECT user_id FROM users WHERE email = 'mike.wells@admin.com')),
((SELECT user_id FROM users WHERE email = 'susan.bennett@admin.com'));

SELECT CONCAT('>>> ', (SELECT COUNT(*) FROM institutions), ' institutions, ', 
              (SELECT COUNT(*) FROM programs), ' programs, ',
              (SELECT COUNT(*) FROM users), ' users inserted <<<') as '';

-- =====================================================
-- STEP 4: Insert Courses
-- =====================================================
SELECT '>>> Step 4/5: Inserting courses...' as '';

-- Roosevelt University - CSIA Courses
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Introduction to Programming', 'CS101', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Data Structures and Algorithms', 'CS201', 4),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Computer Science I', 'CSIA 150', 4),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Intro to Prob. & Stats', 'CSIA 217', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Python Script Programming', 'CSIA 236', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Data Communications', 'CSIA 246', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Computer Science II', 'CSIA 250', 4),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Open Source Communities', 'CSIA 255', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Computer Organization', 'CSIA 261', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Computer Networking', 'CSIA 301', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Operating Systems', 'CSIA 317', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'UNIX and System Administration', 'CSIA 318', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Cyber Ops', 'CSIA 319', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Software Engineering', 'CSIA 327', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Database Systems', 'CSIA 333', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Ethical Hack & Countermeasures', 'CSIA 335', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Practical Computing with Data in Python', 'CSIA 336', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Network Design', 'CSIA 352', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Introduction to Programming', 'CSIA 354', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Applied Cryptography', 'CSIA 355', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Intro to Computer Security', 'CSIA 359', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Internet Security', 'CSIA 368', 3),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')), 'Senior Project', 'CSIA 399', 3);

-- Harold Washington College
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')), 'IT Fundamentals', 'IT101', 3),
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')), 'Web Development', 'SD102', 3),
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')), 'Database Development', 'SD201', 3);

-- City Colleges of Chicago
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Introduction to Cybersecurity', 'CCC-CSIA-101', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Network Security Fundamentals', 'CCC-CSIA-201', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'System Administration', 'CCC-CSIA-202', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cyber Security and Information Assurance' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Ethical Hacking Basics', 'CCC-CSIA-203', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Introduction to Programming', 'CCC-CST-101', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Computer Networking', 'CCC-CST-201', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Operating Systems', 'CCC-CST-202', 3),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Computer Systems Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago')), 'Database Concepts', 'CCC-CST-203', 3);

-- National Louis University
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Computational Thinking and Technical Writing', 'CSS100', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Open-Source Data and Software', 'CSS101', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Introduction to Information Systems', 'CSS200', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Operating Systems', 'CSS205', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Introduction to Networking', 'CSS210', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Introduction to Applied Programming', 'CSS225', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Applied Object-Oriented Programming', 'CSS301', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'User Interface Development', 'CSS303', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Application Design and Development', 'CSS304', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Systems Analysis', 'CSS315', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Discrete Structures', 'CSS320', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Mobile App Development', 'CSS403', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Back End Web Development', 'CSS404', 3),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University')), 'Cutting Edge AI', 'CSS450', 3);

-- University of Chicago
INSERT INTO courses (institution_id, program_id, course_name, course_code, credits) VALUES 
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')), 'IT Fundamentals', 'UC-IT101', 3),
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')), 'Virtualization', 'UC-CC201', 3);

SELECT CONCAT('>>> ', (SELECT COUNT(*) FROM courses), ' courses inserted <<<') as '';

-- =====================================================
-- STEP 5: Insert Course-Knowledge Unit Associations
-- =====================================================
SELECT '>>> Step 5/5: Creating course-KU associations...' as '';

-- Roosevelt University CSIA Courses
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'CSIA 150'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 261'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Low Level Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Advanced Network Technology and Protocols')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Digital Communications')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Technology and Protocols')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cloud Computing')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Low Level Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Theory')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 318'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 318'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 333'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management Systems')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 333'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Databases')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Foundations')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Principles')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Cryptography')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Ethics')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Intrusion Detection/Prevention Systems')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Vulnerability Analysis')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Security Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 399'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 399'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Ethics')),
((SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts'));

-- Harold Washington College
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Networking Fundamentals')),
((SELECT course_id FROM courses WHERE course_code = 'SD102'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management'));

-- City Colleges of Chicago CSIA Track
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Foundations')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Principles')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Security Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Vulnerability Analysis')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security'));

-- City Colleges of Chicago CST Track
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Technology and Protocols')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Theory')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management Systems'));

-- National Louis University
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'CSS100'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Computational Thinking')),
((SELECT course_id FROM courses WHERE course_code = 'CSS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Open Source Technologies')),
((SELECT course_id FROM courses WHERE course_code = 'CSS200'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSS205'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS205'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CSS210'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CSS210'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),
((SELECT course_id FROM courses WHERE course_code = 'CSS225'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS303'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS304'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS304'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS315'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSS320'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Computational Thinking')),
((SELECT course_id FROM courses WHERE course_code = 'CSS403'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS403'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management')),
((SELECT course_id FROM courses WHERE course_code = 'CSS450'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts'));

-- University of Chicago
INSERT INTO course_ku (course_id, ku_id) VALUES 
((SELECT course_id FROM courses WHERE course_code = 'UC-IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Networking Fundamentals')),
((SELECT course_id FROM courses WHERE course_code = 'UC-IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'UC-CC201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cloud Architecture')),
((SELECT course_id FROM courses WHERE course_code = 'UC-CC201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts'));

SELECT CONCAT('>>> ', (SELECT COUNT(*) FROM course_ku), ' course-KU associations created <<<') as '';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
SELECT '>>> DATABASE SETUP COMPLETE <<<' as '';
SELECT CONCAT('>>> Summary: ', (SELECT COUNT(*) FROM institutions), ' institutions, ', (SELECT COUNT(*) FROM programs), ' programs, ', (SELECT COUNT(*) FROM courses), ' courses, ', (SELECT COUNT(*) FROM knowledge_units), ' KUs, ', (SELECT COUNT(*) FROM users), ' users <<<') as '';

SET FOREIGN_KEY_CHECKS = 1;

