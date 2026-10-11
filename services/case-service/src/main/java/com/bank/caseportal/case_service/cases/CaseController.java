package com.bank.caseportal.case_service.cases;

import com.bank.caseportal.case_service.cases.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService service;

    public CaseController(CaseService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<CaseResponse> list(@RequestParam(required = false) CaseStatus status,
                                           @RequestParam(required = false) CasePriority priority,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);   // cap page size to protect the DB
        return service.list(status, priority, safePage, safeSize);
    }

    @GetMapping("/{id}")
    public CaseResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('AGENT','MANAGER')")
    public CaseResponse create(@Valid @RequestBody CreateCaseRequest request, Authentication auth) {
        return service.create(request, auth.getName());   // creator comes from the TOKEN, not the body
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT','MANAGER')")
    public CaseResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateCaseRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT','MANAGER')")
    public CaseResponse changeStatus(@PathVariable UUID id,
                                     @Valid @RequestBody ChangeStatusRequest request,
                                     Authentication auth) {
        boolean manager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        return service.changeStatus(id, request.status(), manager);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('MANAGER')")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}