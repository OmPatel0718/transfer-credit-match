package com.transfercreditmatch.dto;

public class MatchSummaryItem {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private double matchPercent;

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public double getMatchPercent() {
        return matchPercent;
    }

    public void setMatchPercent(double matchPercent) {
        this.matchPercent = matchPercent;
    }
}
