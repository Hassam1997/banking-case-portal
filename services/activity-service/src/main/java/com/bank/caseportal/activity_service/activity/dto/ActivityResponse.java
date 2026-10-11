package com.bank.caseportal.activity_service.activity.dto;

import com.bank.caseportal.activity_service.activity.Activity;
import com.bank.caseportal.activity_service.activity.ActivityType;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(UUID id, UUID caseId, ActivityType type, String content,
                               String createdBy, Instant createdAt) {
    public static ActivityResponse from(Activity a) {
        return new ActivityResponse(a.getId(), a.getCaseId(), a.getType(), a.getContent(),
                a.getCreatedBy(), a.getCreatedAt());
    }
}