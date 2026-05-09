package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.Director;
import com.transfercreditmatch.repositories.DirectorRepository;
import org.springframework.stereotype.Service;

@Service
public class DirectorService {

    private final DirectorRepository directorRepository;

    public DirectorService(DirectorRepository directorRepository) {
        this.directorRepository = directorRepository;
    }

    /**
     * Fetch a director by ID, or throw if not found.
     */
    public Director getDirectorById(Integer id) {
        return directorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Director not found with ID: " + id));
    }

    /**
     * Update the director's userId and institutionId (fields that exist in your directors table).
     * 'createdAt' is typically set by the DB, so we don't overwrite it here.
     */
    public Director updateDirector(Integer id, Director updatedData) {
        // 1. Fetch existing record
        Director existing = getDirectorById(id);

        // 2. Update fields that actually exist in your 'directors' table
        existing.setUserId(updatedData.getUserId());
        existing.setInstitutionId(updatedData.getInstitutionId());
        // We don't update 'createdAt' as it's auto-set by the DB

        // 3. Save the updated director
        return directorRepository.save(existing);
    }
}

