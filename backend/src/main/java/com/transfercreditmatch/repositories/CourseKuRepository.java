package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.CourseKu;
import com.transfercreditmatch.entities.CourseKuKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseKuRepository extends JpaRepository<CourseKu, CourseKuKey> {
    // Custom method to get all CourseKu entries for a given course
    List<CourseKu> findAllByCourseId(Integer courseId);
}
