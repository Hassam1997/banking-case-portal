package com.bank.caseportal.case_service.cases;

import org.springframework.data.jpa.domain.Specification;

final class CaseSpecifications {
    private CaseSpecifications() {}

    static Specification<CaseEntity> hasStatus(CaseStatus status) {
        return (root, q, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    static Specification<CaseEntity> hasPriority(CasePriority priority) {
        return (root, q, cb) -> priority == null ? null : cb.equal(root.get("priority"), priority);
    }
}