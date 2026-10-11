package com.bank.caseportal.case_service.cases.dto;

import com.bank.caseportal.case_service.cases.CasePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCaseRequest(
        @NotBlank @Size(max = 100) String customerName,
        @NotBlank @Size(max = 150) String title,
        @Size(max = 2000) String description,
        @NotNull CasePriority priority,
        @NotNull Long version   // the version the client last saw, used to detect lost updates
) {}