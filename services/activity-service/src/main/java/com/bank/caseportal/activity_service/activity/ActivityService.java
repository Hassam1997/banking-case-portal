package com.bank.caseportal.activity_service.activity;

import com.bank.caseportal.activity_service.activity.dto.ActivityResponse;
import com.bank.caseportal.activity_service.activity.dto.CreateActivityRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ActivityService {

    /** Approval/rejection entries may only be written by a manager. */
    private static final Set<ActivityType> MANAGER_ONLY = Set.of(ActivityType.APPROVED, ActivityType.REJECTED);

    private final ActivityRepository repository;

    public ActivityService(ActivityRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> list(UUID caseId) {
        return repository.findByCaseIdOrderByCreatedAtDesc(caseId).stream()
                .map(ActivityResponse::from).toList();
    }

    @Transactional
    public ActivityResponse add(UUID caseId, CreateActivityRequest request, String username, boolean isManager) {
        if (MANAGER_ONLY.contains(request.type()) && !isManager) {
            throw new AccessDeniedException("Only a manager can record an approval or rejection");
        }
        Activity activity = new Activity(caseId, request.type(), request.content().trim(), username);
        return ActivityResponse.from(repository.save(activity));
    }
}