-- =====================================================
-- 02_knowledge_units.sql - Standardized Knowledge Units
-- All KUs from contributors, deduplicated and consolidated
-- =====================================================

-- Insert all standardized knowledge units
-- These represent the standardized competencies used for course matching

INSERT INTO knowledge_units (ku_name, ku_description) VALUES 
-- Core Programming & Development
('Programming Concepts', 'Covers fundamental programming logic, syntax, and software development principles'),
('Basic Scripting and Programming', 'Covers simple script/program creation, algorithm implementation, and basic security practices in scripting/programming'),
('Low Level Programming', 'Covers programming securely with low level programming languages and system-level development'),

-- Cybersecurity Fundamentals
('Cybersecurity Basics', 'Introduction to security concepts, threats, and best practices'),
('Cybersecurity Foundations', 'Covers fundamental concepts behind cybersecurity principles and frameworks'),
('Cybersecurity Principles', 'Covers basic security design fundamentals and defensive strategies'),
('Cybersecurity Ethics', 'Covers ethical considerations, professional responsibility, and legal issues in cyber contexts'),

-- Networking
('Networking Fundamentals', 'Covers basic networking principles, protocols, and network architecture'),
('Basic Networking', 'Covers how networks are built and operated, network analysis tools, and vulnerabilities'),
('Network Defense', 'Covers defense of networks, basic tools/techniques to protect networks, and communication assets from cyber threats'),
('Advanced Network Technology and Protocols', 'Covers advanced networking concepts in technology, security, and communication'),
('Network Technology and Protocols', 'Covers common network protocols, interaction between network components, and network evolution'),
('Digital Communications', 'Covers protocols and methodologies in modern digital communications systems'),

-- Systems & Operating Systems
('IT Systems Components', 'Covers components in an IT system and their roles in system operation'),
('Operating Systems Concepts', 'Covers roles of operating systems, basic functions, and services provided by operating systems'),
('Operating Systems Theory', 'Covers implementation of operating system concepts, components, and interfaces'),
('Operating Systems Administration', 'Covers basic operations involved in system administration of operating systems'),

-- Database
('Database Management', 'Covers SQL and NoSQL database principles, design, and management'),
('Databases', 'Covers how database systems are used, managed, and associated issues'),
('Database Management Systems', 'Covers skills to utilize database management systems effectively'),

-- Security Specializations
('Basic Cryptography', 'Covers how and where cryptography is used for secure communications'),
('Network Security Administration', 'Covers maintaining comprehensive enterprise security infrastructure'),
('Intrusion Detection/Prevention Systems', 'Covers skills related to detecting/analyzing vulnerabilities and risk mitigation'),
('Vulnerability Analysis', 'Covers system vulnerabilities, assessment techniques, and remediation strategies'),
('Web Application Security', 'Covers technology, tools, and practices associated with securing web applications'),

-- Cloud & Emerging Technologies
('Cloud Computing', 'Covers technologies and services that enable cloud computing, types of cloud computing models, and security/legal issues with cloud computing'),
('Cloud Architecture', 'Covers principles and design patterns for building scalable cloud-based solutions'),

-- Specialized Domains
('Digital Forensics Fundamentals', 'Covers digital evidence, forensics process, and legal considerations'),
('Computational Thinking', 'Covers problem-solving methods, algorithmic thinking, and technical communication skills'),
('Open Source Technologies', 'Covers open-source software ecosystems, tools, and collaborative development practices');
