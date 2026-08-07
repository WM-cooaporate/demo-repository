package com.programming.techie.backenddemo.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import tools.jackson.databind.annotation.JsonDeserialize;

/**
 * Body of {@code POST /api/auth/login} — the two fields on the login screen.
 *
 * <p>The password is only length-checked here: complexity rules belong to registration, and
 * enforcing them at login would leak what a valid password looks like.
 */
public record LoginRequest(
        @JsonDeserialize(using = TrimmedStringDeserializer.class)
        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 254, message = "Email is too long.")
        String email,

        @NotBlank(message = "Password is required.")
        @Size(max = 128, message = "Password is too long.")
        String password) {
}
