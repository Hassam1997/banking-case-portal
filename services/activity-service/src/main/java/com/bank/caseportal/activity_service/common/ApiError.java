package com.bank.caseportal.activity_service.common;

import java.time.Instant;

public record ApiError(Instant timestamp, int status, String error, String message, String path) {}
