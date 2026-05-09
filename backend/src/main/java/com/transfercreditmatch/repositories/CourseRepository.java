package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByInstitutionId(Integer institutionId);
    List<Course> findByProgramId(Integer programId);
    List<Course> findByInstitutionIdAndProgramId(Integer institutionId, Integer programId);
    List<Course> findByCourseNameContainingIgnoreCaseOrCourseCodeContainingIgnoreCase(String courseName, String courseCode);
    List<Course> findByInstitutionIdAndCourseNameContainingIgnoreCaseOrInstitutionIdAndCourseCodeContainingIgnoreCase(
        Integer institutionId,
        String courseName,
        Integer institutionIdForCode,
        String courseCode
    );
    List<Course> findByProgramIdAndCourseNameContainingIgnoreCaseOrProgramIdAndCourseCodeContainingIgnoreCase(
        Integer programId,
        String courseName,
        Integer programIdForCode,
        String courseCode
    );
    List<Course> findByInstitutionIdAndProgramIdAndCourseNameContainingIgnoreCaseOrInstitutionIdAndProgramIdAndCourseCodeContainingIgnoreCase(
        Integer institutionId,
        Integer programId,
        String courseName,
        Integer institutionIdForCode,
        Integer programIdForCode,
        String courseCode
    );
}
