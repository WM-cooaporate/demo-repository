package com.programming.techie.backenddemo.web.dto;


import com.programming.techie.backenddemo.domain.User;

/**
 * The subset of the account the app is allowed to see. Never carries the password hash.
 */
public record UserResponse(String id, String email, String name) {

    public static UserResponse from(User user) {
        return new UserResponse(user.id(), user.email(), user.name());
    }
}
