package com.proj.login.service;

import com.proj.login.domain.User;
import java.time.Instant;

/**
 * Delivery seam for password reset tokens. The default implementation only logs; replace this
 * bean with one that sends mail when the reset screen is built.
 */
public interface PasswordResetNotifier {

    void send(User user, String token, Instant expiresAt);
}
