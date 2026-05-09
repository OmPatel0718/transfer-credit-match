package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "transfer_requests")
public class TransferRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "course_from", nullable = false)
    private Integer courseFrom;

    @Column(name = "course_to", nullable = false)
    private Integer courseTo;

    @Column(name = "institution_from", nullable = false)
    private Integer institutionFrom;

    @Column(name = "institution_to", nullable = false)
    private Integer institutionTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.Pending;

    @Column(name = "request_date", insertable = false, updatable = false)
    private Timestamp requestDate;

    // Constructors
    public TransferRequest() {}

    // Getters and Setters
    public Integer getRequestId() {
        return requestId;
    }
    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public Integer getStudentId() {
        return studentId;
    }
    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
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

    public RequestStatus getStatus() {
        return status;
    }
    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public Timestamp getRequestDate() {
        return requestDate;
    }
    public void setRequestDate(Timestamp requestDate) {
        this.requestDate = requestDate;
    }

    public enum RequestStatus {
        Pending,
        Approved,
        Rejected
    }
}
