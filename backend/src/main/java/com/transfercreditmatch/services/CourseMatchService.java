package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.CourseKu;
import com.transfercreditmatch.repositories.CourseKuRepository;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseMatchService {

    private final CourseKuRepository courseKuRepository;

    public CourseMatchService(CourseKuRepository courseKuRepository) {
        this.courseKuRepository = courseKuRepository;
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
}
