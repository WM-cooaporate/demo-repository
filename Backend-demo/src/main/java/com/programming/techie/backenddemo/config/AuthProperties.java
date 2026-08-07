package com.programming.techie.backenddemo.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Everything the login flow can be tuned with, bound from {@code app.auth.*}.
 */
@Validated
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    /** Signing and lifetime settings for the access token handed to the app. */
    @Valid
    private final Jwt jwt = new Jwt();

    /** Brute-force protection applied per email address. */
    @Valid
    private final Lockout lockout = new Lockout();

    /** Password reset request handling for the "Forget Password" link. */
    @Valid
    private final PasswordReset passwordReset = new PasswordReset();

    /** Account seeded into the in-memory user store so the screen is usable out of the box. */
    @Valid
    private final DemoUser demoUser = new DemoUser();

    /** Origins allowed to call the API from a browser (Flutter web builds). */
    private List<String> allowedOrigins = List.of("http://localhost:*", "https://localhost:*");

    public Jwt getJwt() {
        return jwt;
    }

    public Lockout getLockout() {
        return lockout;
    }

    public PasswordReset getPasswordReset() {
        return passwordReset;
    }

    public DemoUser getDemoUser() {
        return demoUser;
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public static class Jwt {

        /**
         * HMAC-SHA256 signing key. Must be at least 32 characters; supply a real one through
         * the {@code APP_AUTH_JWT_SECRET} environment variable outside of local development.
         */
        @NotBlank
        private String secret;

        /** Value written to (and required in) the {@code iss} claim. */
        @NotBlank
        private String issuer = "proj-login-backend";

        /** How long an issued access token stays valid. */
        @NotNull
        private Duration ttl = Duration.ofHours(1);

        /** Tolerance for clock drift between this service and the token consumer. */
        @NotNull
        private Duration clockSkew = Duration.ofSeconds(30);

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public Duration getTtl() {
            return ttl;
        }

        public void setTtl(Duration ttl) {
            this.ttl = ttl;
        }

        public Duration getClockSkew() {
            return clockSkew;
        }

        public void setClockSkew(Duration clockSkew) {
            this.clockSkew = clockSkew;
        }
    }

    public static class Lockout {

        /** Disable to turn off throttling entirely (useful in tests). */
        private boolean enabled = true;

        /** Failed attempts tolerated inside {@link #window} before the account is locked. */
        @Min(1)
        private int maxAttempts = 5;

        /** Sliding window that failed attempts are counted in. */
        @NotNull
        private Duration window = Duration.ofMinutes(15);

        /** How long further attempts are refused once {@link #maxAttempts} is exceeded. */
        @NotNull
        private Duration lockDuration = Duration.ofMinutes(15);

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
        }

        public Duration getWindow() {
            return window;
        }

        public void setWindow(Duration window) {
            this.window = window;
        }

        public Duration getLockDuration() {
            return lockDuration;
        }

        public void setLockDuration(Duration lockDuration) {
            this.lockDuration = lockDuration;
        }
    }

    public static class PasswordReset {

        /** How long a generated reset token stays usable. */
        @NotNull
        private Duration tokenTtl = Duration.ofMinutes(30);

        public Duration getTokenTtl() {
            return tokenTtl;
        }

        public void setTokenTtl(Duration tokenTtl) {
            this.tokenTtl = tokenTtl;
        }
    }

    public static class DemoUser {

        /** Set to false once a real user store is wired in. */
        private boolean enabled = true;

        @Email
        private String email = "demo@example.com";

        /** Stored hashed at startup; it is never written to disk or logged. */
        private String password = "Password123!";

        private String name = "Demo User";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
