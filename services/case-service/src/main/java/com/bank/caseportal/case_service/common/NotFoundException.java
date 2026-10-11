package com.bank.caseportal.case_service.common;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}