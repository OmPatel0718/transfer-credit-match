package com.transfercreditmatch.controllers;

import com.transfercreditmatch.dto.CourseKuRequest;
import com.transfercreditmatch.dto.CourseKuResponse;
import com.transfercreditmatch.dto.ErroredCourseResponse;
import com.transfercreditmatch.dto.MatchCoverageResponse;
import com.transfercreditmatch.dto.MatchRequest;
import com.transfercreditmatch.dto.MatchSummaryItem;
import com.transfercreditmatch.dto.MissingCoursesPercentResponse;
import com.transfercreditmatch.entities.CourseKu;
import com.transfercreditmatch.entities.KnowledgeUnit;
import com.transfercreditmatch.repositories.KnowledgeUnitRepository;
import com.transfercreditmatch.services.CourseMatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/match")
public class MatchController {

    private final CourseMatchService courseMatchService;
    private final KnowledgeUnitRepository knowledgeUnitRepository;

    public MatchController(CourseMatchService courseMatchService,
                           KnowledgeUnitRepository knowledgeUnitRepository) {
        this.courseMatchService = courseMatchService;
        this.knowledgeUnitRepository = knowledgeUnitRepository;
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
    public ResponseEntity<?> matchCourses(@RequestBody MatchRequest request) {
        try {
            MatchCoverageResponse response = courseMatchService.buildCoverageResponse(
                request.getCourseIdFrom(),
                request.getCourseIdTo()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // GET /api/match/fully-matched - Courses with 100% KU match
    @GetMapping("/fully-matched")
    public ResponseEntity<List<MatchSummaryItem>> getFullyMatchedCourses() {
        return ResponseEntity.ok(courseMatchService.getFullyMatchedCourses());
    }

    // GET /api/match/missing-courses - Courses still needed to graduate
    @GetMapping("/missing-courses")
    public ResponseEntity<List<MatchSummaryItem>> getMissingCourses() {
        return ResponseEntity.ok(courseMatchService.getMissingCourses());
    }

    // GET /api/match/missing-courses-percent - Percent of courses needed for graduation
    @GetMapping("/missing-courses-percent")
    public ResponseEntity<MissingCoursesPercentResponse> getMissingCoursesPercent() {
        return ResponseEntity.ok(courseMatchService.getMissingCoursesPercent());
    }

    // GET /api/match/errored-courses - Courses that failed to import or weren't found
    @GetMapping("/errored-courses")
    public ResponseEntity<List<ErroredCourseResponse>> getErroredCourses() {
        return ResponseEntity.ok(courseMatchService.getErroredCourses());
    }

    @GetMapping("/course-ku")
    public ResponseEntity<List<CourseKuResponse>> getCourseKuMappings(@RequestParam Integer courseId) {
        List<CourseKu> mappings = courseMatchService.getCourseKuMappings(courseId);
        List<Integer> kuIds = mappings.stream().map(CourseKu::getKuId).collect(Collectors.toList());
        List<KnowledgeUnit> kus = knowledgeUnitRepository.findAllById(kuIds);
        return ResponseEntity.ok(mappings.stream().map(mapping -> {
            CourseKuResponse item = new CourseKuResponse();
            item.setCourseId(mapping.getCourseId());
            item.setKuId(mapping.getKuId());
            KnowledgeUnit ku = kus.stream()
                .filter(unit -> unit.getKuId().equals(mapping.getKuId()))
                .findFirst()
                .orElse(null);
            if (ku != null) {
                item.setKuName(ku.getKuName());
                item.setKuDescription(ku.getKuDescription());
            }
            return item;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/course-ku")
    public ResponseEntity<CourseKuResponse> addCourseKuMapping(@RequestBody CourseKuRequest request) {
        CourseKu mapping = courseMatchService.addCourseKuMapping(request.getCourseId(), request.getKuId());
        KnowledgeUnit ku = knowledgeUnitRepository.findById(mapping.getKuId())
            .orElseThrow(() -> new RuntimeException("Knowledge unit not found with ID: " + mapping.getKuId()));
        CourseKuResponse response = new CourseKuResponse();
        response.setCourseId(mapping.getCourseId());
        response.setKuId(mapping.getKuId());
        response.setKuName(ku.getKuName());
        response.setKuDescription(ku.getKuDescription());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/course-ku")
    public ResponseEntity<String> removeCourseKuMapping(@RequestParam Integer courseId, @RequestParam Integer kuId) {
        courseMatchService.removeCourseKuMapping(courseId, kuId);
        return ResponseEntity.ok("Removed KU " + kuId + " from course " + courseId + ".");
    }

}
