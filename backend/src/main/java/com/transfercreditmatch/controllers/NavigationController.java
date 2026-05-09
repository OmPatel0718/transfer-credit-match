package com.transfercreditmatch.controllers;

import com.transfercreditmatch.entities.Institution;
import com.transfercreditmatch.entities.Program;
import com.transfercreditmatch.entities.Course;
import com.transfercreditmatch.entities.KnowledgeUnit;
import com.transfercreditmatch.repositories.InstitutionRepository;
import com.transfercreditmatch.repositories.ProgramRepository;
import com.transfercreditmatch.repositories.KnowledgeUnitRepository;
import com.transfercreditmatch.repositories.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NavigationController {

    private final InstitutionRepository institutionRepo;
    private final ProgramRepository programRepo;
    private final KnowledgeUnitRepository kuRepo;
    private final CourseRepository courseRepo;

    public NavigationController(InstitutionRepository institutionRepo,
                                ProgramRepository programRepo,
                                KnowledgeUnitRepository kuRepo,
                                CourseRepository courseRepo) {
        this.institutionRepo = institutionRepo;
        this.programRepo = programRepo;
        this.kuRepo = kuRepo;
        this.courseRepo = courseRepo;
    }

    // --------------------------
    // INSTITUTIONS ENDPOINTS
    // --------------------------
    
    // GET /api/institutions - List all institutions
    @GetMapping("/institutions")
    public List<Institution> getAllInstitutions() {
        return institutionRepo.findAll();
    }
    
    // GET /api/institutions/{id} - Get a specific institution
    @GetMapping("/institutions/{id}")
    public ResponseEntity<Institution> getInstitutionById(@PathVariable Integer id) {
        Institution institution = institutionRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Institution not found with ID: " + id));
        return ResponseEntity.ok(institution);
    }
    
    // POST /api/institutions - Create a new institution
    @PostMapping("/institutions")
    public ResponseEntity<Institution> createInstitution(@RequestBody Institution institution) {
        Institution saved = institutionRepo.save(institution);
        return ResponseEntity.ok(saved);
    }
    
    // PUT /api/institutions/{id} - Update an existing institution
    @PutMapping("/institutions/{id}")
    public ResponseEntity<Institution> updateInstitution(@PathVariable Integer id,
                                                         @RequestBody Institution updatedData) {
        Institution existing = institutionRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Institution not found with ID: " + id));
        existing.setName(updatedData.getName());
        existing.setLocation(updatedData.getLocation());
        Institution saved = institutionRepo.save(existing);
        return ResponseEntity.ok(saved);
    }
    
    // DELETE /api/institutions/{id} - Delete an institution
    @DeleteMapping("/institutions/{id}")
    public ResponseEntity<String> deleteInstitution(@PathVariable Integer id) {
        institutionRepo.deleteById(id);
        return ResponseEntity.ok("Institution with ID " + id + " has been deleted.");
    }
    
    // --------------------------
    // PROGRAMS ENDPOINTS
    // --------------------------
    
    // GET /api/programs - List all programs
    @GetMapping("/programs")
    public List<Program> getAllPrograms() {
        return programRepo.findAll();
    }
    
    // GET /api/programs/{id} - Get a specific program
    @GetMapping("/programs/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable Integer id) {
        Program program = programRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Program not found with ID: " + id));
        return ResponseEntity.ok(program);
    }
    
    // POST /api/programs - Create a new program
    @PostMapping("/programs")
    public ResponseEntity<Program> createProgram(@RequestBody Program program) {
        Program saved = programRepo.save(program);
        return ResponseEntity.ok(saved);
    }
    
    // PUT /api/programs/{id} - Update an existing program
    @PutMapping("/programs/{id}")
    public ResponseEntity<Program> updateProgram(@PathVariable Integer id,
                                                 @RequestBody Program updatedData) {
        Program existing = programRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Program not found with ID: " + id));
        existing.setProgramName(updatedData.getProgramName());
        existing.setInstitutionId(updatedData.getInstitutionId());
        Program saved = programRepo.save(existing);
        return ResponseEntity.ok(saved);
    }
    
    // DELETE /api/programs/{id} - Delete a program
    @DeleteMapping("/programs/{id}")
    public ResponseEntity<String> deleteProgram(@PathVariable Integer id) {
        programRepo.deleteById(id);
        return ResponseEntity.ok("Program with ID " + id + " has been deleted.");
    }
    
    // --------------------------
    // COURSES ENDPOINTS
    // --------------------------
    
    // GET /api/courses - List all courses
    @GetMapping("/courses")
    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }
    
    // PUT /api/courses/{id}/skill - Update the skill earned for a course
    @PutMapping("/courses/{id}/skill")
    public ResponseEntity<Course> updateCourseSkill(@PathVariable Integer id,
                                                    @RequestBody Map<String, String> body) {
        String skill = body.get("skillEarned");
        Course course = courseRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with ID: " + id));
        course.setSkillEarned(skill);
        Course updated = courseRepo.save(course);
        return ResponseEntity.ok(updated);
    }
    
    // --------------------------
    // KNOWLEDGE UNITS ENDPOINTS (GET ONLY)
    // --------------------------
    
    // GET /api/knowledge_units - List all knowledge units
    @GetMapping("/knowledge_units")
    public List<KnowledgeUnit> getAllKnowledgeUnits() {
        return kuRepo.findAll();
    }
}
