-- =====================================================
-- 03_seed_data.sql - All Seed Data
-- Institutions, Programs, Courses, Users, and KU Associations
-- Compiled from all contributor files
-- =====================================================

-- -----------------------------------------------------
-- INSTITUTIONS
-- -----------------------------------------------------
INSERT INTO institutions (name, location) VALUES 
('Roosevelt University', 'Chicago, IL'),
('Harold Washington College', 'Chicago, IL'),
('National Louis University', 'Chicago, IL'),
('University of Chicago', 'Chicago, IL'),
('City Colleges of Chicago', 'Chicago, IL');

-- -----------------------------------------------------
-- PROGRAMS
-- -----------------------------------------------------
INSERT INTO programs (institution_id, program_name) VALUES 
-- Roosevelt University Programs
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Computer Science'),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Cybersecurity'),
((SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 'Cyber Security and Information Assurance'),

-- Harold Washington College Programs
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 'Information Technology'),
((SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 'Software Development'),

-- National Louis University Programs
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 'Computer Science'),
((SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 'Computer Forensics'),

-- University of Chicago Programs
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 'Cloud Computing'),
((SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 'Information Technology'),

-- City Colleges of Chicago Programs
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), 'Cyber Security and Information Assurance'),
((SELECT institution_id FROM institutions WHERE name = 'City Colleges of Chicago'), 'Computer Systems Technology');

-- -----------------------------------------------------
-- USERS (Students, Directors, Admins)
-- -----------------------------------------------------
INSERT INTO users (name, email, password_hash, role) VALUES 
-- Directors
('Alice Johnson', 'alice.johnson@roosevelt.edu', 'hashed_password_1', 'director'),
('Bob Smith', 'bob.smith@hwc.edu', 'hashed_password_2', 'director'),
('Sophia Bennett', 'sophia.bennett@roosevelt.edu', 'hashed_password_10', 'director'),
('Ethan Hayes', 'ethan.hayes@hwc.edu', 'hashed_password_11', 'director'),
('Morgan Blake', 'morgan.blake@NLU.edu', 'hashed_password_19', 'director'),
('Jordan Grant', 'jordan.grant@uofc.edu', 'hashed_password_20', 'director'),

-- Students - Roosevelt
('Charlie Davis', 'charlie.davis@roosevelt.edu', 'hashed_password_3', 'student'),
('Sam Harper', 'sam.harper@roosevelt.edu', 'hashed_password_6', 'student'),
('Elena Brooks', 'elena.brooks@roosevelt.edu', 'hashed_password_8', 'student'),

-- Students - HWC
('Diana Lee', 'diana.lee@hwc.edu', 'hashed_password_4', 'student'),
('Liam Carter', 'liam.carter@hwc.edu', 'hashed_password_7', 'student'),
('Mason Reed', 'mason.reed@hwc.edu', 'hashed_password_9', 'student'),

-- Students - NLU
('Amara Santos', 'amara.santos@NLU.edu', 'hashed_password_13', 'student'),
('Kai Mendoza', 'kai.mendoza@NLU.edu', 'hashed_password_14', 'student'),
('Elliot Harper', 'elliot.harper@NLU.edu', 'hashed_password_15', 'student'),

-- Students - UChicago
('Arjun Patel', 'arjun.patel@uofc.edu', 'hashed_password_16', 'student'),
('Amina Hassan', 'amina.hassan@uofc.edu', 'hashed_password_17', 'student'),
('Carter Hayes', 'carter.hayes@uofc.edu', 'hashed_password_18', 'student'),

-- Admins
('Eve Thompson', 'eve.thompson@admin.com', 'hashed_password_5', 'admin'),
('Chloe Dawson', 'chloe.dawson@admin.com', 'hashed_password_12', 'admin'),
('Mike Wells', 'mike.wells@admin.com', 'hashed_password_21', 'admin'),
('Susan Bennett', 'susan.bennett@admin.com', 'hashed_password_22', 'admin');

-- -----------------------------------------------------
-- DIRECTORS (Link users to institutions)
-- -----------------------------------------------------
INSERT INTO directors (user_id, institution_id) VALUES 
((SELECT user_id FROM users WHERE email = 'alice.johnson@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
((SELECT user_id FROM users WHERE email = 'bob.smith@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
((SELECT user_id FROM users WHERE email = 'ethan.hayes@hwc.edu'), (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College')),
((SELECT user_id FROM users WHERE email = 'sophia.bennett@roosevelt.edu'), (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University')),
((SELECT user_id FROM users WHERE email = 'morgan.blake@NLU.edu'), (SELECT institution_id FROM institutions WHERE name = 'National Louis University')),
((SELECT user_id FROM users WHERE email = 'jordan.grant@uofc.edu'), (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'));

-- -----------------------------------------------------
-- STUDENTS (Link users to institutions and programs)
-- -----------------------------------------------------
INSERT INTO students (user_id, institution_id, program_id) VALUES 
-- Roosevelt University Students
((SELECT user_id FROM users WHERE email = 'charlie.davis@roosevelt.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),

((SELECT user_id FROM users WHERE email = 'sam.harper@roosevelt.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),

((SELECT user_id FROM users WHERE email = 'elena.brooks@roosevelt.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Cybersecurity' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Roosevelt University'))),

-- Harold Washington College Students
((SELECT user_id FROM users WHERE email = 'diana.lee@hwc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 
 (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),

((SELECT user_id FROM users WHERE email = 'liam.carter@hwc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 
 (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),

((SELECT user_id FROM users WHERE email = 'mason.reed@hwc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'), 
 (SELECT program_id FROM programs WHERE program_name = 'Software Development' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'Harold Washington College'))),

-- National Louis University Students
((SELECT user_id FROM users WHERE email = 'amara.santos@NLU.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Computer Science' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),

((SELECT user_id FROM users WHERE email = 'kai.mendoza@NLU.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Computer Forensics' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),

((SELECT user_id FROM users WHERE email = 'elliot.harper@NLU.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'National Louis University'), 
 (SELECT program_id FROM programs WHERE program_name = 'Computer Forensics' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'National Louis University'))),

-- University of Chicago Students
((SELECT user_id FROM users WHERE email = 'arjun.patel@uofc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 
 (SELECT program_id FROM programs WHERE program_name = 'Information Technology' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'))),

((SELECT user_id FROM users WHERE email = 'amina.hassan@uofc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 
 (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'))),

((SELECT user_id FROM users WHERE email = 'carter.hayes@uofc.edu'), 
 (SELECT institution_id FROM institutions WHERE name = 'University of Chicago'), 
 (SELECT program_id FROM programs WHERE program_name = 'Cloud Computing' AND institution_id = (SELECT institution_id FROM institutions WHERE name = 'University of Chicago')));

-- -----------------------------------------------------
-- ADMINS
-- -----------------------------------------------------
INSERT INTO admins (user_id) VALUES 
((SELECT user_id FROM users WHERE email = 'eve.thompson@admin.com')),
((SELECT user_id FROM users WHERE email = 'chloe.dawson@admin.com')),
((SELECT user_id FROM users WHERE email = 'mike.wells@admin.com')),
((SELECT user_id FROM users WHERE email = 'susan.bennett@admin.com'));
