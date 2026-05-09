package com.transfercreditmatch.entities;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "match_history")
public class MatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @Column(name = "match_id", nullable = false)
    private Integer matchId;

    @Column(name = "changed_by", nullable = false)
    private Integer changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private ChangeType changeType;

    @Column(name = "change_date", insertable = false, updatable = false)
    private Timestamp changeDate;

    public MatchHistory() {}

    // getters and setters...

    public enum ChangeType {
        Created,
        Updated,
        Deleted
    }
}
