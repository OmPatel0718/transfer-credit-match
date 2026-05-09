package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Integer> {
    List<Program> findByInstitutionId(Integer institutionId);
}
