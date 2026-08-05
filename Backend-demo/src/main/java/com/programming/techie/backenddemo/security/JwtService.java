package com.proj.login.security;

import com.proj.login.config.AuthProperties;
import com.proj.login.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies the HMAC-SHA256 access tokens the app stores after logging in.
 */
@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_NAME = "name";
    private static final String CLAIM_ROLES = "roles";

    private final AuthProperties.Jwt config;
    private final SecretKey key;
    private final Clock clock;

    public JwtService(AuthProperties properties, Clock clock) {
        this.config = properties.getJwt();
        this.clock = clock;
        try {
            this.key = Keys.hmacShaKeyFor(config.getSecret().getBytes(StandardCharsets.UTF_8));
        } catch (WeakKeyException e) {
            throw new IllegalStateException(
                    "app.auth.jwt.secret must be at least 32 characters (256 bits) for HMAC-SHA256", e);
        }
    }

    /** Signs a token for a freshly authenticated user. */
    public IssuedToken issue(User user) {
        Instant issuedAt = clock.instant();
        Instant expiresAt = issuedAt.plus(config.getTtl());
        String token = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(config.getIssuer())
                .subject(user.id())
                .claim(CLAIM_EMAIL, user.email())
                .claim(CLAIM_NAME, user.name())
                .claim(CLAIM_ROLES, List.copyOf(user.roles()))
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
        return new IssuedToken(token, expiresAt, config.getTtl());
    }

    /**
     * Verifies signature, issuer and expiry.
     *
     * @throws JwtException if the token is malformed, tampered with, expired or foreign
     */
    public ParsedToken parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(config.getIssuer())
                .clockSkewSeconds(config.getClockSkew().toSeconds())
                .clock(() -> Date.from(clock.instant()))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        List<?> rawRoles = claims.get(CLAIM_ROLES, List.class);
        Set<String> roles = rawRoles == null
                ? Set.of()
                : rawRoles.stream().map(String::valueOf).collect(Collectors.toUnmodifiableSet());

        return new ParsedToken(
                claims.getSubject(),
                claims.get(CLAIM_EMAIL, String.class),
                claims.get(CLAIM_NAME, String.class),
                roles,
                claims.getExpiration().toInstant());
    }

    /** A signed token together with the lifetime the client should assume. */
    public record IssuedToken(String token, Instant expiresAt, Duration ttl) {
    }

    /** The verified contents of a presented token. */
    public record ParsedToken(String userId, String email, String name, Set<String> roles, Instant expiresAt) {
    }
}
