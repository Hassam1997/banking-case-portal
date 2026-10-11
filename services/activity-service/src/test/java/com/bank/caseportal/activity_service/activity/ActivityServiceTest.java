package com.bank.caseportal.activity_service.activity;

import com.bank.caseportal.activity_service.activity.dto.ActivityResponse;
import com.bank.caseportal.activity_service.activity.dto.CreateActivityRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock ActivityRepository repository;
    @InjectMocks ActivityService service;

    @Test
    void noteIsStoredWithAuthorFromToken() {
        when(repository.save(any(Activity.class))).thenAnswer(i -> i.getArgument(0));

        ActivityResponse r = service.add(UUID.randomUUID(),
                new CreateActivityRequest(ActivityType.NOTE, "  hello  "), "agent1", false);

        assertEquals("agent1", r.createdBy());
        assertEquals("hello", r.content());
    }

    @Test
    void agentCannotRecordApproval() {
        assertThrows(AccessDeniedException.class, () -> service.add(UUID.randomUUID(),
                new CreateActivityRequest(ActivityType.APPROVED, "ok"), "agent1", false));
    }

    @Test
    void managerCanRecordApproval() {
        when(repository.save(any(Activity.class))).thenAnswer(i -> i.getArgument(0));

        ActivityResponse r = service.add(UUID.randomUUID(),
                new CreateActivityRequest(ActivityType.APPROVED, "ok"), "manager1", true);

        assertEquals(ActivityType.APPROVED, r.type());
    }
}