package com.taskboard.backend.controller;

import com.taskboard.backend.model.Team;
import com.taskboard.backend.service.TeamService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody TeamCreateRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String uid = auth.getName();
            Team team = teamService.createTeam(request.getName(), uid);
            return ResponseEntity.ok(team);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Team>> getMyTeams() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String uid = auth.getName();
            List<Team> teams = teamService.getTeamsForUser(uid);
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<Void> joinTeam(@PathVariable String teamId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String uid = auth.getName();
            teamService.joinTeam(teamId, uid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String teamId) {
        try {
            teamService.deleteTeam(teamId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<Team.TeamMember>> getTeamMembers(@PathVariable String teamId) {
        try {
            List<Team.TeamMember> members = teamService.getTeamMembers(teamId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Data
    public static class TeamCreateRequest {
        private String name;
    }
}
