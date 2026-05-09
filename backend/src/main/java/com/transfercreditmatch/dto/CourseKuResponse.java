package com.transfercreditmatch.dto;

public class CourseKuResponse {
    private Integer courseId;
    private Integer kuId;
    private String kuName;
    private String kuDescription;

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public Integer getKuId() {
        return kuId;
    }

    public void setKuId(Integer kuId) {
        this.kuId = kuId;
    }

    public String getKuName() {
        return kuName;
    }

    public void setKuName(String kuName) {
        this.kuName = kuName;
    }

    public String getKuDescription() {
        return kuDescription;
    }

    public void setKuDescription(String kuDescription) {
        this.kuDescription = kuDescription;
    }
}
