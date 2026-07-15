package com.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_extraction")
public class ResumeExtraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId; // Maps to candidate application ID

    private String extractedName;
    private String extractedEmail;
    private String extractedPhone;

    @Column(columnDefinition = "TEXT")
    private String extractedSkills;

    @Column(columnDefinition = "TEXT")
    private String extractedEducation;

    @Column(columnDefinition = "TEXT")
    private String extractedExperience;

    private Integer matchScore = 0;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Fields for complete resume parsed fields
    private String address;
    private String linkedin;
    private String github;
    private String degree;
    private String college;
    private String graduationYear;
    private String certifications;
    private String companies;
    private String designations;
    private String projects;
    private String languages;
    private String gender;
    private String portfolioLinks;
    private String preferredJobRole;

    @Column(columnDefinition = "TEXT")
    private String matchingSkills;

    @Column(columnDefinition = "TEXT")
    private String missingSkills;

    public ResumeExtraction() {}

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

    public String getExtractedEducation() {
        return extractedEducation;
    }

    public void setExtractedEducation(String extractedEducation) {
        this.extractedEducation = extractedEducation;
    }

    public String getExtractedExperience() {
        return extractedExperience;
    }

    public void setExtractedExperience(String extractedExperience) {
        this.extractedExperience = extractedExperience;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public String getCompanies() {
        return companies;
    }

    public void setCompanies(String companies) {
        this.companies = companies;
    }

    public String getDesignations() {
        return designations;
    }

    public void setDesignations(String designations) {
        this.designations = designations;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(String projects) {
        this.projects = projects;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPortfolioLinks() {
        return portfolioLinks;
    }

    public void setPortfolioLinks(String portfolioLinks) {
        this.portfolioLinks = portfolioLinks;
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

    public String getPreferredJobRole() {
        return preferredJobRole;
    }

    public void setPreferredJobRole(String preferredJobRole) {
        this.preferredJobRole = preferredJobRole;
    }

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
}
