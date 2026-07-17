package com.hrms.controller;

import com.hrms.model.Recruitment;
import com.hrms.dto.RecruitmentDto;
import com.hrms.service.RecruitmentService;
import com.hrms.exception.RecruitmentException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/recruitments")
@CrossOrigin("*")
public class RecruitmentController {

    @Autowired
    private RecruitmentService recruitmentService;

    @Autowired
    private com.hrms.repository.RecruitmentRepository recruitmentRepository;

    @Autowired
    private com.hrms.repository.ApplicationStatusHistoryRepository applicationStatusHistoryRepository;

    // ================= GET ALL =================
    @GetMapping
    public List<Recruitment> getAll(
            @RequestHeader(value = "X-HR-Id", required = false) Long assignedHrId,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (assignedHrId != null) {
            if (hrEmail != null && !hrEmail.isEmpty()) {
                List<Recruitment> byId = recruitmentRepository.findByAssignedHrId(assignedHrId);
                List<Recruitment> byEmail = recruitmentRepository.findByHrEmail(hrEmail);
                java.util.Set<Recruitment> combined = new java.util.LinkedHashSet<>(byId);
                combined.addAll(byEmail);
                return new java.util.ArrayList<>(combined);
            }
            return recruitmentRepository.findByAssignedHrId(assignedHrId);
        }
        return recruitmentService.getAllCandidates(hrEmail);
    }

    // ================= STATUS HISTORY =================
    @GetMapping("/history")
    public List<com.hrms.model.ApplicationStatusHistory> getHistory(@RequestParam String email) {
        java.util.Optional<Recruitment> candidate = recruitmentService.getCandidateByEmail(email);
        if (candidate.isPresent()) {
            return applicationStatusHistoryRepository.findByApplicationId(candidate.get().getId());
        }
        return java.util.Collections.emptyList();
    }

    // ================= RESUME PARSING =================
    @PostMapping(value = "/parse-resume", consumes = "multipart/form-data")
    public com.hrms.model.ResumeExtraction parseResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobId", required = false) Long jobId,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String geminiApiKey
    ) throws Exception {
        byte[] fileBytes = file.getBytes();
        String fileName = file.getOriginalFilename();
        String extractedText = recruitmentService.parseResumeText(fileBytes, fileName);
        return recruitmentService.runAiResumeExtraction(extractedText, jobId, geminiApiKey);
    }

    @GetMapping("/{id}/resume-extraction")
    public com.hrms.model.ResumeExtraction getResumeExtraction(@PathVariable Long id) {
        return recruitmentService.getResumeExtractionByCandidateId(id).orElse(null);
    }

    // ================= JSON SAVE =================
    @PostMapping(consumes = "application/json")
    public Recruitment addCandidate(
            @RequestBody RecruitmentDto dto,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String geminiApiKey) {
        
        Recruitment r = new Recruitment();
        r.setCandidateName(dto.getCandidateName());
        r.setEmail(dto.getEmail());
        r.setPassword(dto.getPassword());
        r.setMobile(dto.getMobile());
        r.setQualification(dto.getQualification());
        r.setSkills(dto.getSkills());
        r.setExperience(dto.getExperience());
        r.setPosition(dto.getPosition());
        r.setGender(dto.getGender());
        r.setCertifications(dto.getCertifications());
        r.setPortfolioLinks(dto.getPortfolioLinks());
        r.setLinkedinUrl(dto.getLinkedinUrl());
        r.setGithubUrl(dto.getGithubUrl());
        r.setPortfolioUrl(dto.getPortfolioUrl());
        r.setHrEmail(dto.getHrEmail() != null ? dto.getHrEmail() : hrEmail);
        r.setJobOpeningId(dto.getJobOpeningId());
        r.setCurrentLocation(dto.getCurrentLocation());
        r.setProjects(dto.getProjects());
        
        return recruitmentService.applyCandidate(r, geminiApiKey);
    }

    // ================= FILE UPLOAD =================
    @PostMapping(consumes = "multipart/form-data")
    public Recruitment add(
            @RequestParam(value = "candidateName", required = false) String candidateName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "mobile", required = false) String mobile,
            @RequestParam(value = "qualification", required = false) String qualification,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "certifications", required = false) String certifications,
            @RequestParam(value = "portfolioLinks", required = false) String portfolioLinks,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,
            @RequestParam(value = "githubUrl", required = false) String githubUrl,
            @RequestParam(value = "portfolioUrl", required = false) String portfolioUrl,
            @RequestParam(value = "jobOpeningId", required = false) Long jobOpeningId,
            @RequestParam(value = "currentLocation", required = false) String currentLocation,
            @RequestParam(value = "projects", required = false) String projects,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String geminiApiKey
    ) throws Exception {

        Recruitment r = new Recruitment();
        r.setCandidateName(candidateName);
        r.setEmail(email);
        r.setPassword(password);
        r.setMobile(mobile);
        r.setQualification(qualification);
        r.setSkills(skills);
        r.setExperience(experience);
        r.setPosition(position);
        r.setGender(gender);
        r.setCertifications(certifications);
        r.setPortfolioLinks(portfolioLinks);
        r.setLinkedinUrl(linkedinUrl);
        r.setGithubUrl(githubUrl);
        r.setPortfolioUrl(portfolioUrl);
        r.setCurrentLocation(currentLocation);
        r.setProjects(projects);
        r.setHrEmail(hrEmail);
        r.setJobOpeningId(jobOpeningId);

        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destination = new File(dir, fileName);
            file.transferTo(destination);

            r.setResumeName(fileName);
            r.setResumePath("/uploads/" + fileName);
        }

        return recruitmentService.applyCandidate(r, geminiApiKey);
    }

    // ================= GET BY EMAIL =================
    @GetMapping("/email")
    public Recruitment getByEmail(@RequestParam String email) {
        return recruitmentService.getCandidateByEmail(email).orElse(null);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public Recruitment update(
            @PathVariable Long id,
            @RequestBody Recruitment updated) {
        return recruitmentService.updateCandidateStatus(id, updated);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        recruitmentService.deleteCandidate(id);
        return "Deleted Successfully";
    }

    @Autowired
    private com.hrms.repository.ResumeAnalysisRepository resumeAnalysisRepository;

    @GetMapping("/{id}/resume-analysis")
    public com.hrms.model.ResumeAnalysis getResumeAnalysis(@PathVariable Long id) {
        return resumeAnalysisRepository.findByCandidateId(id).orElse(null);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public Recruitment login(@RequestBody RecruitmentDto req) {
        Recruitment r = recruitmentService.getCandidateByEmail(req.getEmail())
            .orElseThrow(() -> new RecruitmentException("Candidate not found"));
        r.setToken(com.hrms.util.JwtHelper.generateToken(r.getEmail(), "CANDIDATE"));
        return r;
    }
}