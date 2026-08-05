package com.proj.login.domain;

import java.util.Set;

/**
 * A user account as far as the login screen is concerned.
 *
 * @param id           stable identifier placed in the token subject
 * @param email        normalised (lower-case, trimmed) email used as the login handle
 * @param passwordHash BCrypt hash; the plaintext password never leaves the request thread
 * @param name         display name echoed back to the app after a successful login
 * @param enabled      disabled accounts are rejected even with the right password
 * @param roles        authorities granted to the token
 */
public record User(
        String id,
        String email,
        String passwordHash,
        String name,
        boolean enabled,
        Set<String> roles) {

    public User {
        roles = roles == null ? Set.of() : Set.copyOf(roles);
    }
}
