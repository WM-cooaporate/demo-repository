package com.programming.techie.backenddemo.web.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

/**
 * Trims surrounding whitespace while reading a JSON string.
 *
 * <p>Applied to email fields only: soft keyboards routinely append a space after an
 * autocompleted address, and rejecting that as an invalid email is a bug from the user's point
 * of view. Passwords are deliberately left untouched — spaces there are real characters.
 */
public class TrimmedStringDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String value = parser.getValueAsString();
        return value == null ? null : value.trim();
    }
}
