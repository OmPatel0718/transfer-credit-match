package com.transfercreditmatch.controllers;

import com.transfercreditmatch.dto.MatchRequest;
import com.transfercreditmatch.services.CourseMatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//TODO these imports can be removed after the 4 endpoints at the bottom are completed, these are here to return JSON looking responses for testing
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/match")
public class MatchController {

    private final CourseMatchService courseMatchService;

    public MatchController(CourseMatchService courseMatchService) {
        this.courseMatchService = courseMatchService;
    }

    /**
     * POST endpoint to calculate the match coverage between two courses.
     * Example Request JSON:
     * {
     *    "courseIdFrom": 1,
     *    "courseIdTo": 2
     * }
     *
     * @param request the match request DTO containing two course IDs
     * @return a response with the match coverage percentage
     */
    @PostMapping
    public ResponseEntity<String> matchCourses(@RequestBody MatchRequest request) {
        double coverage = courseMatchService.calculateMatchCoverage(
                request.getCourseIdFrom(), request.getCourseIdTo());
        String resultMessage = "Match Coverage: " + (coverage * 100) + "%";
        return ResponseEntity.ok(resultMessage);
    }
    
    // GET /api/match/fully-matched - Courses with 100% KU match
    @GetMapping("/fully-matched")
    public ResponseEntity<List<Map<String, Object>>> getFullyMatchedCourses() {
        // TODO: Replace with actual database logic
        List<Map<String, Object>> exampleData = List.of(
            Map.of("courseId", 1, "courseName", "Intro to Programming", "matchPercent", 100),
            Map.of("courseId", 3, "courseName", "Data Structures", "matchPercent", 100)
        );
        return ResponseEntity.ok(exampleData);
    }

    // GET /api/match/missing-courses - Courses still needed to graduate
    @GetMapping("/missing-courses")
    public ResponseEntity<List<Map<String, Object>>> getMissingCourses() {
        // TODO: Replace with actual database logic
        List<Map<String, Object>> exampleData = List.of(
            Map.of("courseId", 5, "courseName", "Operating Systems", "required", true),
            Map.of("courseId", 7, "courseName", "Computer Networks", "required", true)
        );
        return ResponseEntity.ok(exampleData);
    }

    // GET /api/match/missing-courses-percent - Percent of courses needed for graduation
    @GetMapping("/missing-courses-percent")
    public ResponseEntity<Map<String, Object>> getMissingCoursesPercent() {
        // TODO: Replace with actual database logic
        Map<String, Object> exampleData = Map.of(
            "percentMissing", 35.0,
            "totalCourses", 20,
            "completedCourses", 13,
            "missingCourses", 7
        );
        return ResponseEntity.ok(exampleData);
    }

    // GET /api/match/errored-courses - Courses that failed to import or weren't found
    @GetMapping("/errored-courses")
    public ResponseEntity<List<Map<String, Object>>> getErroredCourses() {
        // TODO: Replace with actual database logic
        List<Map<String, Object>> exampleData = List.of(
            Map.of("courseName", "Advanced Algorithms", "error", "Course not found in database"),
            Map.of("courseName", "Senior Capstone", "error", "Failed to import — missing credits field")
        );
        return ResponseEntity.ok(exampleData);
    }

}
