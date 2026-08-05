package com.proj.login.service;

import com.proj.login.domain.Emails;
import com.proj.login.domain.User;
import com.proj.login.repository.UserRepository;
import com.proj.login.security.JwtService;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * The login screen's business logic: verify a password, throttle abuse, hand back a token.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

    /**
     * Hash of a value nobody knows, matched against when the email is unknown. Without it an
     * unknown email would answer noticeably faster than a wrong password, which is enough to
     * enumerate accounts.
     */
    private final String decoyHash;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.decoyHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
    }

    /**
     * Authenticates an email/password pair.
     *
     * @throws AuthenticationException.AccountLocked      after too many recent failures
     * @throws AuthenticationException.InvalidCredentials on an unknown email or a wrong password
     * @throws AuthenticationException.AccountDisabled    when the account exists but may not sign in
     */
    public AuthenticatedSession login(String email, String rawPassword) {
        String normalizedEmail = Emails.normalize(email);

        Optional<Duration> lock = loginAttemptService.lockRemaining(normalizedEmail);
        if (lock.isPresent()) {
            log.info("Login refused for '{}': locked for another {}s", normalizedEmail, lock.get().toSeconds());
            throw new AuthenticationException.AccountLocked(lock.get().toSeconds());
        }

        Optional<User> found = userRepository.findByEmail(normalizedEmail);
        if (found.isEmpty()) {
            passwordEncoder.matches(rawPassword, decoyHash);
            loginAttemptService.recordFailure(normalizedEmail);
            log.info("Login failed for '{}': no such account", normalizedEmail);
            throw new AuthenticationException.InvalidCredentials();
        }

        User user = found.get();
        if (!passwordEncoder.matches(rawPassword, user.passwordHash())) {
            loginAttemptService.recordFailure(normalizedEmail);
            log.info("Login failed for '{}': wrong password", normalizedEmail);
            throw new AuthenticationException.InvalidCredentials();
        }

        // Checked only after the password verifies, so a disabled account is not detectable by
        // anyone who does not already know the password.
        if (!user.enabled()) {
            log.info("Login failed for '{}': account disabled", normalizedEmail);
            throw new AuthenticationException.AccountDisabled();
        }

        loginAttemptService.recordSuccess(normalizedEmail);
        JwtService.IssuedToken token = jwtService.issue(user);
        log.info("Login succeeded for '{}'", normalizedEmail);
        return new AuthenticatedSession(user, token);
    }

    /** Resolves the account behind an already-verified token. */
    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    /** A verified user together with the token minted for them. */
    public record AuthenticatedSession(User user, JwtService.IssuedToken token) {
    }
}
