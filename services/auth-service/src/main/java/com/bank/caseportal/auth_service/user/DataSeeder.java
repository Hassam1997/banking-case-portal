package com.bank.caseportal.auth_service.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String seedPassword;

    public DataSeeder(UserRepository users,
                      PasswordEncoder encoder,
                      @Value("${app.seed.password}") String seedPassword) {
        this.users = users;
        this.encoder = encoder;
        this.seedPassword = seedPassword;
    }

    @Override
    public void run(String... args) {
        createIfMissing("agent1", Role.AGENT);
        createIfMissing("manager1", Role.MANAGER);
    }

    private void createIfMissing(String username, Role role) {
        if (users.findByUsername(username).isEmpty()) {
            users.save(new User(username, encoder.encode(seedPassword), role));
            log.info("Seeded demo user '{}' with role {}", username, role);
        }
    }
}