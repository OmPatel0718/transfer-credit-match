package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "course_match")
public class CourseMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Integer matchId;

    @Column(name = "institution_from", nullable = false)
    private Integer institutionFrom;

    @Column(name = "institution_to", nullable = false)
    private Integer institutionTo;

    @Column(name = "course_from", nullable = false)
    private Integer courseFrom;

    @Column(name = "course_to", nullable = false)
    private Integer courseTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false)
    private MatchStatus matchStatus = MatchStatus.Pending;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Constructors
    public CourseMatch() {}

    // Getters and Setters
    public Integer getMatchId() {
        return matchId;
    }
    public void setMatchId(Integer matchId) {
        this.matchId = matchId;
    }

    public Integer getInstitutionFrom() {
        return institutionFrom;
    }
    public void setInstitutionFrom(Integer institutionFrom) {
        this.institutionFrom = institutionFrom;
    }

    public Integer getInstitutionTo() {
        return institutionTo;
    }
    public void setInstitutionTo(Integer institutionTo) {
        this.institutionTo = institutionTo;
    }

    public Integer getCourseFrom() {
        return courseFrom;
    }
    public void setCourseFrom(Integer courseFrom) {
        this.courseFrom = courseFrom;
    }

    public Integer getCourseTo() {
        return courseTo;
    }
    public void setCourseTo(Integer courseTo) {
        this.courseTo = courseTo;
    }

    public MatchStatus getMatchStatus() {
        return matchStatus;
    }
    public void setMatchStatus(MatchStatus matchStatus) {
        this.matchStatus = matchStatus;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public enum MatchStatus {
        Pending,
        Approved,
        Rejected
    }
}
