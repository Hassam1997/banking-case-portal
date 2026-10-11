package com.bank.caseportal.case_service.common;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}