package com.programming.techie.backenddemo.repository;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.programming.techie.backenddemo.config.AuthProperties;
import com.programming.techie.backenddemo.domain.Emails;
import com.programming.techie.backenddemo.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

/**
 * Keeps accounts in memory so the login screen can run with no database at all — used by the
 * {@code memory} profile and by tests. Real deployments use the JPA repository instead.
 */
@Repository
@ConditionalOnProperty(name = "app.auth.store", havingValue = "memory")
public class InMemoryUserRepository implements UserRepository {

    private static final Logger log = LoggerFactory.getLogger(InMemoryUserRepository.class);

    private final Map<String, User> byEmail = new ConcurrentHashMap<>();
    private final Map<String, User> byId = new ConcurrentHashMap<>();

    public InMemoryUserRepository(AuthProperties properties, PasswordEncoder passwordEncoder) {
        AuthProperties.DemoUser demo = properties.getDemoUser();
        if (demo.isEnabled()) {
            add(new User(
                    UUID.randomUUID().toString(),
                    Emails.normalize(demo.getEmail()),
                    passwordEncoder.encode(demo.getPassword()),
                    demo.getName(),
                    true,
                    Set.of("ROLE_USER")));
            log.info("Seeded in-memory demo account '{}' — disable with app.auth.demo-user.enabled=false",
                    Emails.normalize(demo.getEmail()));
        }
    }

    /** Registers an account. Exposed for seeding and for tests, not for request handling. */
    public void add(User user) {
        byEmail.put(user.email(), user);
        byId.put(user.id(), user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String normalized = Emails.normalize(email);
        return normalized == null ? Optional.empty() : Optional.ofNullable(byEmail.get(normalized));
    }

    @Override
    public Optional<User> findById(String id) {
        return id == null ? Optional.empty() : Optional.ofNullable(byId.get(id));
    }
}
