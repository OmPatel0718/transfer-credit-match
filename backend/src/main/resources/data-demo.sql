MERGE INTO institutions (institution_id, name, location) KEY(institution_id) VALUES
  (1, 'Roosevelt University', 'Chicago, IL'),
  (2, 'City Colleges of Chicago', 'Chicago, IL'),
  (3, 'College of DuPage', 'Glen Ellyn, IL');

MERGE INTO programs (program_id, institution_id, program_name) KEY(program_id) VALUES
  (1, 1, 'Computer Science B.S.'),
  (2, 1, 'Cybersecurity B.S.'),
  (3, 2, 'Computer Information Systems A.A.S.'),
  (4, 3, 'Computer Science A.S.');

MERGE INTO courses (course_id, institution_id, program_id, course_name, course_code, credits, skill_earned) KEY(course_id) VALUES
  (1, 2, 3, 'Intro to Programming', 'CIS-101', 3, 'Programming fundamentals'),
  (2, 2, 3, 'Data Structures', 'CIS-201', 3, 'Data modeling and complexity'),
  (3, 3, 4, 'Computer Organization', 'CSC-120', 3, 'Low-level systems concepts'),
  (4, 1, 1, 'Programming I', 'CST-150', 3, 'Core coding constructs'),
  (5, 1, 1, 'Data Structures and Algorithms', 'CST-250', 3, 'Algorithmic problem solving'),
  (6, 1, 2, 'Security Fundamentals', 'CYB-210', 3, 'Security principles');

MERGE INTO knowledge_units (ku_id, ku_name, ku_description) KEY(ku_id) VALUES
  (1, 'Variables and Control Flow', 'Basic program control and syntax'),
  (2, 'Data Structures', 'Arrays, lists, and abstract structures'),
  (3, 'Algorithms', 'Efficiency and algorithmic techniques'),
  (4, 'Computer Architecture', 'Instruction and memory model basics'),
  (5, 'Security Basics', 'CIA triad and defense principles');

MERGE INTO course_ku (course_id, ku_id) KEY(course_id, ku_id) VALUES
  (1, 1),
  (2, 2),
  (2, 3),
  (3, 4),
  (4, 1),
  (5, 2),
  (5, 3),
  (6, 5);

MERGE INTO users (user_id, name, email, password_hash, role) KEY(user_id) VALUES
  (1, 'Admin User', 'admin@tcm.local', 'admin123', 'admin'),
  (2, 'Director User', 'director@tcm.local', 'director123', 'director'),
  (3, 'Student User', 'student@tcm.local', 'student123', 'student');
