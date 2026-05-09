package com.transfercreditmatch.dto;

public class MissingCoursesPercentResponse {
    private double percentMissing;
    private int totalCourses;
    private int completedCourses;
    private int missingCourses;

    public double getPercentMissing() {
        return percentMissing;
    }

    public void setPercentMissing(double percentMissing) {
        this.percentMissing = percentMissing;
    }

    public int getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(int totalCourses) {
        this.totalCourses = totalCourses;
    }

    public int getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(int completedCourses) {
        this.completedCourses = completedCourses;
    }

    public int getMissingCourses() {
        return missingCourses;
    }

    public void setMissingCourses(int missingCourses) {
        this.missingCourses = missingCourses;
    }
}
