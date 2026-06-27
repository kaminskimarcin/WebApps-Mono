package com.taskboard.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    private String id;
    private String name;
    private List<String> members; // Lista identyfikatorów UID użytkowników
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeamMember {
        private String uid;
        private String displayName;
        private String email;
    }
}
