-- =====================================================
-- 01_schema.sql - Database Schema for Transfer Credit Match
-- Creates all tables with proper constraints and relationships
-- =====================================================

-- -----------------------------------------------------
-- Table: users
-- Stores all user accounts (students, directors, admins)
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
-- Stores universities and colleges
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions (
    institution_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: programs
-- Stores academic programs within institutions
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
-- Stores courses offered by institutions under programs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    program_id INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    credits INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: knowledge_units
-- Stores standardized knowledge units (KUs) for course matching
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_units (
    ku_id INT PRIMARY KEY AUTO_INCREMENT,
    ku_name VARCHAR(255) NOT NULL UNIQUE,
    ku_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table: course_ku
-- Junction table linking courses to their knowledge units
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
-- Links users to their student profiles
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
-- Links users to their director profiles
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
-- Links users to their admin profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: course_match
-- Stores potential or approved course equivalencies
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
-- Stores student-initiated transfer credit requests
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
-- Audit log for course match changes
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
