package com.taskboard.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.credential-path}")
    private String credentialPath;

    private final ResourceLoader resourceLoader;

    public FirebaseConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void initialize() {
        try {
            String resolvedPath = credentialPath;
            if (!resolvedPath.startsWith("classpath:") && !resolvedPath.startsWith("file:")) {
                resolvedPath = "file:" + resolvedPath;
            }
            Resource resource = resourceLoader.getResource(resolvedPath);
            if (!resource.exists()) {
                log.warn("Firebase credential file not found at path: {}. Firebase will not be initialized if default credentials are not present.", resolvedPath);
                return;
            }

            try (InputStream serviceAccount = resource.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase application has been initialized");
                }
            }
        } catch (Exception e) {
            log.error("Error initializing Firebase", e);
        }
    }
}
