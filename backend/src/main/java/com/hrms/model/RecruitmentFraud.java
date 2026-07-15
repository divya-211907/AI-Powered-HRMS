package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruitment_fraud")
public class RecruitmentFraud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String candidateId; // Candidate Email
    private Long applicationId; // Application DB ID
    private int fraudScore;
    private String riskLevel;
    private int duplicateScore;
    
    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public RecruitmentFraud() {}

    public RecruitmentFraud(String candidateId, Long applicationId, int fraudScore, String riskLevel, int duplicateScore, String aiAnalysis) {
        this.candidateId = candidateId;
        this.applicationId = applicationId;
        this.fraudScore = fraudScore;
        this.riskLevel = riskLevel;
        this.duplicateScore = duplicateScore;
        this.aiAnalysis = aiAnalysis;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public int getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(int fraudScore) {
        this.fraudScore = fraudScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getDuplicateScore() {
        return duplicateScore;
    }

    public void setDuplicateScore(int duplicateScore) {
        this.duplicateScore = duplicateScore;
    }

    public String getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(String aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
