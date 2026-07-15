package com.hrms.dto;

public class RecruitmentDto {
    private String candidateName;
    private String email;
    private String mobile;
    private String qualification;
    private String skills;
    private String experience;
    private String position;
    private String hrEmail;
    private Long jobOpeningId;
    private String gender;
    private String certifications;
    private String portfolioLinks;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String password;

    public RecruitmentDto() {}

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getHrEmail() { return hrEmail; }
    public void setHrEmail(String hrEmail) { this.hrEmail = hrEmail; }

    public Long getJobOpeningId() { return jobOpeningId; }
    public void setJobOpeningId(Long jobOpeningId) { this.jobOpeningId = jobOpeningId; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getPortfolioLinks() { return portfolioLinks; }
    public void setPortfolioLinks(String portfolioLinks) { this.portfolioLinks = portfolioLinks; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    private String currentLocation;
    private String projects;

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }
}
