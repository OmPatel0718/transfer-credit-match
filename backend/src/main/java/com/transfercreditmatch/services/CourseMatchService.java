package com.transfercreditmatch.services;

import com.transfercreditmatch.dto.ErroredCourseResponse;
import com.transfercreditmatch.dto.MatchCoverageResponse;
import com.transfercreditmatch.dto.MatchSummaryItem;
import com.transfercreditmatch.dto.MissingCoursesPercentResponse;
import com.transfercreditmatch.entities.Course;
import com.transfercreditmatch.entities.CourseKuKey;
import com.transfercreditmatch.entities.CourseMatch;
import com.transfercreditmatch.entities.CourseKu;
import com.transfercreditmatch.entities.KnowledgeUnit;
import com.transfercreditmatch.repositories.CourseMatchRepository;
import com.transfercreditmatch.repositories.CourseRepository;
import com.transfercreditmatch.repositories.CourseKuRepository;
import com.transfercreditmatch.repositories.KnowledgeUnitRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CourseMatchService {

    private final CourseKuRepository courseKuRepository;
    private final CourseRepository courseRepository;
    private final KnowledgeUnitRepository knowledgeUnitRepository;
    private final CourseMatchRepository courseMatchRepository;

    public CourseMatchService(CourseKuRepository courseKuRepository,
                              CourseRepository courseRepository,
                              KnowledgeUnitRepository knowledgeUnitRepository,
                              CourseMatchRepository courseMatchRepository) {
        this.courseKuRepository = courseKuRepository;
        this.courseRepository = courseRepository;
        this.knowledgeUnitRepository = knowledgeUnitRepository;
        this.courseMatchRepository = courseMatchRepository;
    }

    /**
     * Calculates the match coverage between two courses.
     * It fetches the KUs for each course, then computes the ratio:
     *   coverage = (number of overlapping KUs) / (total unique KUs in both courses)
     *
     * @param courseIdFrom the first course's ID
     * @param courseIdTo the second course's ID
     * @return coverage ratio between 0.0 and 1.0
     */
    public double calculateMatchCoverage(Integer courseIdFrom, Integer courseIdTo) {
        // Fetch knowledge units for each course
        List<CourseKu> fromList = courseKuRepository.findAllByCourseId(courseIdFrom);
        List<CourseKu> toList = courseKuRepository.findAllByCourseId(courseIdTo);

        // Convert lists to sets of KU IDs
        Set<Integer> fromSet = fromList.stream()
                .map(CourseKu::getKuId)
                .collect(Collectors.toSet());

        Set<Integer> toSet = toList.stream()
                .map(CourseKu::getKuId)
                .collect(Collectors.toSet());

        // Calculate the intersection (overlap)
        Set<Integer> intersection = new HashSet<>(fromSet);
        intersection.retainAll(toSet);

        // Calculate total unique KUs
        int totalUnique = fromSet.size() + toSet.size() - intersection.size();

        // Avoid division by zero
        if (totalUnique == 0) {
            return 0.0;
        }

        // Coverage is the ratio of overlapping KUs to total unique KUs
        return (double) intersection.size() / totalUnique;
    }

    public MatchCoverageResponse buildCoverageResponse(Integer courseIdFrom, Integer courseIdTo) {
        List<CourseKu> fromList = courseKuRepository.findAllByCourseId(courseIdFrom);
        List<CourseKu> toList = courseKuRepository.findAllByCourseId(courseIdTo);

        Set<Integer> fromSet = fromList.stream().map(CourseKu::getKuId).collect(Collectors.toCollection(LinkedHashSet::new));
        Set<Integer> toSet = toList.stream().map(CourseKu::getKuId).collect(Collectors.toCollection(LinkedHashSet::new));

        Set<Integer> intersection = new LinkedHashSet<>(fromSet);
        intersection.retainAll(toSet);

        Set<Integer> missingFromSource = new LinkedHashSet<>(toSet);
        missingFromSource.removeAll(fromSet);

        Set<Integer> missingFromTarget = new LinkedHashSet<>(fromSet);
        missingFromTarget.removeAll(toSet);

        Map<Integer, String> kuNames = knowledgeUnitRepository.findAllById(union(fromSet, toSet)).stream()
            .collect(Collectors.toMap(KnowledgeUnit::getKuId, KnowledgeUnit::getKuName));

        Course source = courseRepository.findById(courseIdFrom)
            .orElseThrow(() -> new RuntimeException("Source course not found: " + courseIdFrom));
        Course target = courseRepository.findById(courseIdTo)
            .orElseThrow(() -> new RuntimeException("Target course not found: " + courseIdTo));

        double coverageRatio = calculateCoverageFromSets(fromSet, toSet);
        double coveragePercent = toPercent(coverageRatio);
        CourseMatch.MatchStatus status = coveragePercent >= 75.0 ? CourseMatch.MatchStatus.Approved : CourseMatch.MatchStatus.Pending;

        persistCourseMatch(source, target, status);

        MatchCoverageResponse response = new MatchCoverageResponse();
        response.setCourseIdFrom(courseIdFrom);
        response.setCourseIdTo(courseIdTo);
        response.setSourceCourseCode(source.getCourseCode());
        response.setTargetCourseCode(target.getCourseCode());
        response.setCoveragePercent(coveragePercent);
        response.setMatchedKnowledgeUnits(toSortedNames(intersection, kuNames));
        response.setMissingFromSource(toSortedNames(missingFromSource, kuNames));
        response.setMissingFromTarget(toSortedNames(missingFromTarget, kuNames));
        response.setStatus(status.name());
        return response;
    }

    public List<MatchSummaryItem> getFullyMatchedCourses() {
        List<CourseMatch> approved = courseMatchRepository.findByMatchStatus(CourseMatch.MatchStatus.Approved);
        List<MatchSummaryItem> out = new ArrayList<>();
        for (CourseMatch match : approved) {
            double coverage = calculateMatchCoverage(match.getCourseFrom(), match.getCourseTo());
            double percent = toPercent(coverage);
            if (percent < 99.99) {
                continue;
            }
            Optional<Course> targetOpt = courseRepository.findById(match.getCourseTo());
            if (!targetOpt.isPresent()) {
                continue;
            }
            Course target = targetOpt.get();
            MatchSummaryItem item = new MatchSummaryItem();
            item.setCourseId(target.getCourseId());
            item.setCourseCode(target.getCourseCode());
            item.setCourseName(target.getCourseName());
            item.setMatchPercent(percent);
            out.add(item);
        }
        return out;
    }

    public List<MatchSummaryItem> getMissingCourses() {
        List<CourseMatch> approved = courseMatchRepository.findByMatchStatus(CourseMatch.MatchStatus.Approved);
        Set<Integer> fullyMatchedTargets = approved.stream()
            .filter(match -> toPercent(calculateMatchCoverage(match.getCourseFrom(), match.getCourseTo())) >= 99.99)
            .map(CourseMatch::getCourseTo)
            .collect(Collectors.toSet());

        return courseRepository.findAll().stream()
            .filter(course -> !fullyMatchedTargets.contains(course.getCourseId()))
            .map(course -> {
                MatchSummaryItem item = new MatchSummaryItem();
                item.setCourseId(course.getCourseId());
                item.setCourseCode(course.getCourseCode());
                item.setCourseName(course.getCourseName());
                item.setMatchPercent(0.0);
                return item;
            })
            .collect(Collectors.toList());
    }

    public MissingCoursesPercentResponse getMissingCoursesPercent() {
        int totalCourses = courseRepository.findAll().size();
        int missingCourses = getMissingCourses().size();
        int completedCourses = Math.max(totalCourses - missingCourses, 0);

        MissingCoursesPercentResponse response = new MissingCoursesPercentResponse();
        response.setTotalCourses(totalCourses);
        response.setMissingCourses(missingCourses);
        response.setCompletedCourses(completedCourses);
        if (totalCourses == 0) {
            response.setPercentMissing(0.0);
        } else {
            response.setPercentMissing(toPercent((double) missingCourses / totalCourses));
        }
        return response;
    }

    public List<ErroredCourseResponse> getErroredCourses() {
        List<CourseMatch> rejected = courseMatchRepository.findByMatchStatus(CourseMatch.MatchStatus.Rejected);
        Map<Integer, Course> coursesById = courseRepository.findAll().stream()
            .collect(Collectors.toMap(Course::getCourseId, Function.identity()));

        return rejected.stream().map(match -> {
            ErroredCourseResponse item = new ErroredCourseResponse();
            item.setMatchId(match.getMatchId());
            item.setCourseFromId(match.getCourseFrom());
            item.setCourseToId(match.getCourseTo());
            Course target = coursesById.get(match.getCourseTo());
            item.setCourseName(target == null ? ("Course " + match.getCourseTo()) : target.getCourseName());
            item.setError("Match was rejected during review.");
            return item;
        }).collect(Collectors.toList());
    }

    public List<CourseKu> getCourseKuMappings(Integer courseId) {
        return courseKuRepository.findAllByCourseId(courseId);
    }

    public CourseKu addCourseKuMapping(Integer courseId, Integer kuId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found with ID: " + courseId);
        }
        if (!knowledgeUnitRepository.existsById(kuId)) {
            throw new RuntimeException("Knowledge unit not found with ID: " + kuId);
        }
        if (courseKuRepository.existsByCourseIdAndKuId(courseId, kuId)) {
            throw new RuntimeException("Mapping already exists for course " + courseId + " and KU " + kuId);
        }
        CourseKu mapping = new CourseKu();
        mapping.setCourseId(courseId);
        mapping.setKuId(kuId);
        return courseKuRepository.save(mapping);
    }

    public void removeCourseKuMapping(Integer courseId, Integer kuId) {
        CourseKuKey key = new CourseKuKey(courseId, kuId);
        if (!courseKuRepository.existsById(key)) {
            throw new RuntimeException("Mapping not found for course " + courseId + " and KU " + kuId);
        }
        courseKuRepository.deleteByCourseIdAndKuId(courseId, kuId);
    }

    private void persistCourseMatch(Course source, Course target, CourseMatch.MatchStatus status) {
        CourseMatch match = new CourseMatch();
        match.setCourseFrom(source.getCourseId());
        match.setCourseTo(target.getCourseId());
        match.setInstitutionFrom(source.getInstitutionId());
        match.setInstitutionTo(target.getInstitutionId());
        match.setMatchStatus(status);
        courseMatchRepository.save(match);
    }

    private Set<Integer> union(Set<Integer> fromSet, Set<Integer> toSet) {
        Set<Integer> all = new LinkedHashSet<>(fromSet);
        all.addAll(toSet);
        return all;
    }

    private List<String> toSortedNames(Set<Integer> kuIds, Map<Integer, String> kuNames) {
        return kuIds.stream()
            .map(id -> kuNames.getOrDefault(id, "KU " + id))
            .sorted()
            .collect(Collectors.toList());
    }

    private double calculateCoverageFromSets(Set<Integer> fromSet, Set<Integer> toSet) {
        Set<Integer> intersection = new HashSet<>(fromSet);
        intersection.retainAll(toSet);
        int totalUnique = fromSet.size() + toSet.size() - intersection.size();
        if (totalUnique == 0) {
            return 0.0;
        }
        return (double) intersection.size() / totalUnique;
    }

    private double toPercent(double ratio) {
        return BigDecimal.valueOf(ratio * 100.0).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
