package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analysis")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long id;

    @Column(name = "candidate_id")
    private Long candidateId; // Maps to candidate application ID

    @Column(name = "full_name")
    private String extractedName;

    @Column(name = "email")
    private String extractedEmail;

    @Column(name = "mobile")
    private String extractedPhone;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String extractedSkills;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String extractedExperience;

    @Column(name = "education", columnDefinition = "TEXT")
    private String extractedEducation;

    @Column(name = "gender")
    private String gender;

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;

    @Column(name = "linkedin_url", columnDefinition = "TEXT")
    private String linkedinUrl;

    @Column(name = "github_url", columnDefinition = "TEXT")
    private String githubUrl;

    @Column(name = "portfolio_url", columnDefinition = "TEXT")
    private String portfolioUrl;

    @Column(name = "match_score")
    private Integer matchScore = 0;

    // Retained for backward compatibility
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String matchingSkills;

    @Column(columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String suitability;

    private LocalDateTime createdAt = LocalDateTime.now();

    public ResumeAnalysis() {}

    public ResumeAnalysis(Long candidateId, String summary, Integer matchScore, String matchingSkills, String missingSkills, String suitability) {
        this.candidateId = candidateId;
        this.summary = summary;
        this.matchScore = matchScore;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.suitability = suitability;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getExtractedName() {
        return extractedName;
    }

    public void setExtractedName(String extractedName) {
        this.extractedName = extractedName;
    }

    public String getExtractedEmail() {
        return extractedEmail;
    }

    public void setExtractedEmail(String extractedEmail) {
        this.extractedEmail = extractedEmail;
    }

    public String getExtractedPhone() {
        return extractedPhone;
    }

    public void setExtractedPhone(String extractedPhone) {
        this.extractedPhone = extractedPhone;
    }

    public String getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public String getExtractedExperience() {
        return extractedExperience;
    }

    public void setExtractedExperience(String extractedExperience) {
        this.extractedExperience = extractedExperience;
    }

    public String getExtractedEducation() {
        return extractedEducation;
    }

    public void setExtractedEducation(String extractedEducation) {
        this.extractedEducation = extractedEducation;
    }

    public Integer getAiMatchScore() {
        return matchScore;
    }

    public void setAiMatchScore(Integer aiMatchScore) {
        this.matchScore = aiMatchScore;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchingSkills() {
        return matchingSkills;
    }

    public void setMatchingSkills(String matchingSkills) {
        this.matchingSkills = matchingSkills;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getSuitability() {
        return suitability;
    }

    public void setSuitability(String suitability) {
        this.suitability = suitability;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

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
}
