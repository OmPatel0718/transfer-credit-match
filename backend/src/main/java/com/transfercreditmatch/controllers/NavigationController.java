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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

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
    public List<Program> getAllPrograms(@RequestParam(value = "institutionId", required = false) Integer institutionId) {
        if (institutionId != null) {
            return programRepo.findByInstitutionId(institutionId);
        }
        return programRepo.findAll();
    }
    
    // GET /api/programs/{id} - Get a specific program
    @GetMapping("/programs/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable Integer id) {
        Program program = programRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Program not found with ID: " + id));
        return ResponseEntity.ok(program);
    }

    @GetMapping("/programs/{id}/courses")
    public List<Course> getProgramCourses(@PathVariable Integer id) {
        return courseRepo.findByProgramId(id);
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
    public List<Course> getAllCourses(
        @RequestParam(value = "institutionId", required = false) Integer institutionId,
        @RequestParam(value = "programId", required = false) Integer programId,
        @RequestParam(value = "q", required = false) String query
    ) {
        List<Course> courses;
        if (institutionId != null && programId != null) {
            courses = courseRepo.findByInstitutionIdAndProgramId(institutionId, programId);
        } else if (institutionId != null) {
            courses = courseRepo.findByInstitutionId(institutionId);
        } else if (programId != null) {
            courses = courseRepo.findByProgramId(programId);
        } else {
            courses = courseRepo.findAll();
        }

        if (query == null || query.trim().isEmpty()) {
            return courses;
        }

        String normalizedQuery = query.trim().toLowerCase();
        return courses.stream()
            .filter(course -> {
                String courseName = course.getCourseName() == null ? "" : course.getCourseName().toLowerCase();
                String courseCode = course.getCourseCode() == null ? "" : course.getCourseCode().toLowerCase();
                return courseName.contains(normalizedQuery) || courseCode.contains(normalizedQuery);
            })
            .collect(Collectors.toList());
    }

    // GET /api/courses/{id} - Get a specific course
    @GetMapping("/courses/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Integer id) {
        Course course = courseRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with ID: " + id));
        return ResponseEntity.ok(course);
    }

    // POST /api/courses - Create a new course
    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course saved = courseRepo.save(course);
        return ResponseEntity.ok(saved);
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

    // PUT /api/courses/{id} - Update a course
    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Integer id,
                                               @RequestBody Course updatedData) {
        Course existing = courseRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with ID: " + id));
        existing.setSkillEarned(updatedData.getSkillEarned());
        existing.setInstitutionId(updatedData.getInstitutionId());
        existing.setProgramId(updatedData.getProgramId());
        existing.setCourseName(updatedData.getCourseName());
        existing.setCourseCode(updatedData.getCourseCode());
        existing.setCredits(updatedData.getCredits());
        Course saved = courseRepo.save(existing);
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/courses/{id} - Delete a course
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Integer id) {
        courseRepo.deleteById(id);
        return ResponseEntity.ok("Course with ID " + id + " has been deleted.");
    }
    
    // --------------------------
    // KNOWLEDGE UNITS ENDPOINTS (GET ONLY)
    // --------------------------
    
    // GET /api/knowledge_units - List all knowledge units
    @GetMapping("/knowledge_units")
    public List<KnowledgeUnit> getAllKnowledgeUnits() {
        return kuRepo.findAll();
    }

    // POST /api/knowledge_units - Create a knowledge unit
    @PostMapping("/knowledge_units")
    public ResponseEntity<KnowledgeUnit> createKnowledgeUnit(@RequestBody KnowledgeUnit knowledgeUnit) {
        KnowledgeUnit saved = kuRepo.save(knowledgeUnit);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/knowledge_units/{id} - Update a knowledge unit
    @PutMapping("/knowledge_units/{id}")
    public ResponseEntity<KnowledgeUnit> updateKnowledgeUnit(@PathVariable Integer id,
                                                             @RequestBody KnowledgeUnit updatedData) {
        KnowledgeUnit existing = kuRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Knowledge unit not found with ID: " + id));
        existing.setKuName(updatedData.getKuName());
        existing.setKuDescription(updatedData.getKuDescription());
        KnowledgeUnit saved = kuRepo.save(existing);
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/knowledge_units/{id} - Delete a knowledge unit
    @DeleteMapping("/knowledge_units/{id}")
    public ResponseEntity<String> deleteKnowledgeUnit(@PathVariable Integer id) {
        kuRepo.deleteById(id);
        return ResponseEntity.ok("Knowledge unit with ID " + id + " has been deleted.");
    }

    @GetMapping("/summary")
    public Map<String, Long> getSummaryCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("institutions", institutionRepo.count());
        counts.put("programs", programRepo.count());
        counts.put("courses", courseRepo.count());
        counts.put("knowledgeUnits", kuRepo.count());
        return counts;
    }
}
