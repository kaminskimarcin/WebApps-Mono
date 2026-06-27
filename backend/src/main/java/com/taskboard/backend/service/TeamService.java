package com.taskboard.backend.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.taskboard.backend.model.Team;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class TeamService {

    private static final String COLLECTION_NAME = "teams";

    public Team createTeam(String teamName, String creatorUid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String id = UUID.randomUUID().toString();
        
        Team team = Team.builder()
                .id(id)
                .name(teamName)
                .members(new ArrayList<>(Collections.singletonList(creatorUid)))
                .build();

        ApiFuture<WriteResult> collectionsApiFuture = db.collection(COLLECTION_NAME).document(team.getId()).set(team);
        collectionsApiFuture.get(); // czekamy na zapis
        log.info("Team created with ID: {}", id);
        return team;
    }

    public List<Team> getTeamsForUser(String userUid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).whereArrayContains("members", userUid).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        
        List<Team> teams = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            teams.add(document.toObject(Team.class));
        }
        return teams;
    }

    public void joinTeam(String teamId, String userUid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(teamId);
        
        // W prawdziwej aplikacji należałoby użyć transakcji, by bezpiecznie zaktualizować listę
        // Poniżej proste pobranie i aktualizacja
        Team team = docRef.get().get().toObject(Team.class);
        if (team != null) {
            if (!team.getMembers().contains(userUid)) {
                team.getMembers().add(userUid);
                docRef.set(team).get();
                log.info("User {} joined team {}", userUid, teamId);
            }
        } else {
            throw new IllegalArgumentException("Team not found");
        }
    }

    public void deleteTeam(String teamId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(teamId).delete().get();
        log.info("Team deleted with ID: {}", teamId);
    }

    public List<Team.TeamMember> getTeamMembers(String teamId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        Team team = db.collection(COLLECTION_NAME).document(teamId).get().get().toObject(Team.class);
        
        List<Team.TeamMember> members = new ArrayList<>();
        if (team == null || team.getMembers() == null) return members;

        for (String uid : team.getMembers()) {
            try {
                com.google.firebase.auth.UserRecord userRecord = com.google.firebase.auth.FirebaseAuth.getInstance().getUser(uid);
                String displayName = userRecord.getDisplayName();
                if (displayName == null || displayName.isEmpty()) {
                    displayName = userRecord.getEmail();
                }
                if (displayName == null) {
                    displayName = "Nieznany (" + uid.substring(0, 5) + ")";
                }
                
                members.add(Team.TeamMember.builder()
                        .uid(uid)
                        .displayName(displayName)
                        .email(userRecord.getEmail())
                        .build());
            } catch (Exception e) {
                log.warn("Could not fetch user {}", uid);
                members.add(Team.TeamMember.builder().uid(uid).displayName("Nieznany (" + uid.substring(0, 5) + ")").build());
            }
        }
        return members;
    }
}
