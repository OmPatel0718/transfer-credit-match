package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.Course;
import com.transfercreditmatch.repositories.CourseRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course updateCourseSkillEarned(Integer courseId, String skill) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

        course.setSkillEarned(skill);
        return courseRepository.save(course);
    }
}
