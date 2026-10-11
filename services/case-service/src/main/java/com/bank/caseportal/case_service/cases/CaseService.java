package com.bank.caseportal.case_service.cases;

import com.bank.caseportal.case_service.cases.dto.*;
import com.bank.caseportal.case_service.common.ConflictException;
import com.bank.caseportal.case_service.common.NotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bank.caseportal.case_service.client.ActivityClient;

import java.time.Year;
import java.util.Set;
import java.util.UUID;

@Service
public class CaseService {

    /** Only a manager may move a case into one of these statuses. */
    private static final Set<CaseStatus> MANAGER_ONLY = Set.of(CaseStatus.APPROVED, CaseStatus.REJECTED);

    private final CaseRepository repository;
    private final ActivityClient activityClient;

    public CaseService(CaseRepository repository, ActivityClient activityClient) {
        this.repository = repository;
        this.activityClient = activityClient;
    }

    @Transactional(readOnly = true)
    public PageResponse<CaseResponse> list(CaseStatus status, CasePriority priority, int page, int size) {
        Specification<CaseEntity> spec = Specification.allOf(CaseSpecifications.hasStatus(status),
                CaseSpecifications.hasPriority(priority));
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(repository.findAll(spec, pageable).map(CaseResponse::from));
    }

    @Transactional(readOnly = true)
    public CaseResponse get(UUID id) {
        return CaseResponse.from(find(id));
    }

    @Transactional
    public CaseResponse create(CreateCaseRequest request, String username) {
        String caseNumber = "CASE-%d-%06d".formatted(Year.now().getValue(), repository.nextCaseSequence());
        CaseEntity entity = new CaseEntity(caseNumber, request.customerName().trim(), request.title().trim(),
                request.description(), request.priority(), username);
        return CaseResponse.from(repository.save(entity));
    }

    @Transactional
    public CaseResponse update(UUID id, UpdateCaseRequest request) {
        CaseEntity entity = find(id);
        if (!entity.getVersion().equals(request.version())) {
            throw new ConflictException("Stale version");
        }
        entity.updateDetails(request.customerName().trim(), request.title().trim(),
                request.description(), request.priority());
        return CaseResponse.from(repository.saveAndFlush(entity));
    }

    @Transactional
    public CaseResponse changeStatus(UUID id, CaseStatus newStatus, boolean isManager) {
        if (MANAGER_ONLY.contains(newStatus) && !isManager) {
            throw new AccessDeniedException("Only a manager can approve or reject a case");
        }
        CaseEntity entity = find(id);
        CaseStatus oldStatus = entity.getStatus();
        entity.changeStatus(newStatus);
        CaseResponse response = CaseResponse.from(repository.saveAndFlush(entity));

        if (oldStatus != newStatus) {
            activityClient.recordStatusChange(id, oldStatus, newStatus);
        }
        return response;
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(find(id));
    }

    private CaseEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Case not found"));
    }
}