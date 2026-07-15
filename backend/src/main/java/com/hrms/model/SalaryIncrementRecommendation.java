package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class SalaryIncrementRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    private double attendanceRate;
    private double overtimeHours;
    private int performanceRating;
    private String experience;
    private boolean isEligible;
    private double suggestedIncrement;
    private double originalSuggestedIncrement;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private double currentSalary;
    private double newEstimatedSalary;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String hrEmail;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public double getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public int getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(int performanceRating) {
        this.performanceRating = performanceRating;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }

    public double getSuggestedIncrement() {
        return suggestedIncrement;
    }

    public void setSuggestedIncrement(double suggestedIncrement) {
        this.suggestedIncrement = Math.max(0, suggestedIncrement);
    }

    public double getOriginalSuggestedIncrement() {
        return originalSuggestedIncrement;
    }

    public void setOriginalSuggestedIncrement(double originalSuggestedIncrement) {
        this.originalSuggestedIncrement = Math.max(0, originalSuggestedIncrement);
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public double getCurrentSalary() {
        return currentSalary;
    }

    public void setCurrentSalary(double currentSalary) {
        this.currentSalary = Math.max(0, currentSalary);
    }

    public double getNewEstimatedSalary() {
        return newEstimatedSalary;
    }

    public void setNewEstimatedSalary(double newEstimatedSalary) {
        this.newEstimatedSalary = Math.max(0, newEstimatedSalary);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
