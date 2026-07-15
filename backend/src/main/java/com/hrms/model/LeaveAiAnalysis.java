package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_ai_analysis")
public class LeaveAiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "leave_request_id")
    private Long leaveRequestId;

    @Column(name = "employee_id")
    private Long employeeId;

    private String recommendation;

    @Column(name = "confidence_score")
    private Integer confidenceScore = 0;

    @Column(name = "ai_reason", columnDefinition = "TEXT")
    private String aiReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public LeaveAiAnalysis() {}

    public LeaveAiAnalysis(Long leaveRequestId, Long employeeId, String recommendation, Integer confidenceScore, String aiReason) {
        this.leaveRequestId = leaveRequestId;
        this.employeeId = employeeId;
        this.recommendation = recommendation;
        this.confidenceScore = confidenceScore;
        this.aiReason = aiReason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLeaveRequestId() {
        return leaveRequestId;
    }

    public void setLeaveRequestId(Long leaveRequestId) {
        this.leaveRequestId = leaveRequestId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public Integer getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getAiReason() {
        return aiReason;
    }

    public void setAiReason(String aiReason) {
        this.aiReason = aiReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
