-- =====================================================
-- 04_course_ku_associations.sql - Course to Knowledge Unit Mappings
-- Links courses to their associated KUs for transfer matching
-- =====================================================

-- -----------------------------------------------------
-- Roosevelt University - CSIA Courses
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- CSIA 150: Computer Science I
((SELECT course_id FROM courses WHERE course_code = 'CSIA 150'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),

-- CSIA 261: Computer Organization (Low Level Programming)
((SELECT course_id FROM courses WHERE course_code = 'CSIA 261'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Low Level Programming')),

-- CSIA 301: Computer Networking
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Advanced Network Technology and Protocols')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Digital Communications')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Technology and Protocols')),

-- CSIA 317: Operating Systems
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cloud Computing')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Low Level Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 317'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Theory')),

-- CSIA 318: UNIX and System Administration
((SELECT course_id FROM courses WHERE course_code = 'CSIA 318'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 318'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),

-- CSIA 333: Database Systems
((SELECT course_id FROM courses WHERE course_code = 'CSIA 333'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management Systems')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 333'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Databases')),

-- CSIA 359: Intro to Computer Security (Cybersecurity Fundamentals)
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Foundations')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Principles')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Cryptography')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Ethics')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Intrusion Detection/Prevention Systems')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Vulnerability Analysis')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 359'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security')),

-- CSIA 368: Internet Security
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Security Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 368'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security')),

-- CSIA 399: Senior Project
((SELECT course_id FROM courses WHERE course_code = 'CSIA 399'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSIA 399'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Ethics')),

-- CS101: Introduction to Programming
((SELECT course_id FROM courses WHERE course_code = 'CS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts'));

-- -----------------------------------------------------
-- Harold Washington College
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- IT101: IT Fundamentals
((SELECT course_id FROM courses WHERE course_code = 'IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Networking Fundamentals')),

-- SD102: Web Development
((SELECT course_id FROM courses WHERE course_code = 'SD102'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management'));

-- -----------------------------------------------------
-- City Colleges of Chicago - CSIA Track
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- CCC-CSIA-101: Introduction to Cybersecurity
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Foundations')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cybersecurity Principles')),

-- CCC-CSIA-201: Network Security Fundamentals
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Security Administration')),

-- CCC-CSIA-202: System Administration
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),

-- CCC-CSIA-203: Ethical Hacking Basics
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Vulnerability Analysis')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CSIA-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Web Application Security'));

-- -----------------------------------------------------
-- City Colleges of Chicago - CST Track
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- CCC-CST-101: Introduction to Programming
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),

-- CCC-CST-201: Computer Networking
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Technology and Protocols')),

-- CCC-CST-202: Operating Systems
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-202'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Theory')),

-- CCC-CST-203: Database Concepts
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management')),
((SELECT course_id FROM courses WHERE course_code = 'CCC-CST-203'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management Systems'));

-- -----------------------------------------------------
-- National Louis University - CSS Courses
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- CSS100: Computational Thinking and Technical Writing
((SELECT course_id FROM courses WHERE course_code = 'CSS100'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Computational Thinking')),

-- CSS101: Open-Source Data and Software
((SELECT course_id FROM courses WHERE course_code = 'CSS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),
((SELECT course_id FROM courses WHERE course_code = 'CSS101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Open Source Technologies')),

-- CSS200: Introduction to Information Systems
((SELECT course_id FROM courses WHERE course_code = 'CSS200'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),

-- CSS205: Operating Systems
((SELECT course_id FROM courses WHERE course_code = 'CSS205'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS205'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Administration')),

-- CSS210: Introduction to Networking
((SELECT course_id FROM courses WHERE course_code = 'CSS210'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Networking')),
((SELECT course_id FROM courses WHERE course_code = 'CSS210'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Network Defense')),

-- CSS225: Introduction to Applied Programming
((SELECT course_id FROM courses WHERE course_code = 'CSS225'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),

-- CSS301: Applied Object-Oriented Programming
((SELECT course_id FROM courses WHERE course_code = 'CSS301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS301'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),

-- CSS303: User Interface Development
((SELECT course_id FROM courses WHERE course_code = 'CSS303'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),

-- CSS304: Application Design and Development
((SELECT course_id FROM courses WHERE course_code = 'CSS304'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS304'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),

-- CSS315: Systems Analysis
((SELECT course_id FROM courses WHERE course_code = 'CSS315'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),

-- CSS320: Discrete Structures
((SELECT course_id FROM courses WHERE course_code = 'CSS320'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Computational Thinking')),

-- CSS403: Mobile App Development
((SELECT course_id FROM courses WHERE course_code = 'CSS403'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS403'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),

-- CSS404: Back End Web Development
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts')),
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Basic Scripting and Programming')),
((SELECT course_id FROM courses WHERE course_code = 'CSS404'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Database Management')),

-- CSS450: Cutting Edge AI
((SELECT course_id FROM courses WHERE course_code = 'CSS450'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Programming Concepts'));

-- -----------------------------------------------------
-- University of Chicago
-- -----------------------------------------------------
INSERT INTO course_ku (course_id, ku_id) VALUES 
-- UC-IT101: IT Fundamentals
((SELECT course_id FROM courses WHERE course_code = 'UC-IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Networking Fundamentals')),
((SELECT course_id FROM courses WHERE course_code = 'UC-IT101'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'IT Systems Components')),

-- UC-CC201: Virtualization
((SELECT course_id FROM courses WHERE course_code = 'UC-CC201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Cloud Architecture')),
((SELECT course_id FROM courses WHERE course_code = 'UC-CC201'), (SELECT ku_id FROM knowledge_units WHERE ku_name = 'Operating Systems Concepts'));
