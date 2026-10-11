package com.bank.caseportal.activity_service.activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByCaseIdOrderByCreatedAtDesc(UUID caseId);
}
