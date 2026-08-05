package com.programming.techie.backenddemo.web;

import com.programming.techie.backenddemo.domain.User;
import com.programming.techie.backenddemo.security.AuthenticatedUser;
import com.programming.techie.backenddemo.service.AuthService;
import com.programming.techie.backenddemo.service.PasswordResetService;
import com.programming.techie.backenddemo.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Every endpoint the login screen talks to, and nothing else.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    /** Login button: exchanges email + password for an access token. */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthenticatedSession session = authService.login(request.email(), request.password());
        return LoginResponse.bearer(
                session.token().token(),
                session.token().ttl().toSeconds(),
                UserResponse.from(session.user()));
    }

    /**
     * Session restore: the app calls this at startup with the stored token to find out whether
     * it can skip the login screen.
     */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthenticatedUser principal) {
        User user = authService.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
        return UserResponse.from(user);
    }

    /**
     * "Forget Password" link. Always answers 202 with the same body, whether or not the email
     * is registered, so the endpoint cannot be used to discover accounts.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.request(request.email());
        return ResponseEntity.accepted().body(new MessageResponse(
                "If that email is registered, a password reset link is on its way."));
    }
}
