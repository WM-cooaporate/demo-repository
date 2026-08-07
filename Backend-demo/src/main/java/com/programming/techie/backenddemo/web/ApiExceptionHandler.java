package com.programming.techie.backenddemo.web;


import java.util.LinkedHashMap;
import java.util.Map;

import com.programming.techie.backenddemo.service.AuthenticationException;
import com.programming.techie.backenddemo.web.dto.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Maps failures to the single {@link ApiError} shape the app parses.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(ApiError.validation("Please correct the highlighted fields.", fieldErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
                .body(ApiError.of("MALFORMED_REQUEST", "The request body could not be read."));
    }

    @ExceptionHandler(AuthenticationException.AccountLocked.class)
    public ResponseEntity<ApiError> handleLocked(AuthenticationException.AccountLocked e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(e.retryAfterSeconds()))
                .body(ApiError.of(e.code(), e.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.AccountDisabled.class)
    public ResponseEntity<ApiError> handleDisabled(AuthenticationException.AccountDisabled e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of(e.code(), e.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.InvalidCredentials.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(AuthenticationException.InvalidCredentials e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of(e.code(), e.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException e) {
        HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
        String code = status == null ? "ERROR" : status.name();
        String reason = e.getReason() == null ? "Request failed." : e.getReason();
        return ResponseEntity.status(e.getStatusCode()).body(ApiError.of(code, reason));
    }

    /** Last resort: log the detail, tell the client nothing that could help an attacker. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception e) {
        log.error("Unhandled failure while serving an auth request", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("INTERNAL_ERROR", "Something went wrong. Please try again."));
    }
}
