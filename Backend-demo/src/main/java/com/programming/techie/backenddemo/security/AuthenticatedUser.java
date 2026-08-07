package com.programming.techie.backenddemo.security;

/**
 * Principal placed in the security context once a bearer token has been verified and the
 * account behind it re-checked.
 *
 * @param id    user id taken from the token subject
 * @param email login handle
 * @param name  display name
 */
public record AuthenticatedUser(String id, String email, String name) {
}
