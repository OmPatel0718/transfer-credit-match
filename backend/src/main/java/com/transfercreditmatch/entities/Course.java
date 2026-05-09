package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "skill_earned")
    private String skillEarned;

    @Column(name = "institution_id", nullable = false)
    private Integer institutionId;

    @Column(name = "program_id", nullable = false)
    private Integer programId;

    @Column(name = "course_name", nullable = false, length = 255)
    private String courseName;

    @Column(name = "course_code", nullable = false, length = 50, unique = true)
    private String courseCode;

    @Column(name = "credits", nullable = false)
    private Integer credits;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    public Course() {}

    // Getters and setters...

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }


    public String getSkillEarned() { return skillEarned; }
    public void setSkillEarned(String skillEarned) { this.skillEarned = skillEarned; }

    public Integer getInstitutionId() { return institutionId; }
    public void setInstitutionId(Integer institutionId) { this.institutionId = institutionId; }

    public Integer getProgramId() { return programId; }
    public void setProgramId(Integer programId) { this.programId = programId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
