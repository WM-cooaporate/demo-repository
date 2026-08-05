package com.programming.techie.backenddemo.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

/**
 * One error shape for every failure the login screen can hit, so the Flutter client only has
 * to parse a single structure.
 *
 * @param code        stable machine-readable code, e.g. {@code INVALID_CREDENTIALS}
 * @param message     human-readable text safe to show in a snackbar
 * @param timestamp   when the failure was produced
 * @param fieldErrors per-field validation messages, present only for {@code VALIDATION_FAILED}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String code, String message, Instant timestamp, Map<String, String> fieldErrors) {

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, Instant.now(), null);
    }

    public static ApiError validation(String message, Map<String, String> fieldErrors) {
        return new ApiError("VALIDATION_FAILED", message, Instant.now(), fieldErrors);
    }
}
