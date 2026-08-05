package com.programming.techie.backenddemo.repository;

import com.programming.techie.backenddemo.domain.User;

import java.util.Optional;

/**
 * The only persistence the login screen needs. Swap the in-memory implementation for a
 * JPA/JDBC one without touching the service or web layers.
 */
public interface UserRepository {

    /** Lookup by login handle; the implementation normalises the email itself. */
    Optional<User> findByEmail(String email);

    /** Lookup by id, used to re-validate the account behind a presented token. */
    Optional<User> findById(String id);
}
