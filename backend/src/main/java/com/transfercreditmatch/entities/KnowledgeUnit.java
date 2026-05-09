package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "knowledge_units")
public class KnowledgeUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ku_id")
    private Integer kuId;

    @Column(name = "ku_name", nullable = false, length = 255, unique = true)
    private String kuName;

    @Column(name = "ku_description")
    private String kuDescription;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Constructors
    public KnowledgeUnit() {}

    // Getters and Setters
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
