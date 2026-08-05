package com.proj.login.repository.jpa;

import com.proj.login.config.AuthProperties;
import com.proj.login.domain.Emails;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inserts the configured demo account into the database on first start, so a fresh environment
 * has something to log in with. Turn it off with {@code app.auth.demo-user.enabled=false} —
 * which is what production should do.
 */
@Configuration
@ConditionalOnProperty(name = "app.auth.store", havingValue = "jpa", matchIfMissing = true)
public class DemoUserSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoUserSeeder.class);

    @Bean
    @ConditionalOnProperty(name = "app.auth.demo-user.enabled", havingValue = "true", matchIfMissing = true)
    public ApplicationRunner seedDemoUser(
            UserJpaRepository users, AuthProperties properties, PasswordEncoder passwordEncoder) {
        return args -> insertIfMissing(users, properties, passwordEncoder);
    }

    @Transactional
    void insertIfMissing(UserJpaRepository users, AuthProperties properties, PasswordEncoder passwordEncoder) {
        AuthProperties.DemoUser demo = properties.getDemoUser();
        String email = Emails.normalize(demo.getEmail());
        if (users.existsByEmail(email)) {
            return;
        }

        users.save(new UserEntity(
                UUID.randomUUID().toString(),
                email,
                passwordEncoder.encode(demo.getPassword()),
                demo.getName(),
                true,
                Set.of("ROLE_USER")));
        log.info("Seeded demo account '{}' — disable with app.auth.demo-user.enabled=false", email);
    }
}
