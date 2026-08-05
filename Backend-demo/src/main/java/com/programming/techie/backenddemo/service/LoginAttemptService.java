package com.programming.techie.backenddemo.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import com.programming.techie.backenddemo.config.AuthProperties;
import com.programming.techie.backenddemo.domain.Emails;
import org.springframework.stereotype.Service;

/**
 * Per-email brute-force throttling. Counts failures inside a sliding window and locks the
 * handle out for a while once the limit is passed.
 *
 * <p>State lives in memory, which is enough for a single instance. Behind more than one
 * instance, back this with a shared store (Redis) so the limit is not multiplied by the
 * number of nodes.
 */
@Service
public class LoginAttemptService {

    private final AuthProperties.Lockout config;
    private final Clock clock;
    private final Map<String, Attempts> attemptsByEmail = new ConcurrentHashMap<>();

    /** Above this many tracked handles, expired entries are swept before adding more. */
    private static final int SWEEP_THRESHOLD = 1_000;

    public LoginAttemptService(AuthProperties properties, Clock clock) {
        this.config = properties.getLockout();
        this.clock = clock;
    }

    /**
     * @return how long the handle stays locked, or empty if it may attempt a login now
     */
    public Optional<Duration> lockRemaining(String email) {
        if (!config.isEnabled()) {
            return Optional.empty();
        }
        Attempts attempts = attemptsByEmail.get(key(email));
        if (attempts == null || attempts.lockedUntil() == null) {
            return Optional.empty();
        }
        Instant now = clock.instant();
        return attempts.lockedUntil().isAfter(now)
                ? Optional.of(Duration.between(now, attempts.lockedUntil()))
                : Optional.empty();
    }

    /** Records a failed attempt and locks the handle once the threshold is reached. */
    public void recordFailure(String email) {
        if (!config.isEnabled()) {
            return;
        }
        if (attemptsByEmail.size() > SWEEP_THRESHOLD) {
            sweepExpired();
        }

        Instant now = clock.instant();
        attemptsByEmail.compute(key(email), (ignored, current) -> {
            // Start a fresh window when there is none, when the old one has run out, or when a
            // previous lock has since expired.
            if (current == null
                    || current.windowStart().plus(config.getWindow()).isBefore(now)
                    || (current.lockedUntil() != null && !current.lockedUntil().isAfter(now))) {
                return new Attempts(1, now, null);
            }
            int count = current.count() + 1;
            Instant lockedUntil = count >= config.getMaxAttempts()
                    ? now.plus(config.getLockDuration())
                    : current.lockedUntil();
            return new Attempts(count, current.windowStart(), lockedUntil);
        });
    }

    /** Clears the counter after a successful login. */
    public void recordSuccess(String email) {
        attemptsByEmail.remove(key(email));
    }

    private void sweepExpired() {
        Instant now = clock.instant();
        attemptsByEmail.entrySet().removeIf(entry -> {
            Attempts attempts = entry.getValue();
            boolean lockOver = attempts.lockedUntil() == null || !attempts.lockedUntil().isAfter(now);
            boolean windowOver = attempts.windowStart().plus(config.getWindow()).isBefore(now);
            return lockOver && windowOver;
        });
    }

    private static String key(String email) {
        return Emails.normalize(email);
    }

    private record Attempts(int count, Instant windowStart, Instant lockedUntil) {
    }
}
