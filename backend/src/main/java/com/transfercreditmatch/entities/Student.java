package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "institution_id", nullable = false)
    private Integer institutionId;

    @Column(name = "program_id", nullable = false)
    private Integer programId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Constructors
    public Student() {}

    // Getters and Setters
    public Integer getStudentId() {
        return studentId;
    }
    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
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

    public Integer getProgramId() {
        return programId;
    }
    public void setProgramId(Integer programId) {
        this.programId = programId;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
