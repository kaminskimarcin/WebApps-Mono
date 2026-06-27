package com.taskboard.backend.controller;

import com.taskboard.backend.model.Task;
import com.taskboard.backend.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTeamTasks(@PathVariable String teamId) {
        try {
            List<Task> tasks = taskService.getTasksForTeam(teamId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable String teamId, @RequestBody Task task) {
        try {
            task.setTeamId(teamId);
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable String teamId, @PathVariable String taskId, @RequestBody Task task) {
        try {
            // Można tu dodać weryfikację, czy task faktycznie należy do teamId
            Task updatedTask = taskService.updateTask(taskId, task);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable String teamId, @PathVariable String taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
