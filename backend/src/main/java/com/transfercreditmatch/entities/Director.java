package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "directors")
public class Director {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "director_id")
    private Integer directorId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "institution_id", nullable = false)
    private Integer institutionId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Constructors
    public Director() {}

    // Getters and Setters
    public Integer getDirectorId() {
        return directorId;
    }
    public void setDirectorId(Integer directorId) {
        this.directorId = directorId;
    }

    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }
    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
