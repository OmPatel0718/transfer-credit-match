package com.transfercreditmatch.dto;

import java.util.List;

public class MatchCoverageResponse {
    private Integer courseIdFrom;
    private Integer courseIdTo;
    private String sourceCourseCode;
    private String targetCourseCode;
    private double coveragePercent;
    private List<String> matchedKnowledgeUnits;
    private List<String> missingFromSource;
    private List<String> missingFromTarget;
    private String status;

    public Integer getCourseIdFrom() {
        return courseIdFrom;
    }

    public void setCourseIdFrom(Integer courseIdFrom) {
        this.courseIdFrom = courseIdFrom;
    }

    public Integer getCourseIdTo() {
        return courseIdTo;
    }

    public void setCourseIdTo(Integer courseIdTo) {
        this.courseIdTo = courseIdTo;
    }

    public String getSourceCourseCode() {
        return sourceCourseCode;
    }

    public void setSourceCourseCode(String sourceCourseCode) {
        this.sourceCourseCode = sourceCourseCode;
    }

    public String getTargetCourseCode() {
        return targetCourseCode;
    }

    public void setTargetCourseCode(String targetCourseCode) {
        this.targetCourseCode = targetCourseCode;
    }

    public double getCoveragePercent() {
        return coveragePercent;
    }

    public void setCoveragePercent(double coveragePercent) {
        this.coveragePercent = coveragePercent;
    }

    public List<String> getMatchedKnowledgeUnits() {
        return matchedKnowledgeUnits;
    }

    public void setMatchedKnowledgeUnits(List<String> matchedKnowledgeUnits) {
        this.matchedKnowledgeUnits = matchedKnowledgeUnits;
    }

    public List<String> getMissingFromSource() {
        return missingFromSource;
    }

    public void setMissingFromSource(List<String> missingFromSource) {
        this.missingFromSource = missingFromSource;
    }

    public List<String> getMissingFromTarget() {
        return missingFromTarget;
    }

    public void setMissingFromTarget(List<String> missingFromTarget) {
        this.missingFromTarget = missingFromTarget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
