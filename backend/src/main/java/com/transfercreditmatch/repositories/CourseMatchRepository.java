package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.CourseMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseMatchRepository extends JpaRepository<CourseMatch, Integer> {
}
