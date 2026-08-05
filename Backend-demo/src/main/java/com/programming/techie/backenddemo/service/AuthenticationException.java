package com.programming.techie.backenddemo.service;

/**
 * Base type for every way a login can legitimately fail. Each subclass maps to one
 * {@code code} in the JSON error body.
 */
public abstract class AuthenticationException extends RuntimeException {

    private final String code;

    protected AuthenticationException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }

    /** Wrong email or wrong password — deliberately indistinguishable to the caller. */
    public static class InvalidCredentials extends AuthenticationException {
        public InvalidCredentials() {
            super("INVALID_CREDENTIALS", "Email or password is incorrect.");
        }
    }

    /** Right password, but the account may not sign in. */
    public static class AccountDisabled extends AuthenticationException {
        public AccountDisabled() {
            super("ACCOUNT_DISABLED", "This account has been disabled. Contact support for help.");
        }
    }

    /** Too many failed attempts; carries how long the caller has to wait. */
    public static class AccountLocked extends AuthenticationException {

        private final long retryAfterSeconds;

        public AccountLocked(long retryAfterSeconds) {
            super("ACCOUNT_LOCKED",
                    "Too many failed attempts. Try again in " + Math.max(1, retryAfterSeconds / 60) + " minute(s).");
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }
}
