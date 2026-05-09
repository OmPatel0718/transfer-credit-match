package com.transfercreditmatch.controllers;

import com.transfercreditmatch.entities.Student;
import com.transfercreditmatch.services.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // GET /api/students/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable Integer id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    // PUT /api/students/{id}/update
    @PutMapping("/{id}/update")
    public ResponseEntity<Student> updateStudent(@PathVariable Integer id, @RequestBody Student updatedData) {
        Student updated = studentService.updateStudent(id, updatedData);
        return ResponseEntity.ok(updated);
    }

    // GET /api/students/{id}/courses
    // @GetMapping("/{id}/courses")
    // public ResponseEntity<List<Course>> getStudentCourses(@PathVariable Integer id) {
    //     List<Course> courses = studentService.getStudentCourses(id);
    //     return ResponseEntity.ok(courses);
    // }
}
