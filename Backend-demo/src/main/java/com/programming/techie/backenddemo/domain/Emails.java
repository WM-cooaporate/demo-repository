package com.programming.techie.backenddemo.domain;

import java.util.Locale;

/**
 * Email handles are compared case-insensitively, so every lookup goes through here first.
 */
public final class Emails {

    private Emails() {
    }

    public static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
