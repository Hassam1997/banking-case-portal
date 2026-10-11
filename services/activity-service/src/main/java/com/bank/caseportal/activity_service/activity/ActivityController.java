package com.bank.caseportal.activity_service.activity;

import com.bank.caseportal.activity_service.activity.dto.ActivityResponse;
import com.bank.caseportal.activity_service.activity.dto.CreateActivityRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases/{caseId}/activities")
public class ActivityController {

    private final ActivityService service;

    public ActivityController(ActivityService service) {
        this.service = service;
    }

    @GetMapping
    public List<ActivityResponse> list(@PathVariable UUID caseId) {
        return service.list(caseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('AGENT','MANAGER')")
    public ActivityResponse add(@PathVariable UUID caseId,
                                @Valid @RequestBody CreateActivityRequest request,
                                Authentication auth) {
        boolean manager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        return service.add(caseId, request, auth.getName(), manager);   // author comes from the TOKEN
    }
}