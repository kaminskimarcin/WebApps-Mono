package com.taskboard.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    private String id;
    private String title;
    private String description;
    private String status; // np. "TODO", "IN_PROGRESS", "DONE"
    private String teamId;
    private String assignedTo; // przypisany użytkownik
    private String priority; // np. LOW, MEDIUM, HIGH
    private long createdAt;
}
