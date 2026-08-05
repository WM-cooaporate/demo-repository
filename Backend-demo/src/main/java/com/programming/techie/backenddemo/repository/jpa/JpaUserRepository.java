package com.proj.login.repository.jpa;

import com.proj.login.domain.Emails;
import com.proj.login.domain.User;
import com.proj.login.repository.UserRepository;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Database-backed {@link UserRepository}, active unless {@code app.auth.store=memory}.
 */
@Repository
@ConditionalOnProperty(name = "app.auth.store", havingValue = "jpa", matchIfMissing = true)
public class JpaUserRepository implements UserRepository {

    private final UserJpaRepository users;

    public JpaUserRepository(UserJpaRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        String normalized = Emails.normalize(email);
        return normalized == null
                ? Optional.empty()
                : users.findByEmail(normalized).map(UserEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(String id) {
        return id == null ? Optional.empty() : users.findById(id).map(UserEntity::toDomain);
    }
}
