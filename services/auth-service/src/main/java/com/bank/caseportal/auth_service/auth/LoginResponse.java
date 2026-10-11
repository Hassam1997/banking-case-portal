package com.bank.caseportal.auth_service.auth;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String role
) {}