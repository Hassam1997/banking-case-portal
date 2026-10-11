package com.bank.caseportal.activity_service.activity.dto;

import com.bank.caseportal.activity_service.activity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateActivityRequest(
        @NotNull ActivityType type,
        @NotBlank @Size(max = 2000) String content
) {}