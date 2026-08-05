package com.programming.techie.backenddemo.repository.jpa;

import com.programming.techie.backenddemo.domain.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * The {@code users} table.
 *
 * <p>Column types are deliberately the portable ones — {@code VARCHAR} ids rather than a native
 * UUID type, roles in a side table rather than an array — so the same mapping serves both
 * PostgreSQL and MySQL. The schema itself is owned by Flyway, not by Hibernate.
 */
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    /** Always stored normalised (lower-case, trimmed); a unique index enforces one per address. */
    @Column(name = "email", length = 254, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 100, nullable = false)
    private String passwordHash;

    @Column(name = "name", length = 120, nullable = false)
    private String name;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", length = 64, nullable = false)
    private Set<String> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserEntity() {
        // for JPA
    }

    public UserEntity(String id, String email, String passwordHash, String name, boolean enabled, Set<String> roles) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.enabled = enabled;
        this.roles = new HashSet<>(roles);
    }

    @PrePersist
    void stampCreatedAt() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public static UserEntity from(User user) {
        return new UserEntity(
                user.id(), user.email(), user.passwordHash(), user.name(), user.enabled(), user.roles());
    }

    public User toDomain() {
        return new User(id, email, passwordHash, name, enabled, Set.copyOf(roles));
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getName() {
        return name;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
