-- Accounts the login screen authenticates against.
CREATE TABLE users (
    id            VARCHAR(36)  NOT NULL,
    email         VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    name          VARCHAR(120) NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_users PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Emails are stored already normalised (lower-case, trimmed), so a plain unique index both
-- enforces one account per address and serves the login lookup. 254 utf8mb4 characters stay
-- within InnoDB's 3072-byte index limit.
CREATE UNIQUE INDEX ux_users_email ON users (email);

CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL,
    role    VARCHAR(64) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
