package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_applications")
public class Recruitment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String candidateName;
    private String email;
    private String password;
    private String mobile;
    private String qualification;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    private String experience;
    private String position;
    private String resumeName;
    private String status = "APPLIED";
    private String joiningDate;
    private String resumePath;
    private int aiScore;
    private String applicationDate;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @Column(columnDefinition = "TEXT")
    private String interviewDetails;
    
    private String hrEmail;
    private Long jobOpeningId;

    public Recruitment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getResumeName() {
        return resumeName;
    }

    public void setResumeName(String resumeName) {
        this.resumeName = resumeName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(String joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getResumePath() {
        return resumePath;
    }

    public void setResumePath(String resumePath) {
        this.resumePath = resumePath;
    }

    public int getAiScore() {
        return aiScore;
    }

    public void setAiScore(int aiScore) {
        if (aiScore < 0) {
            this.aiScore = 0;
        } else {
            this.aiScore = aiScore;
        }
    }

    @PrePersist
    @PreUpdate
    public void preventNegativeValues() {
        if (this.aiScore < 0) {
            this.aiScore = 0;
        }
        com.hrms.service.DateValidator.validateNotPastDate(this.joiningDate);
    }

    public String getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(String applicationDate) {
        this.applicationDate = applicationDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getInterviewDetails() {
        return interviewDetails;
    }

    public void setInterviewDetails(String interviewDetails) {
        this.interviewDetails = interviewDetails;
    }

    private Long assignedHrId;

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }

    public Long getJobOpeningId() {
        return jobOpeningId;
    }

    public void setJobOpeningId(Long jobOpeningId) {
        this.jobOpeningId = jobOpeningId;
    }

    public Long getAssignedHrId() {
        return assignedHrId;
    }

    public void setAssignedHrId(Long assignedHrId) {
        this.assignedHrId = assignedHrId;
    }

    private String gender;
    private String certifications;
    private String portfolioLinks;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public String getPortfolioLinks() {
        return portfolioLinks;
    }

    public void setPortfolioLinks(String portfolioLinks) {
        this.portfolioLinks = portfolioLinks;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    private String currentLocation;
    private String projects;
    private Integer overallScore = 0;
    private Integer skillScore = 0;
    private Integer experienceScore = 0;
    private Integer educationScore = 0;
    private Integer projectScore = 0;
    private String matchCategory;
    @Column(columnDefinition = "TEXT")
    private String aiExplanation;
    private String suggestedDepartment;
    @Column(columnDefinition = "TEXT")
    private String skillGapAnalysis;
    private Integer interviewReadinessScore = 0;
    private String candidateRisk;
    private String hiringRecommendation;
    private Long duplicateCandidateId;
    private Integer duplicateSimilarity = 0;

    public String getCurrentLocation() {
        return currentLocation;
    }
    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public String getProjects() {
        return projects;
    }
    public void setProjects(String projects) {
        this.projects = projects;
    }

    public Integer getOverallScore() {
        return overallScore;
    }
    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getSkillScore() {
        return skillScore;
    }
    public void setSkillScore(Integer skillScore) {
        this.skillScore = skillScore;
    }

    public Integer getExperienceScore() {
        return experienceScore;
    }
    public void setExperienceScore(Integer experienceScore) {
        this.experienceScore = experienceScore;
    }

    public Integer getEducationScore() {
        return educationScore;
    }
    public void setEducationScore(Integer educationScore) {
        this.educationScore = educationScore;
    }

    public Integer getProjectScore() {
        return projectScore;
    }
    public void setProjectScore(Integer projectScore) {
        this.projectScore = projectScore;
    }

    public String getMatchCategory() {
        return matchCategory;
    }
    public void setMatchCategory(String matchCategory) {
        this.matchCategory = matchCategory;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }
    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public String getSuggestedDepartment() {
        return suggestedDepartment;
    }
    public void setSuggestedDepartment(String suggestedDepartment) {
        this.suggestedDepartment = suggestedDepartment;
    }

    public String getSkillGapAnalysis() {
        return skillGapAnalysis;
    }
    public void setSkillGapAnalysis(String skillGapAnalysis) {
        this.skillGapAnalysis = skillGapAnalysis;
    }

    public Integer getInterviewReadinessScore() {
        return interviewReadinessScore;
    }
    public void setInterviewReadinessScore(Integer interviewReadinessScore) {
        this.interviewReadinessScore = interviewReadinessScore;
    }

    public String getCandidateRisk() {
        return candidateRisk;
    }
    public void setCandidateRisk(String candidateRisk) {
        this.candidateRisk = candidateRisk;
    }

    public String getHiringRecommendation() {
        return hiringRecommendation;
    }
    public void setHiringRecommendation(String hiringRecommendation) {
        this.hiringRecommendation = hiringRecommendation;
    }

    public Long getDuplicateCandidateId() {
        return duplicateCandidateId;
    }
    public void setDuplicateCandidateId(Long duplicateCandidateId) {
        this.duplicateCandidateId = duplicateCandidateId;
    }

    public Integer getDuplicateSimilarity() {
        return duplicateSimilarity;
    }
    public void setDuplicateSimilarity(Integer duplicateSimilarity) {
        this.duplicateSimilarity = duplicateSimilarity;
    }

    private Boolean firstLogin = true;
    @Column(length = 2000)
    private String passwordHistory = "";

    @Transient
    private String token;

    public Boolean getFirstLogin() { return firstLogin; }
    public void setFirstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; }

    public String getPasswordHistory() { return passwordHistory; }
    public void setPasswordHistory(String passwordHistory) { this.passwordHistory = passwordHistory; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}