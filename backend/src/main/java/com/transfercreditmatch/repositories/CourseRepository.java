package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    // This gives you CRUD methods like count(), findAll(), etc.
}
