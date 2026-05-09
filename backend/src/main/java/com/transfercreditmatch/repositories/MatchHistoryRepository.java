package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.MatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchHistoryRepository extends JpaRepository<MatchHistory, Integer> {
}
