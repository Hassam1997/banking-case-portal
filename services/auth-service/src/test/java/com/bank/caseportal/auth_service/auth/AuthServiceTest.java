package com.bank.caseportal.auth_service.auth;

import com.bank.caseportal.auth_service.user.Role;
import com.bank.caseportal.auth_service.user.User;
import com.bank.caseportal.auth_service.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository users;
    @Mock JwtService jwtService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, encoder, jwtService);
    }

    @Test
    void loginSucceedsWithCorrectPassword() {
        User user = new User("agent1", encoder.encode("Passw0rd!"), Role.AGENT);
        when(users.findByUsername("agent1")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("token-123");
        when(jwtService.getExpirySeconds()).thenReturn(1800L);

        LoginResponse response = service.login(new LoginRequest("agent1", "Passw0rd!"));

        assertEquals("token-123", response.accessToken());
        assertEquals("AGENT", response.role());
    }

    @Test
    void loginFailsWithWrongPassword() {
        User user = new User("agent1", encoder.encode("Passw0rd!"), Role.AGENT);
        when(users.findByUsername("agent1")).thenReturn(Optional.of(user));

        assertThrows(InvalidCredentialsException.class,
                () -> service.login(new LoginRequest("agent1", "wrong")));
    }

    @Test
    void loginFailsForUnknownUser() {
        when(users.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> service.login(new LoginRequest("ghost", "whatever")));
    }

    @Test
    void passwordsAreStoredAsBcryptHashes() {
        String hash = encoder.encode("Passw0rd!");

        assertNotEquals("Passw0rd!", hash);
        assertTrue(hash.startsWith("$2"));
    }
}