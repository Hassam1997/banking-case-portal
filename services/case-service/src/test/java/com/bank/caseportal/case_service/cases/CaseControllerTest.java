package com.bank.caseportal.case_service.cases;

import com.bank.caseportal.case_service.config.JwtConfig;
import com.bank.caseportal.case_service.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CaseController.class)
@Import({SecurityConfig.class, JwtConfig.class})
@TestPropertySource(properties = {
        "app.jwt.secret=test-secret-test-secret-test-secret-1234",
        "app.cors.allowed-origins=http://localhost:5173"
})
class CaseControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean CaseService service;

    private static final String VALID_BODY =
            "{\"customerName\":\"Anna\",\"title\":\"Loan\",\"description\":\"x\",\"priority\":\"HIGH\"}";

    @Test
    void listWithoutTokenReturns401() throws Exception {
        mvc.perform(get("/api/cases")).andExpect(status().isUnauthorized());
    }

    @Test
    void agentCanList() throws Exception {
        mvc.perform(get("/api/cases")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_AGENT"))))
                .andExpect(status().isOk());
    }

    @Test
    void createWithInvalidBodyReturns400() throws Exception {
        mvc.perform(post("/api/cases")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_AGENT")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void agentCannotDelete() throws Exception {
        mvc.perform(delete("/api/cases/" + UUID.randomUUID())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_AGENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerCanDelete() throws Exception {
        mvc.perform(delete("/api/cases/" + UUID.randomUUID())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_MANAGER"))))
                .andExpect(status().isNoContent());
    }
}