package com.transfercreditmatch.entities;

import javax.persistence.*;

@Entity
@Table(name = "course_ku")
@IdClass(CourseKuKey.class)
public class CourseKu {

    @Id
    @Column(name = "course_id")
    private Integer courseId;

    @Id
    @Column(name = "ku_id")
    private Integer kuId;


    public CourseKu() {}

    // Getters and setters
    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public Integer getKuId() { return kuId; }
    public void setKuId(Integer kuId) { this.kuId = kuId; }
}
