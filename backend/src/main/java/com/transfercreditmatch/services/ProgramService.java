package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.Program;
import com.transfercreditmatch.repositories.ProgramRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;

    public ProgramService(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    public Program getProgramById(Integer id) {
        return programRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Program not found with ID: " + id));
    }

    public Program createProgram(Program program) {
        return programRepository.save(program);
    }

    public Program updateProgram(Integer id, Program updatedProgram) {
        Program existing = getProgramById(id);
        existing.setProgramName(updatedProgram.getProgramName());
        existing.setInstitutionId(updatedProgram.getInstitutionId());
        return programRepository.save(existing);
    }

    public void deleteProgram(Integer id) {
        programRepository.deleteById(id);
    }
}
