package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.KnowledgeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KnowledgeUnitRepository extends JpaRepository<KnowledgeUnit, Integer> {
}
