package com.programming.techie.backenddemo.service;

import java.time.Instant;

import com.programming.techie.backenddemo.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Stand-in delivery: writes the reset token to the application log so the flow is testable
 * before a mail provider exists. Do not run this in production — register a mailer bean of
 * type {@link PasswordResetNotifier} and this one steps aside.
 */
public class LoggingPasswordResetNotifier implements PasswordResetNotifier {

    private static final Logger log = LoggerFactory.getLogger(LoggingPasswordResetNotifier.class);

    @Override
    public void send(User user, String token, Instant expiresAt) {
        log.warn("Password reset token for '{}' (expires {}): {} — replace this notifier before production",
                user.email(), expiresAt, token);
    }
}
