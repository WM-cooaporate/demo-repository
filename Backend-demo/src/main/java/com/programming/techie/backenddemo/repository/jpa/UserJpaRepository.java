package com.programming.techie.backenddemo.repository.jpa;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data access to {@code users}. Emails arrive already normalised, so a plain equality
 * match is correct on PostgreSQL and MySQL alike — no {@code LOWER()} that would defeat the index.
 */
public interface UserJpaRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
