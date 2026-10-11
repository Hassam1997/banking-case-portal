package com.bank.caseportal.case_service.cases.dto;

import com.bank.caseportal.case_service.cases.CaseEntity;
import com.bank.caseportal.case_service.cases.CasePriority;
import com.bank.caseportal.case_service.cases.CaseStatus;

import java.time.Instant;
import java.util.UUID;

public record CaseResponse(
        UUID id, String caseNumber, String customerName, String title, String description,
        CaseStatus status, CasePriority priority, String createdBy,
        Instant createdAt, Instant updatedAt, Long version
) {
    public static CaseResponse from(CaseEntity c) {
        return new CaseResponse(c.getId(), c.getCaseNumber(), c.getCustomerName(), c.getTitle(),
                c.getDescription(), c.getStatus(), c.getPriority(), c.getCreatedBy(),
                c.getCreatedAt(), c.getUpdatedAt(), c.getVersion());
    }
}