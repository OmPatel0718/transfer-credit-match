package com.transfercreditmatch.dto;

public class ErroredCourseResponse {
    private Integer matchId;
    private Integer courseFromId;
    private Integer courseToId;
    private String courseName;
    private String error;

    public Integer getMatchId() {
        return matchId;
    }

    public void setMatchId(Integer matchId) {
        this.matchId = matchId;
    }

    public Integer getCourseFromId() {
        return courseFromId;
    }

    public void setCourseFromId(Integer courseFromId) {
        this.courseFromId = courseFromId;
    }

    public Integer getCourseToId() {
        return courseToId;
    }

    public void setCourseToId(Integer courseToId) {
        this.courseToId = courseToId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
