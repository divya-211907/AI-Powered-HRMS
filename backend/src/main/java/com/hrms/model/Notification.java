package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorValue("BASE")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String type;
    private String role; // HR, EMPLOYEE, CANDIDATE, ADMIN
    private Long userId;

    @Column(name = "is_read")
    private boolean isRead;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private Long candidateId;
    private Long applicationId;
    private String email;

    public Notification() {}

    public Notification(int id, String receiver, String message) {
        this.id = (long) id;
        this.email = receiver;
        this.message = message;
        this.isRead = false;
        this.createdAt = java.time.LocalDateTime.now();
    }

    public Notification(String email, String message, boolean isRead, LocalDateTime createdAt) {
        this.email = email;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Notification(Long candidateId, Long applicationId, String title, String message, boolean isRead, LocalDateTime createdAt, String email) {
        this.candidateId = candidateId;
        this.applicationId = applicationId;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.email = email;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        
        // Auto-detect role and userId from email/receiver if not set
        if ((this.role == null || this.userId == null) && this.email != null && !this.email.isEmpty()) {
            try {
                org.springframework.context.ApplicationContext ctx = com.hrms.util.SpringContextHelper.getContext();
                if (ctx != null) {
                    com.hrms.repository.EmployeeRepository empRepo = ctx.getBean(com.hrms.repository.EmployeeRepository.class);
                    com.hrms.repository.HrUserRepository hrRepo = ctx.getBean(com.hrms.repository.HrUserRepository.class);
                    com.hrms.repository.RecruitmentRepository recruitRepo = ctx.getBean(com.hrms.repository.RecruitmentRepository.class);
                    
                    // 1. Check HR
                    java.util.Optional<com.hrms.model.HrUser> hrOpt = hrRepo.findByEmail(this.email);
                    if (hrOpt.isPresent()) {
                        this.role = "HR";
                        this.userId = hrOpt.get().getId();
                        return;
                    }
                    
                    // 2. Check Employee
                    java.util.List<com.hrms.model.Employee> emps = empRepo.findAllByEmail(this.email);
                    if (!emps.isEmpty()) {
                        this.role = "EMPLOYEE";
                        this.userId = emps.get(0).getId();
                        return;
                    }
                    
                    // 3. Check Candidate
                    java.util.Optional<com.hrms.model.Recruitment> rOpt = recruitRepo.findByEmail(this.email);
                    if (rOpt.isPresent()) {
                        this.role = "CANDIDATE";
                        this.userId = rOpt.get().getId();
                        return;
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}