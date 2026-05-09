package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.CourseMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMatchRepository extends JpaRepository<CourseMatch, Integer> {
    List<CourseMatch> findByMatchStatus(CourseMatch.MatchStatus matchStatus);
    long countByMatchStatus(CourseMatch.MatchStatus matchStatus);
}
