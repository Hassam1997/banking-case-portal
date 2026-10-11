package com.bank.caseportal.case_service.cases;

import com.bank.caseportal.case_service.cases.dto.CaseResponse;
import com.bank.caseportal.case_service.cases.dto.CreateCaseRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import com.bank.caseportal.case_service.client.ActivityClient;
import static org.mockito.Mockito.verify;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CaseServiceTest {

    @Mock
    CaseRepository repository;
    @Mock
    ActivityClient activityClient;
    @InjectMocks
    CaseService service;

    private CaseEntity sampleCase() {
        return new CaseEntity("CASE-2026-000001", "Anna", "Loan", null, CasePriority.HIGH, "agent1");
    }

    @Test
    void createGeneratesCaseNumberAndSetsCreator() {
        when(repository.nextCaseSequence()).thenReturn(123L);
        when(repository.save(any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        CaseResponse response = service.create(
                new CreateCaseRequest("Anna", "Loan", null, CasePriority.HIGH), "agent1");

        assertTrue(response.caseNumber().startsWith("CASE-"));
        assertTrue(response.caseNumber().endsWith("-000123"));
        assertEquals("agent1", response.createdBy());
        assertEquals(CaseStatus.OPEN, response.status());
    }

    @Test
    void agentCannotApprove() {
        assertThrows(AccessDeniedException.class,
                () -> service.changeStatus(UUID.randomUUID(), CaseStatus.APPROVED, false));
    }

    @Test
    void managerCanApprove() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(sampleCase()));
        when(repository.saveAndFlush(any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        assertEquals(CaseStatus.APPROVED, service.changeStatus(id, CaseStatus.APPROVED, true).status());
    }

    @Test
    void agentCanMoveToInProgress() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(sampleCase()));
        when(repository.saveAndFlush(any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        assertEquals(CaseStatus.IN_PROGRESS, service.changeStatus(id, CaseStatus.IN_PROGRESS, false).status());
    }

    @Test
    void statusChangeIsRecordedInActivityService() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(sampleCase()));
        when(repository.saveAndFlush(any(CaseEntity.class))).thenAnswer(i -> i.getArgument(0));

        service.changeStatus(id, CaseStatus.IN_PROGRESS, false);

        verify(activityClient).recordStatusChange(id, CaseStatus.OPEN, CaseStatus.IN_PROGRESS);
    }
}