package com.bank.caseportal.auth_service.auth;

import com.bank.caseportal.auth_service.user.User;
import com.bank.caseportal.auth_service.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.jwtService = jwtService;
        // Used so unknown usernames take the same time as wrong passwords (timing attack defense)
        this.dummyHash = encoder.encode("dummy-password-for-timing");
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> found = users.findByUsername(request.username());
        String hash = found.map(User::getPasswordHash).orElse(dummyHash);
        boolean passwordOk = encoder.matches(request.password(), hash);

        // Same error for unknown user, wrong password and disabled account: prevents user enumeration
        if (found.isEmpty() || !passwordOk || !found.get().isEnabled()) {
            throw new InvalidCredentialsException();
        }

        User user = found.get();
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Bearer", jwtService.getExpirySeconds(),
                user.getUsername(), user.getRole().name());
    }
}