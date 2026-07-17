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

    @Column(name = "recipient_role")
    private String recipientRole; // HR, EMPLOYEE, CANDIDATE, ADMIN

    @Column(name = "recipient_id")
    private Long recipientId;

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
        if ((this.recipientRole == null || this.recipientId == null) && this.email != null && !this.email.isEmpty()) {
            try {
                org.springframework.context.ApplicationContext ctx = com.hrms.util.SpringContextHelper.getContext();
                if (ctx != null) {
                    com.hrms.repository.EmployeeRepository empRepo = ctx.getBean(com.hrms.repository.EmployeeRepository.class);
                    com.hrms.repository.HrUserRepository hrRepo = ctx.getBean(com.hrms.repository.HrUserRepository.class);
                    com.hrms.repository.RecruitmentRepository recruitRepo = ctx.getBean(com.hrms.repository.RecruitmentRepository.class);
                    
                    // 1. Check HR
                    java.util.Optional<com.hrms.model.HrUser> hrOpt = hrRepo.findByEmail(this.email);
                    if (hrOpt.isPresent()) {
                        this.recipientRole = "HR";
                        this.recipientId = hrOpt.get().getId();
                        return;
                    }
                    
                    // 2. Check Employee
                    java.util.List<com.hrms.model.Employee> emps = empRepo.findAllByEmail(this.email);
                    if (!emps.isEmpty()) {
                        this.recipientRole = "EMPLOYEE";
                        this.recipientId = emps.get(0).getId();
                        return;
                    }
                    
                    // 3. Check Candidate
                    java.util.Optional<com.hrms.model.Recruitment> rOpt = recruitRepo.findByEmail(this.email);
                    if (rOpt.isPresent()) {
                        this.recipientRole = "CANDIDATE";
                        this.recipientId = rOpt.get().getId();
                        return;
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    @PostPersist
    public void postPersist() {
        if (this.email != null && !this.email.isEmpty()) {
            try {
                org.springframework.context.ApplicationContext ctx = com.hrms.util.SpringContextHelper.getContext();
                if (ctx != null) {
                    com.hrms.service.EmailService emailService = ctx.getBean(com.hrms.service.EmailService.class);
                    String subject = this.title != null ? this.title : "New Notification";
                    String messageText = this.message != null ? this.message : "";
                    
                    System.out.println("[MAIL DEBUG] Recipient: " + this.email);
                    System.out.println("[MAIL DEBUG] Subject: " + subject);
                    
                    emailService.sendWorkflowMail(this.email, subject, messageText);
                    
                    System.out.println("[MAIL DEBUG] Mail send success");
                }
            } catch (Exception ex) {
                System.err.println("[MAIL DEBUG] Mail send failed: " + ex.getMessage());
            }
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
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    // Legacy/Alias support
    public String getRole() { return recipientRole; }
    public void setRole(String role) { this.recipientRole = role; }
    public Long getUserId() { return recipientId; }
    public void setUserId(Long userId) { this.recipientId = userId; }
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