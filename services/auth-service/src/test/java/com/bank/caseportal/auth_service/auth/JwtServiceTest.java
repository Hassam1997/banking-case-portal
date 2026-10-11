package com.bank.caseportal.auth_service.auth;

import com.bank.caseportal.auth_service.config.JwtConfig;
import com.bank.caseportal.auth_service.user.Role;
import com.bank.caseportal.auth_service.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import javax.crypto.SecretKey;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @Test
    void generatedTokenContainsExpectedClaims() {
        JwtConfig config = new JwtConfig();
        SecretKey key = config.jwtSecretKey("test-secret-test-secret-test-secret-1234");
        JwtService service = new JwtService(config.jwtEncoder(key), "auth-service", 30);

        String token = service.generateToken(new User("manager1", "hash", Role.MANAGER));
        Jwt jwt = config.jwtDecoder(key).decode(token);

        assertEquals("manager1", jwt.getSubject());
        assertEquals("auth-service", jwt.getClaimAsString("iss"));
        assertEquals(List.of("MANAGER"), jwt.getClaimAsStringList("roles"));
        assertTrue(jwt.getExpiresAt().isAfter(jwt.getIssuedAt()));
    }
}