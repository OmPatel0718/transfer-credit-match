package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.Institution;
import com.transfercreditmatch.repositories.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public InstitutionService(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public Institution getInstitutionById(Integer id) {
        return institutionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Institution not found with ID: " + id));
    }

    public Institution createInstitution(Institution institution) {
        return institutionRepository.save(institution);
    }

    public Institution updateInstitution(Integer id, Institution updatedInstitution) {
        Institution existing = getInstitutionById(id);
        existing.setName(updatedInstitution.getName());
        existing.setLocation(updatedInstitution.getLocation());
        return institutionRepository.save(existing);
    }

    public void deleteInstitution(Integer id) {
        institutionRepository.deleteById(id);
    }
}
