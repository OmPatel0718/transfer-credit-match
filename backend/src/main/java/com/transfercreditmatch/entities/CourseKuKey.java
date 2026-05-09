package com.transfercreditmatch.entities;

import java.io.Serializable;
import java.util.Objects;

public class CourseKuKey implements Serializable {

    private Integer courseId;
    private Integer kuId;

    public CourseKuKey() {}

    public CourseKuKey(Integer courseId, Integer kuId) {
        this.courseId = courseId;
        this.kuId = kuId;
    }

    // equals() and hashCode() must be overridden for composite keys
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CourseKuKey)) return false;
        CourseKuKey that = (CourseKuKey) o;
        return Objects.equals(courseId, that.courseId) &&
               Objects.equals(kuId, that.kuId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId, kuId);
    }

    // getters and setters
    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public Integer getKuId() { return kuId; }
    public void setKuId(Integer kuId) { this.kuId = kuId; }
}
