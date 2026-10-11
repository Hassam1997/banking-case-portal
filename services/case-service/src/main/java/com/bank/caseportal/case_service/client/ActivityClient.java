package com.bank.caseportal.case_service.client;

import com.bank.caseportal.case_service.cases.CaseStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Component
public class ActivityClient {

    private static final Logger log = LoggerFactory.getLogger(ActivityClient.class);

    private final RestClient restClient;

    public ActivityClient(@Value("${app.activity-service.url}") String baseUrl) {
        // Short timeouts: a slow activity-service must not freeze case-service
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(3));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    /** Best effort: a failure here is logged but never breaks the status change itself. */
    public void recordStatusChange(UUID caseId, CaseStatus from, CaseStatus to) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            log.warn("No JWT in security context, skipping activity for case {}", caseId);
            return;
        }
        try {
            restClient.post()
                    .uri("/api/cases/{id}/activities", caseId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtAuth.getToken().getTokenValue())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("type", "STATUS_CHANGE",
                                 "content", "Status changed from " + from + " to " + to))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Could not record status change for case {}: {}", caseId, e.getMessage());
        }
    }
}