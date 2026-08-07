-- Accounts the login screen authenticates against.
CREATE TABLE users (
    id            VARCHAR(36)              NOT NULL,
    email         VARCHAR(254)             NOT NULL,
    password_hash VARCHAR(100)             NOT NULL,
    name          VARCHAR(120)             NOT NULL,
    enabled       BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_users PRIMARY KEY (id)
);

-- Emails are stored already normalised (lower-case, trimmed), so a plain unique index both
-- enforces one account per address and serves the login lookup.
CREATE UNIQUE INDEX ux_users_email ON users (email);

CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL,
    role    VARCHAR(64) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
