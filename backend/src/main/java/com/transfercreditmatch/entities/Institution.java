package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Integer institutionId;

    @Column(name = "name", nullable = false, length = 255, unique = true)
    private String name;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    public Institution() {}

    // Getters and setters...
    public Integer getInstitutionId() { return institutionId; }
    public void setInstitutionId(Integer institutionId) { this.institutionId = institutionId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
