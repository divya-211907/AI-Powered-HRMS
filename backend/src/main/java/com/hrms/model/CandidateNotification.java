package com.hrms.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("CANDIDATE_SUB")
public class CandidateNotification extends Notification {

    public CandidateNotification() {
        super();
    }

    public CandidateNotification(String email, String message, boolean isRead, LocalDateTime createdAt) {
        super(email, message, isRead, createdAt);
    }

    public CandidateNotification(Long candidateId, Long applicationId, String title, String message, boolean isRead, LocalDateTime createdAt, String email) {
        super(candidateId, applicationId, title, message, isRead, createdAt, email);
    }
}
