package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "programs")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Integer programId;

    @Column(name = "institution_id", nullable = false)
    private Integer institutionId;

    @Column(name = "program_name", nullable = false, length = 255)
    private String programName;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Constructors
    public Program() {}

    // Getters and Setters
    public Integer getProgramId() {
        return programId;
    }
    public void setProgramId(Integer programId) {
        this.programId = programId;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }
    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public String getProgramName() {
        return programName;
    }
    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
