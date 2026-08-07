package com.programming.techie.backenddemo.web.dto;

/** Plain acknowledgement body, used where the response must not reveal anything else. */
public record MessageResponse(String message) {
}
