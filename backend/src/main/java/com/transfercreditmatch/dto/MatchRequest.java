package com.transfercreditmatch.dto;

public class MatchRequest {
    private Integer courseIdFrom;
    private Integer courseIdTo;

    // Default constructor
    public MatchRequest() {
    }

    // Getters and Setters
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
}
