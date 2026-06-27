package com.taskboard.backend.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.taskboard.backend.model.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class TaskService {

    private static final String COLLECTION_NAME = "tasks";

    public Task createTask(Task task) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String id = UUID.randomUUID().toString();
        task.setId(id);
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("TODO");
        }
        task.setCreatedAt(System.currentTimeMillis());

        ApiFuture<WriteResult> collectionsApiFuture = db.collection(COLLECTION_NAME).document(id).set(task);
        collectionsApiFuture.get();
        log.info("Task created with ID: {} for team: {}", id, task.getTeamId());
        return task;
    }

    public List<Task> getTasksForTeam(String teamId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).whereEqualTo("teamId", teamId).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Task> tasks = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            tasks.add(document.toObject(Task.class));
        }
        return tasks;
    }

    public Task updateTask(String taskId, Task updatedTask) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(taskId);
        
        Task existingTask = docRef.get().get().toObject(Task.class);
        if (existingTask != null) {
            existingTask.setTitle(updatedTask.getTitle());
            existingTask.setDescription(updatedTask.getDescription());
            existingTask.setStatus(updatedTask.getStatus());
            existingTask.setAssignedTo(updatedTask.getAssignedTo());
            existingTask.setPriority(updatedTask.getPriority());
            
            docRef.set(existingTask).get();
            log.info("Task updated with ID: {}", taskId);
            return existingTask;
        } else {
            throw new IllegalArgumentException("Task not found");
        }
    }

    public void deleteTask(String taskId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<WriteResult> writeResult = db.collection(COLLECTION_NAME).document(taskId).delete();
        writeResult.get();
        log.info("Task deleted with ID: {}", taskId);
    }
}
