package com.programming.techie.backenddemo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.programming.techie.backenddemo.security.JwtAuthenticationFilter;
import com.programming.techie.backenddemo.service.LoggingPasswordResetNotifier;
import com.programming.techie.backenddemo.service.PasswordResetNotifier;
import com.programming.techie.backenddemo.web.dto.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless security: no sessions, no login form, no CSRF tokens — the app authenticates every
 * request with a bearer token, and only the login screen's own endpoints are public.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter)
            throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/forgot-password").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, ex) ->
                                writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "UNAUTHORIZED", "Sign in to continue."))
                        .accessDeniedHandler((request, response, ex) ->
                                writeError(response, HttpServletResponse.SC_FORBIDDEN,
                                        "FORBIDDEN", "You do not have access to this resource.")))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeError(HttpServletResponse response, int status, String code, String message)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        if (status == HttpServletResponse.SC_UNAUTHORIZED) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        objectMapper.writeValue(response.getOutputStream(), ApiError.of(code, message));
    }

    /**
     * BCrypt at strength 12 — roughly 250ms per verification on current hardware, which is the
     * point: it makes offline cracking of a leaked hash expensive.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AuthProperties properties) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOriginPatterns(properties.getAllowedOrigins());
        cors.setAllowedMethods(java.util.List.of("GET", "POST", "OPTIONS"));
        cors.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type"));
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }

    /** Injected everywhere time is read, so tests can run against a fixed instant. */
    @Bean
    @ConditionalOnMissingBean(Clock.class)
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    @ConditionalOnMissingBean(PasswordResetNotifier.class)
    public PasswordResetNotifier passwordResetNotifier() {
        return new LoggingPasswordResetNotifier();
    }
}
