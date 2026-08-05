package com.programming.techie.backenddemo.web.dto;

/**
 * Body of a successful login. {@code expiresIn} is in seconds so the app can schedule a
 * re-login without parsing the token itself.
 */
public record LoginResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {

    public static LoginResponse bearer(String accessToken, long expiresInSeconds, UserResponse user) {
        return new LoginResponse(accessToken, "Bearer", expiresInSeconds, user);
    }
}
