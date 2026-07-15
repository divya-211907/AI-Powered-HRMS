package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_performance_ai_insight")
public class EmployeePerformanceAiInsight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    
    @Column(columnDefinition = "TEXT")
    private String performanceSummary;

    @Column(columnDefinition = "TEXT")
    private String trainingRecommendations;

    private Double rating;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getPerformanceSummary() { return performanceSummary; }
    public void setPerformanceSummary(String performanceSummary) { this.performanceSummary = performanceSummary; }
    public String getTrainingRecommendations() { return trainingRecommendations; }
    public void setTrainingRecommendations(String trainingRecommendations) { this.trainingRecommendations = trainingRecommendations; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    private String hrEmail;
    public String getHrEmail() { return hrEmail; }
    public void setHrEmail(String hrEmail) { this.hrEmail = hrEmail; }
}
