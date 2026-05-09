package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.Student;
import com.transfercreditmatch.repositories.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Fetch a student by ID, or throw if not found.
     */
    public Student getStudentById(Integer id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
    }

    /**
     * Update the student's userId, institutionId, programId (and any other fields you want to allow updates for).
     * 'createdAt' is typically set by the DB, so we usually don't overwrite it.
     */
    public Student updateStudent(Integer id, Student updatedData) {
        // 1. Fetch existing record
        Student existing = getStudentById(id);

        // 2. Update fields that actually exist in your 'students' table
        existing.setUserId(updatedData.getUserId());
        existing.setInstitutionId(updatedData.getInstitutionId());
        existing.setProgramId(updatedData.getProgramId());
        // We don't usually update 'createdAt' as it's auto-set by DB

        // 3. Save the updated student
        return studentRepository.save(existing);
    }

    // (Optional) If you need to list courses for this student:
    // public List<Course> getStudentCourses(Integer id) {
    //     Student student = getStudentById(id);
    //     // if there's a relationship, e.g. student.getCourses();
    //     // return that list
    // }
}
