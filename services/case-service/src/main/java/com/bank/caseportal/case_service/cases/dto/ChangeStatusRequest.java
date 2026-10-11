package com.bank.caseportal.case_service.cases.dto;

import com.bank.caseportal.case_service.cases.CaseStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(@NotNull CaseStatus status) {}