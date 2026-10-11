package com.bank.caseportal.case_service.cases;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cases")
public class CaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_number", nullable = false, unique = true, length = 30)
    private String caseNumber;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CaseStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CasePriority priority;

    @Column(name = "created_by", nullable = false, updatable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Optimistic locking: a concurrent update with a stale version is rejected. */
    @Version
    private Long version;

    protected CaseEntity() {
        // required by JPA
    }

    public CaseEntity(String caseNumber, String customerName, String title, String description,
                      CasePriority priority, String createdBy) {
        this.caseNumber = caseNumber;
        this.customerName = customerName;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.createdBy = createdBy;
        this.status = CaseStatus.OPEN;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void updateDetails(String customerName, String title, String description, CasePriority priority) {
        this.customerName = customerName;
        this.title = title;
        this.description = description;
        this.priority = priority;
    }

    public void changeStatus(CaseStatus newStatus) {
        this.status = newStatus;
    }

    public UUID getId() { return id; }
    public String getCaseNumber() { return caseNumber; }
    public String getCustomerName() { return customerName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public CaseStatus getStatus() { return status; }
    public CasePriority getPriority() { return priority; }
    public String getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Long getVersion() { return version; }
}