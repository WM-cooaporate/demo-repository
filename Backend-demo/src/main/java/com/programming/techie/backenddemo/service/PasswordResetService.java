package com.proj.login.service;

import com.proj.login.config.AuthProperties;
import com.proj.login.domain.Emails;
import com.proj.login.domain.User;
import com.proj.login.repository.UserRepository;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Handles the "Forget Password" request from the login screen: mints a single-use token for a
 * known account and hands it to the notifier.
 *
 * <p>Consuming that token to actually set a new password belongs to the reset screen, which is
 * outside the scope of this backend — {@link #consume(String)} is provided as the hook it will
 * call.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordResetNotifier notifier;
    private final AuthProperties.PasswordReset config;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, PendingReset> tokens = new ConcurrentHashMap<>();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetNotifier notifier,
            AuthProperties properties,
            Clock clock) {
        this.userRepository = userRepository;
        this.notifier = notifier;
        this.config = properties.getPasswordReset();
        this.clock = clock;
    }

    /**
     * Starts a reset if the email belongs to an enabled account. Returns nothing either way —
     * the caller must answer identically for known and unknown emails so the endpoint cannot be
     * used to discover who has an account.
     */
    public void request(String email) {
        String normalized = Emails.normalize(email);
        Optional<User> found = userRepository.findByEmail(normalized);
        if (found.isEmpty() || !found.get().enabled()) {
            log.info("Password reset requested for '{}': no eligible account, nothing sent", normalized);
            return;
        }

        purgeExpired();
        User user = found.get();
        byte[] raw = new byte[TOKEN_BYTES];
        random.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        Instant expiresAt = clock.instant().plus(config.getTokenTtl());

        tokens.put(token, new PendingReset(user.id(), expiresAt));
        notifier.send(user, token, expiresAt);
    }

    /**
     * Redeems a reset token exactly once.
     *
     * @return the user id the token was issued for, or empty if it is unknown or expired
     */
    public Optional<String> consume(String token) {
        PendingReset pending = token == null ? null : tokens.remove(token);
        if (pending == null || pending.expiresAt().isBefore(clock.instant())) {
            return Optional.empty();
        }
        return Optional.of(pending.userId());
    }

    private void purgeExpired() {
        Instant now = clock.instant();
        tokens.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record PendingReset(String userId, Instant expiresAt) {
    }
}
