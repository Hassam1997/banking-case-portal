package com.bank.caseportal.case_service.cases;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface CaseRepository extends JpaRepository<CaseEntity, UUID>,
        JpaSpecificationExecutor<CaseEntity> {

    /** Next number from the DB sequence. Safe under concurrency, unlike count()+1. */
    @Query(value = "SELECT nextval('case_number_seq')", nativeQuery = true)
    long nextCaseSequence();
}