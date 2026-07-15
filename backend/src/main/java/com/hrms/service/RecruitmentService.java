package com.hrms.service;

import com.hrms.model.Recruitment;
import com.hrms.model.CandidateStatus;
import com.hrms.model.CandidateNotification;
import com.hrms.model.InterviewSchedule;
import com.hrms.model.Notification;
import com.hrms.repository.RecruitmentRepository;
import com.hrms.repository.CandidateStatusRepository;
import com.hrms.repository.CandidateNotificationRepository;
import com.hrms.repository.InterviewScheduleRepository;
import com.hrms.exception.RecruitmentException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class RecruitmentService {

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    @Autowired
    private InterviewScheduleRepository interviewScheduleRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CandidateStatusRepository candidateStatusRepository;

    @Autowired
    private CandidateNotificationRepository candidateNotificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.hrms.repository.JobOpeningRepository jobOpeningRepository;

    @Autowired
    private com.hrms.repository.HrUserRepository hrUserRepository;

    @Autowired
    private com.hrms.repository.ApplicationStatusHistoryRepository applicationStatusHistoryRepository;

    @Autowired
    private com.hrms.repository.ResumeExtractionRepository resumeExtractionRepository;

    @Autowired
    private com.hrms.repository.ResumeAnalysisRepository resumeAnalysisRepository;

    @Autowired
    private RecruitmentFraudService recruitmentFraudService;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Autowired
    private com.hrms.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.hrms.repository.DepartmentRepository departmentRepository;

    private int calculateScore(String candidateSkills) {
        String[] requiredSkills = {"java", "spring boot", "mysql", "react"};
        if (candidateSkills == null) return 0;
        String skills = candidateSkills.toLowerCase();
        int matched = 0;
        for (String skill : requiredSkills) {
            if (skills.contains(skill)) matched++;
        }
        return (matched * 100) / requiredSkills.length;
    }

    public List<Recruitment> getAllCandidates(String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return recruitmentRepository.findByHrEmail(hrEmail);
        }
        return recruitmentRepository.findAll();
    }

    public Recruitment applyCandidate(Recruitment r, String geminiApiKey) {
        // 1. Same Email + Same Job Position Check
        if (r.getEmail() != null && r.getPosition() != null) {
            Optional<Recruitment> duplicateEmail = recruitmentRepository.findByEmailAndPosition(r.getEmail(), r.getPosition());
            if (duplicateEmail.isPresent()) {
                throw new RecruitmentException("You have already applied for this position.");
            }
        }
        
        // 2. Same Mobile Number + Same Job Position Check
        if (r.getMobile() != null && r.getPosition() != null) {
            Optional<Recruitment> duplicateMobile = recruitmentRepository.findByMobileAndPosition(r.getMobile(), r.getPosition());
            if (duplicateMobile.isPresent()) {
                throw new RecruitmentException("You have already applied for this position.");
            }
        }

        // 3. Duplicate JobOpening Check if ID is provided
        if (r.getJobOpeningId() != null) {
            if (r.getEmail() != null) {
                Optional<Recruitment> dupEmailJob = recruitmentRepository.findByEmailAndJobOpeningId(r.getEmail(), r.getJobOpeningId());
                if (dupEmailJob.isPresent()) {
                    throw new RecruitmentException("You have already applied for this position.");
                }
            }
            if (r.getMobile() != null) {
                Optional<Recruitment> dupMobileJob = recruitmentRepository.findByMobileAndJobOpeningId(r.getMobile(), r.getJobOpeningId());
                if (dupMobileJob.isPresent()) {
                    throw new RecruitmentException("You have already applied for this position.");
                }
            }
        }

        if (r.getJobOpeningId() != null) {
            jobOpeningRepository.findById(r.getJobOpeningId()).ifPresent(job -> {
                r.setHrEmail(job.getHrEmail());
                if (job.getHrId() != null) {
                    r.setAssignedHrId(job.getHrId());
                } else if (job.getHrEmail() != null) {
                    hrUserRepository.findByEmail(job.getHrEmail()).ifPresent(hr -> {
                        r.setAssignedHrId(hr.getId());
                    });
                }
            });
        }

        r.setStatus("APPLIED");
        r.setApplicationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        r.setAiScore(calculateScore(r.getSkills()));
        Recruitment saved = recruitmentRepository.save(r);

        try {
            recruitmentFraudService.runFraudCheck(saved, geminiApiKey);
        } catch (Exception ex) {
            System.err.println("Failed to run real-time fraud check: " + ex.getMessage());
        }

        try {
            // Notify Candidate
            candidateNotificationRepository.save(new CandidateNotification(
                saved.getEmail(),
                "Application Submitted: Your application for " + saved.getPosition() + " has been submitted successfully.",
                false,
                LocalDateTime.now()
            ));

            // Notify HR
            if (saved.getHrEmail() != null && !saved.getHrEmail().isEmpty()) {
                candidateNotificationRepository.save(new CandidateNotification(
                    saved.getHrEmail(),
                    "New candidate application received. Name: " + saved.getCandidateName() + ", Job: " + saved.getPosition() + ".",
                    false,
                    LocalDateTime.now()
                ));
            }
        } catch (Exception ex) {
            System.err.println("Failed to save application notifications: " + ex.getMessage());
        }

        // Parse and save resume extraction/analysis details
        String extractedTextForDup = "";

        // Parse and save resume extraction/analysis details
        if (saved.getResumePath() != null && !saved.getResumePath().trim().isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads";
                String fileName = saved.getResumeName();
                java.io.File destFile = new java.io.File(uploadDir, fileName);
                if (destFile.exists()) {
                    byte[] fileBytes = java.nio.file.Files.readAllBytes(destFile.toPath());
                    extractedTextForDup = parseResumeText(fileBytes, fileName);
                    
                    com.hrms.model.ResumeExtraction extraction = runAiResumeExtraction(extractedTextForDup, saved.getJobOpeningId(), geminiApiKey);
                    extraction.setCandidateId(saved.getId());
                    resumeExtractionRepository.save(extraction);
                    
                    // Update Recruitment metadata
                    saved.setCurrentLocation(extraction.getAddress());
                    saved.setProjects(extraction.getProjects());
                    saved.setOverallScore(extraction.getOverallScore());
                    saved.setSkillScore(extraction.getSkillScore());
                    saved.setExperienceScore(extraction.getExperienceScore());
                    saved.setEducationScore(extraction.getEducationScore());
                    saved.setProjectScore(extraction.getProjectScore());
                    saved.setMatchCategory(extraction.getMatchCategory());
                    saved.setAiExplanation(extraction.getAiExplanation());
                    
                    String deptSuggest = extraction.getSuggestedDepartment();
                    if (deptSuggest == null || deptSuggest.trim().isEmpty()) {
                        deptSuggest = determineDepartmentBySkills(extraction.getExtractedSkills());
                    }
                    saved.setSuggestedDepartment(deptSuggest);
                    saved.setSkillGapAnalysis(extraction.getSkillGapAnalysis());
                    saved.setInterviewReadinessScore(extraction.getInterviewReadinessScore());
                    saved.setCandidateRisk(extraction.getCandidateRisk());
                    saved.setHiringRecommendation(extraction.getHiringRecommendation());
                    
                    // Create and save ResumeAnalysis
                    com.hrms.model.ResumeAnalysis analysis = new com.hrms.model.ResumeAnalysis();
                    analysis.setCandidateId(saved.getId());
                    analysis.setExtractedName(extraction.getExtractedName());
                    analysis.setExtractedEmail(extraction.getExtractedEmail());
                    analysis.setExtractedPhone(extraction.getExtractedPhone());
                    analysis.setExtractedSkills(extraction.getExtractedSkills());
                    analysis.setExtractedExperience(extraction.getExtractedExperience());
                    analysis.setExtractedEducation(extraction.getExtractedEducation());
                    analysis.setAiMatchScore(extraction.getMatchScore());
                    analysis.setMatchingSkills(extraction.getMatchingSkills());
                    analysis.setMissingSkills(extraction.getMissingSkills());
                    analysis.setSuitability(extraction.getAiAnalysis());
                    analysis.setSummary(extraction.getAiAnalysis() != null ? extraction.getAiAnalysis() : "Resume summary analysis.");
                    analysis.setMatchScore(extraction.getMatchScore());
                    analysis.setGender(extraction.getGender());
                    analysis.setCertifications(extraction.getCertifications());
                    analysis.setLinkedinUrl(extraction.getLinkedin());
                    analysis.setGithubUrl(extraction.getGithub());
                    analysis.setPortfolioUrl(extraction.getPortfolioLinks());

                    analysis.setCurrentLocation(extraction.getAddress());
                    analysis.setProjects(extraction.getProjects());
                    analysis.setOverallScore(extraction.getOverallScore());
                    analysis.setSkillScore(extraction.getSkillScore());
                    analysis.setExperienceScore(extraction.getExperienceScore());
                    analysis.setEducationScore(extraction.getEducationScore());
                    analysis.setProjectScore(extraction.getProjectScore());
                    analysis.setMatchCategory(extraction.getMatchCategory());
                    analysis.setAiExplanation(extraction.getAiExplanation());
                    analysis.setSuggestedDepartment(saved.getSuggestedDepartment());
                    analysis.setSkillGapAnalysis(extraction.getSkillGapAnalysis());
                    analysis.setInterviewReadinessScore(extraction.getInterviewReadinessScore());
                    analysis.setCandidateRisk(extraction.getCandidateRisk());
                    analysis.setHiringRecommendation(extraction.getHiringRecommendation());

                    resumeAnalysisRepository.save(analysis);
                }
            } catch (Exception ex) {
                System.err.println("Failed to run post-save resume extraction/analysis: " + ex.getMessage());
            }
        }

        // Run Duplicate Candidate Check (always run at the end of applyCandidate)
        try {
            checkForDuplicates(saved, extractedTextForDup);
            recruitmentRepository.save(saved);
            
            // Sync duplicates fields to ResumeAnalysis if it exists
            java.util.Optional<com.hrms.model.ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findByCandidateId(saved.getId());
            if (analysisOpt.isPresent()) {
                com.hrms.model.ResumeAnalysis analysis = analysisOpt.get();
                analysis.setDuplicateCandidateId(saved.getDuplicateCandidateId());
                analysis.setDuplicateSimilarity(saved.getDuplicateSimilarity());
                resumeAnalysisRepository.save(analysis);
            }
        } catch (Exception ex) {
            System.err.println("Failed duplicate verification check: " + ex.getMessage());
        }

        return saved;
    }

    public Optional<Recruitment> getCandidateByEmail(String email) {
        return recruitmentRepository.findByEmail(email);
    }

    public Recruitment getCandidateById(Long id) {
        return recruitmentRepository.findById(id)
            .orElseThrow(() -> new RecruitmentException("Candidate not found with id: " + id));
    }

    public String generateNextEmployeeId() {
        return generateNextEmployeeId(null);
    }

    public String generateNextEmployeeId(com.hrms.model.Department dept) {
        int currentYear = java.time.LocalDate.now().getYear();
        String deptCode = "DEPT";
        if (dept != null && dept.getDepartmentName() != null) {
            deptCode = dept.getDepartmentName().toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (deptCode.isEmpty()) {
                deptCode = "DEPT";
            }
        }
        
        java.util.Random rand = new java.util.Random();
        boolean unique = false;
        String employeeId = null;
        int retries = 0;
        while (!unique && retries < 100) {
            int randomNum = 1000 + rand.nextInt(9000); // 4-digit number
            String candidateId = "EMP-" + currentYear + "-" + deptCode + "-" + randomNum;
            if (employeeRepository.findByEmployeeId(candidateId) == null) {
                employeeId = candidateId;
                unique = true;
            }
            retries++;
        }
        if (employeeId == null) {
            employeeId = "EMP-" + currentYear + "-" + deptCode + "-" + (1000 + rand.nextInt(9000));
        }
        return employeeId;
    }

    public double calculateTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null || text1.trim().isEmpty() || text2.trim().isEmpty()) {
            return 0.0;
        }
        
        java.util.Set<String> words1 = new java.util.HashSet<>(java.util.Arrays.asList(text1.toLowerCase().split("\\W+")));
        java.util.Set<String> words2 = new java.util.HashSet<>(java.util.Arrays.asList(text2.toLowerCase().split("\\W+")));
        
        java.util.Set<String> stopWords = new java.util.HashSet<>(java.util.Arrays.asList("and", "the", "for", "with", "a", "an", "of", "to", "in", "on", "at", "by", "is", "are", "this"));
        words1.removeAll(stopWords);
        words2.removeAll(stopWords);
        
        if (words1.isEmpty() || words2.isEmpty()) return 0.0;
        
        int intersectionSize = 0;
        for (String w : words1) {
            if (words2.contains(w)) {
                intersectionSize++;
            }
        }
        
        int unionSize = words1.size() + words2.size() - intersectionSize;
        return ((double) intersectionSize / unionSize) * 100.0;
    }

    public void checkForDuplicates(Recruitment r, String extractedText) {
        java.util.List<Recruitment> allCandidates = recruitmentRepository.findAll();
        for (Recruitment candidate : allCandidates) {
            if (candidate.getId().equals(r.getId())) continue;
            
            boolean duplicate = false;
            int similarityScore = 0;
            
            if (r.getEmail() != null && !r.getEmail().isEmpty() && r.getEmail().equalsIgnoreCase(candidate.getEmail())) {
                duplicate = true;
                similarityScore = 100;
            } else if (r.getMobile() != null && !r.getMobile().isEmpty() && r.getMobile().replaceAll("[^0-9]", "").equals(candidate.getMobile().replaceAll("[^0-9]", ""))) {
                duplicate = true;
                similarityScore = 100;
            } else if (r.getLinkedinUrl() != null && !r.getLinkedinUrl().isEmpty() && r.getLinkedinUrl().equalsIgnoreCase(candidate.getLinkedinUrl())) {
                duplicate = true;
                similarityScore = 100;
            } else if (extractedText != null && !extractedText.trim().isEmpty()) {
                java.util.Optional<com.hrms.model.ResumeExtraction> otherExtOpt = resumeExtractionRepository.findByCandidateId(candidate.getId());
                if (otherExtOpt.isPresent() && otherExtOpt.get().getExtractedSkills() != null) {
                    double skillSimilarity = calculateTextSimilarity(extractedText, otherExtOpt.get().getExtractedSkills());
                    if (skillSimilarity > 75.0) {
                        duplicate = true;
                        similarityScore = (int) skillSimilarity;
                    }
                }
            }
            
            if (duplicate) {
                r.setDuplicateCandidateId(candidate.getId());
                r.setDuplicateSimilarity(similarityScore);
                
                String hrEmail = r.getHrEmail();
                if (hrEmail == null || hrEmail.isEmpty()) {
                    hrEmail = "admin@workspace.com";
                }
                try {
                    notificationService.addNotification(new com.hrms.model.Notification(
                        0,
                        hrEmail,
                        "POTENTIAL DUPLICATE CANDIDATE DETECTED: " + r.getCandidateName() + " has " + similarityScore + "% similarity with " + candidate.getCandidateName()
                    ));
                } catch (Exception ex) {
                    System.err.println("Failed to save notification: " + ex.getMessage());
                }
                break;
            }
        }
    }

    public String determineDepartmentBySkills(String skills) {
        if (skills == null || skills.trim().isEmpty()) {
            return "Engineering";
        }
        String s = skills.toLowerCase();
        if (s.contains("react") || s.contains("angular") || s.contains("vue") || s.contains("javascript") || s.contains("typescript") || s.contains("frontend") || s.contains("css") || s.contains("html")) {
            return "Frontend Department";
        } else if (s.contains("spring") || s.contains("boot") || s.contains("java") || s.contains("node") || s.contains("backend") || s.contains("express") || s.contains("django") || s.contains("flask") || s.contains("go") || s.contains("golang") || s.contains("c#") || s.contains(".net")) {
            return "Backend Department";
        } else if (s.contains("aws") || s.contains("azure") || s.contains("gcp") || s.contains("cloud") || s.contains("devops") || s.contains("docker") || s.contains("kubernetes") || s.contains("terraform") || s.contains("jenkins") || s.contains("ci/cd")) {
            return "Cloud Department";
        } else if (s.contains("python") || s.contains("ml") || s.contains("ai") || s.contains("machine learning") || s.contains("tensorflow") || s.contains("pytorch") || s.contains("deep learning") || s.contains("nlp") || s.contains("data science")) {
            return "AI/ML Department";
        } else if (s.contains("sql") || s.contains("power bi") || s.contains("tableau") || s.contains("excel") || s.contains("data analytics") || s.contains("analytics") || s.contains("big data") || s.contains("spark") || s.contains("hadoop") || s.contains("warehouse")) {
            return "Data Analytics Department";
        } else if (s.contains("cyber") || s.contains("security") || s.contains("penetration") || s.contains("hack") || s.contains("firewall") || s.contains("iam") || s.contains("cryptography") || s.contains("soc") || s.contains("siem")) {
            return "Security Department";
        }
        return "Engineering";
    }

    public String generateUniqueUsername(String name) {
        if (name == null || name.trim().isEmpty()) {
            name = "user";
        }
        String base = name.trim().toLowerCase().replaceAll("\\s+", ".");
        String candidate = base;
        int seq = 1;
        while (employeeRepository.findByUsername(candidate) != null && !employeeRepository.findByUsername(candidate).isEmpty()) {
            candidate = base + seq;
            seq++;
        }
        return candidate;
    }

    public Recruitment updateCandidateStatus(Long id, Recruitment updated) {
        Recruitment r = getCandidateById(id);
        
        r.setCandidateName(updated.getCandidateName());
        r.setEmail(updated.getEmail());
        r.setMobile(updated.getMobile());
        r.setQualification(updated.getQualification());
        r.setSkills(updated.getSkills());
        r.setExperience(updated.getExperience());
        r.setPosition(updated.getPosition());
        r.setStatus(updated.getStatus());
        r.setRemarks(updated.getRemarks());
        r.setJoiningDate(updated.getJoiningDate());
        r.setAiScore(calculateScore(updated.getSkills()));

        if ("Interview Scheduled".equalsIgnoreCase(updated.getStatus())) {
            String details = updated.getInterviewDetails();
            String date = "";
            String time = "";
            String link = "";
            
            if (details != null && !details.trim().isEmpty()) {
                for (String line : details.split("\n")) {
                    if (line.toLowerCase().startsWith("date:")) {
                        date = line.substring(5).trim();
                    } else if (line.toLowerCase().startsWith("time:")) {
                        time = line.substring(5).trim();
                    } else if (line.toLowerCase().startsWith("meeting link:") || line.toLowerCase().startsWith("link:")) {
                        int index = line.indexOf(":");
                        link = line.substring(index + 1).trim();
                    }
                }
            }
            
            if (date.isEmpty() || time.isEmpty()) {
                Map<String, Object> suggested = suggestSlotMock(r);
                date = (String) suggested.get("interviewDate");
                time = (String) suggested.get("interviewTime");
            }
            
            if (link.isEmpty() || link.trim().equalsIgnoreCase("automatically generated on save") || link.trim().equalsIgnoreCase("(automatically generated on save)")) {
                link = googleCalendarService.createInterviewMeeting(r.getCandidateName(), r.getEmail(), date, time);
            } else if (!link.matches("^https:\\/\\/meet\\.google\\.com\\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\\?.*)?$") && !link.matches("^https:\\/\\/meet\\.jit\\.si\\/.*$")) {
                throw new RecruitmentException("Please enter a valid Google Meet link.");
            }
            
            String finalDetails = "Date: " + date + "\nTime: " + time + "\nMeeting Link: " + link;
            r.setInterviewDetails(finalDetails);
            
            // Create InterviewSchedule entry
            List<InterviewSchedule> existingSchedules = interviewScheduleRepository.findByCandidateId(r.getId());
            boolean alreadyScheduled = false;
            for (InterviewSchedule is : existingSchedules) {
                if (is.getInterviewDate().equalsIgnoreCase(date) && is.getInterviewTime().equalsIgnoreCase(time)) {
                    alreadyScheduled = true;
                    break;
                }
            }
            
            if (!alreadyScheduled) {
                InterviewSchedule schedule = new InterviewSchedule();
                schedule.setCandidateId(r.getId());
                schedule.setHrId(r.getAssignedHrId() != null ? r.getAssignedHrId() : 1L);
                schedule.setInterviewDate(date);
                schedule.setInterviewTime(time);
                schedule.setInterviewType("Online");
                schedule.setMeetingLink(link);
                schedule.setStatus("UPCOMING");
                schedule.setAiGenerated(true);
                interviewScheduleRepository.save(schedule);
            }
            
            // Create HR notification
            String hrEmail = r.getHrEmail();
            if (hrEmail == null || hrEmail.isEmpty()) {
                hrEmail = "admin@workspace.com";
            }
            try {
                notificationService.addNotification(new com.hrms.model.Notification(
                    0,
                    hrEmail,
                    "New Interview scheduled for candidate: " + r.getCandidateName() + " on " + date + " at " + time + ". Meeting link: " + link
                ));
            } catch (Exception ex) {
                System.err.println("Failed to create HR notification: " + ex.getMessage());
            }
        } else {
            r.setInterviewDetails(updated.getInterviewDetails());
        }

        Recruitment saved = recruitmentRepository.save(r);

        // Auto Employee Conversion if status is SELECTED, HIRED, or OFFER ACCEPTED
        String savedStatus = saved.getStatus();
        boolean isSelectedOrHired = "Selected".equalsIgnoreCase(savedStatus) || "Hired".equalsIgnoreCase(savedStatus) || "Offer Accepted".equalsIgnoreCase(savedStatus);
        if (isSelectedOrHired) {
            System.out.println("[DEBUG] 1. Candidate selected event triggered. Candidate: " + saved.getCandidateName() + ", Status: " + savedStatus);
            try {
                java.util.List<com.hrms.model.Employee> existingByEmail = employeeRepository.findAllByEmail(saved.getEmail());
                java.util.List<com.hrms.model.Employee> existingByMobile = (saved.getMobile() != null && !saved.getMobile().trim().isEmpty())
                    ? employeeRepository.findAllByMobileNumber(saved.getMobile())
                    : java.util.Collections.emptyList();
                java.util.List<com.hrms.model.Employee> existingByCandId = employeeRepository.findAllByCandidateId(saved.getId());

                boolean hasDuplicate = !existingByEmail.isEmpty() || !existingByMobile.isEmpty() || !existingByCandId.isEmpty();

                if (hasDuplicate) {
                    String msg = "Employee record already exists for candidate (Email: " + saved.getEmail() + " or Mobile: " + saved.getMobile() + " or Candidate ID: " + saved.getId() + "). Skipping conversion.";
                    System.out.println("[DEBUG] [SKIP] " + msg);
                    throw new RecruitmentException(msg);
                }

                com.hrms.model.Employee emp = new com.hrms.model.Employee();
                emp.setName(saved.getCandidateName());
                emp.setEmail(saved.getEmail());
                emp.setMobileNumber(saved.getMobile());
                emp.setAddress(""); // Default to empty
                emp.setSkills(saved.getSkills());
                emp.setResume(saved.getResumePath());
                emp.setExperience(saved.getExperience());
                emp.setDesignation(saved.getPosition());
                emp.setProfileInformation("Qualifications: " + saved.getQualification());
                emp.setHrEmail(saved.getHrEmail() != null ? saved.getHrEmail() : "admin@workspace.com");
                emp.setGender(saved.getGender());
                emp.setCandidateId(saved.getId());
                System.out.println("[DEBUG] 2. Employee record created in memory.");
                
                // Resolve Department
                com.hrms.model.Department dept = null;
                if (saved.getSuggestedDepartment() != null && !saved.getSuggestedDepartment().trim().isEmpty()) {
                    dept = departmentRepository.findByDepartmentName(saved.getSuggestedDepartment().trim()).orElse(null);
                }
                if (dept == null && saved.getJobOpeningId() != null) {
                    java.util.Optional<com.hrms.model.JobOpening> jobOpt = jobOpeningRepository.findById(saved.getJobOpeningId());
                    if (jobOpt.isPresent() && jobOpt.get().getDepartment() != null) {
                        dept = departmentRepository.findByDepartmentName(jobOpt.get().getDepartment()).orElse(null);
                    }
                }
                if (dept == null) {
                    String pos = saved.getPosition().toLowerCase();
                    String guessedDept = "Engineering";
                    if (pos.contains("qa") || pos.contains("testing")) {
                        guessedDept = "QA";
                    } else if (pos.contains("design") || pos.contains("ui") || pos.contains("ux")) {
                        guessedDept = "Design";
                    }
                    dept = departmentRepository.findByDepartmentName(guessedDept).orElse(null);
                    if (dept == null) {
                        java.util.List<com.hrms.model.Department> allDepts = departmentRepository.findAll();
                        if (!allDepts.isEmpty()) {
                            dept = allDepts.get(0);
                        }
                    }
                }
                emp.setDepartment(dept);

                // 1. Generate unique sequential employee ID
                String empId = generateNextEmployeeId(dept);
                emp.setEmployeeId(empId);
                
                // 2. Generate unique username
                String username = generateUniqueUsername(saved.getCandidateName());
                emp.setUsername(username);
                System.out.println("[DEBUG] 4. Username generated: " + username);
                
                // 3. Generate secure temporary password automatically (Example: EMP@5837)
                int randomNum = 1000 + new java.util.Random().nextInt(9000);
                String rawPassword = "EMP@" + randomNum;
                System.out.println("[DEBUG] 5. Password generated: " + rawPassword);
                
                // Store encrypted password (Base64) in database
                String encryptedPassword = java.util.Base64.getEncoder().encodeToString(rawPassword.getBytes());
                emp.setPassword(encryptedPassword);
                
                emp.setSalary(50000.0); // Default salary

                employeeRepository.save(emp);
                System.out.println("[DEBUG] 3. Employee saved successfully. Employee ID: " + empId);
                
                // If a department is found, update its employee count
                if (dept != null) {
                    dept.setEmployeeCount(dept.getEmployeeCount() + 1);
                    departmentRepository.save(dept);
                }
                
                // Create notifications
                // HR Notification: Candidate converted to employee successfully.
                String hrEmail = saved.getHrEmail() != null ? saved.getHrEmail() : "admin@workspace.com";
                notificationService.addNotification(new com.hrms.model.Notification(
                    0,
                    hrEmail,
                    "Candidate converted to employee successfully."
                ));
                
                // Immediately send selection email
                try {
                    emailService.sendSelectionMail(saved.getEmail(), saved.getCandidateName(), saved.getPosition(), empId, username, rawPassword);
                    System.out.println("[DEBUG] 6. Email sent successfully to: " + saved.getEmail());
                } catch (Exception mailEx) {
                    System.err.println("[ERROR] Failed to send selection email: " + mailEx.getMessage());
                    throw new RecruitmentException("Failed to send selection email: " + mailEx.getMessage());
                }
            } catch (Exception ex) {
                System.err.println("[ERROR] Failed during employee auto-conversion: " + ex.getMessage());
                ex.printStackTrace();
                throw new RecruitmentException("Hiring workflow failed: " + ex.getMessage());
            }
        }

        // 1a. Audit Log / Status History Save
        try {
            CandidateStatus statusLog = new CandidateStatus(
                saved.getEmail(),
                saved.getStatus(),
                saved.getRemarks(),
                saved.getInterviewDetails(),
                LocalDateTime.now()
            );
            candidateStatusRepository.save(statusLog);
        } catch (Exception ex) {
            System.err.println("Failed to save CandidateStatus: " + ex.getMessage());
        }

        // 1b. Application Status History Save
        try {
            com.hrms.model.ApplicationStatusHistory appStatusLog = new com.hrms.model.ApplicationStatusHistory(
                saved.getId(),
                saved.getId(),
                saved.getAssignedHrId(),
                saved.getStatus(),
                saved.getRemarks()
            );
            applicationStatusHistoryRepository.save(appStatusLog);
        } catch (Exception ex) {
            System.err.println("Failed to save ApplicationStatusHistory: " + ex.getMessage());
        }

        // 2. Notification Log Save
        try {
            String title = "Application Update";
            String msg = "Your application is under review.";
            String status = saved.getStatus();
            if ("Under Review".equalsIgnoreCase(status)) {
                title = "Application Under Review";
                msg = "Your application is under review.";
            } else if ("Shortlisted".equalsIgnoreCase(status)) {
                title = "Application Shortlisted";
                msg = "You have been shortlisted.";
            } else if ("Interview Scheduled".equalsIgnoreCase(status)) {
                title = "Interview Scheduled";
                msg = "Your interview has been scheduled.";
            } else if ("Selected".equalsIgnoreCase(status) || "Hired".equalsIgnoreCase(status) || "Offer Accepted".equalsIgnoreCase(status)) {
                title = "Application Selected";
                msg = "🎉 Congratulations! You have been selected and your employee account has been created.";
            } else if ("Rejected".equalsIgnoreCase(status)) {
                title = "Application Status Update";
                msg = "Thank you for applying. After careful review, we are unable to proceed further with your application.";
            } else {
                msg = "Your application status has been updated to: " + status;
            }

            CandidateNotification notification = new com.hrms.model.CandidateNotification(
                saved.getId(), // candidateId
                saved.getId(), // applicationId
                title,
                msg,
                false,
                LocalDateTime.now(),
                saved.getEmail()
            );
            candidateNotificationRepository.save(notification);
            System.out.println("[DEBUG] 7. Notification created successfully.");
        } catch (Exception ex) {
            System.err.println("Failed to save CandidateNotification: " + ex.getMessage());
        }

        // 3. Trigger Email
        try {
            if ("Selected".equalsIgnoreCase(saved.getStatus()) || "Hired".equalsIgnoreCase(saved.getStatus()) || "Offer Accepted".equalsIgnoreCase(saved.getStatus())) {
                // Email is already sent inside the auto-conversion block!
            } else {
                emailService.sendRecruitmentStatusMail(
                    saved.getEmail(),
                    saved.getStatus(),
                    saved.getRemarks(),
                    saved.getInterviewDetails()
                );
            }
        } catch (Exception ex) {
            System.err.println("Failed to send status email: " + ex.getMessage());
        }

        return saved;
    }

    public void deleteCandidate(Long id) {
        Recruitment r = getCandidateById(id);
        recruitmentRepository.delete(r);
    }

    public List<Recruitment> getAllRecruitments() {
        return recruitmentRepository.findAll();
    }

    public java.util.Optional<com.hrms.model.ResumeExtraction> getResumeExtractionByCandidateId(Long candidateId) {
        return resumeExtractionRepository.findByCandidateId(candidateId);
    }

    public String parseResumeText(byte[] bytes, String fileName) {
        if (fileName == null) {
            return "";
        }
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.Loader.loadPDF(bytes)) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                return stripper.getText(document);
            } catch (Exception e) {
                System.err.println("Failed to parse PDF with PDFBox: " + e.getMessage());
            }
            return "";
        } else if (lowerName.endsWith(".docx")) {
            try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bytes);
                 org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(bais);
                 org.apache.poi.xwpf.extractor.XWPFWordExtractor extractor = new org.apache.poi.xwpf.extractor.XWPFWordExtractor(doc)) {
                return extractor.getText();
            } catch (Exception e) {
                System.err.println("Failed to parse DOCX with Apache POI: " + e.getMessage());
            }
            return "";
        } else if (lowerName.endsWith(".doc")) {
            try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bytes);
                 org.apache.poi.hwpf.HWPFDocument doc = new org.apache.poi.hwpf.HWPFDocument(bais);
                 org.apache.poi.hwpf.extractor.WordExtractor extractor = new org.apache.poi.hwpf.extractor.WordExtractor(doc)) {
                return extractor.getText();
            } catch (Exception e) {
                System.err.println("Failed to parse DOC with Apache POI: " + e.getMessage());
            }
            return "";
        } else if (lowerName.endsWith(".txt")) {
            return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }
        return "";
    }

    public com.hrms.model.ResumeExtraction runAiResumeExtraction(String resumeText, Long jobId, String geminiApiKey) {
        String jobTitle = "";
        String jobDescription = "";
        if (jobId != null) {
            com.hrms.model.JobOpening job = jobOpeningRepository.findById(jobId).orElse(null);
            if (job != null) {
                jobTitle = job.getTitle();
                jobDescription = job.getDescription();
            }
        }

        com.hrms.model.ResumeExtraction ext;
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                ext = callGeminiExtractApi(resumeText, jobTitle, jobDescription, geminiApiKey);
            } catch (Exception ex) {
                System.err.println("Gemini extraction failed, falling back to Java parser: " + ex.getMessage());
                ext = runJavaFallbackExtraction(resumeText, jobTitle, jobDescription);
            }
        } else {
            ext = runJavaFallbackExtraction(resumeText, jobTitle, jobDescription);
        }

        return ext;
    }

    private com.hrms.model.ResumeExtraction callGeminiExtractApi(String resumeText, String jobTitle, String jobDescription, String geminiApiKey) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        String prompt = "Perform AI resume parsing and extract structured candidate profile details from this resume text.\n" +
                "If job details (Title and Description) are provided below, compare the resume against the job to calculate Match Score (0-100), Matching Skills, Missing Skills, and Job Suitability Analysis.\n\n" +
                "JOB DETAILS:\n" +
                "- Title: " + jobTitle + "\n" +
                "- Description: " + jobDescription + "\n\n" +
                "RESUME TEXT:\n" +
                resumeText + "\n\n" +
                "Return a JSON response object with exactly these fields: " +
                "{\n" +
                "  \"fullName\": \"<extracted full name or first line>\",\n" +
                "  \"email\": \"<extracted email or empty>\",\n" +
                "  \"phone\": \"<extracted phone or empty>\",\n" +
                "  \"gender\": \"<Male, Female, or Other based on clues or empty>\",\n" +
                "  \"address\": \"<extracted address or empty>\",\n" +
                "  \"linkedin\": \"<extracted LinkedIn URL or empty>\",\n" +
                "  \"github\": \"<extracted GitHub URL or empty>\",\n" +
                "  \"portfolioLinks\": \"<comma-separated other portfolio or social link URLs or empty>\",\n" +
                "  \"degree\": \"<extracted degree or empty>\",\n" +
                "  \"college\": \"<extracted college/university or empty>\",\n" +
                "  \"graduationYear\": \"<extracted graduation year or empty>\",\n" +
                "  \"skills\": \"<comma-separated skills list or empty>\",\n" +
                "  \"certifications\": \"<comma-separated certifications list or empty>\",\n" +
                "  \"workExperience\": \"<summary of experience or empty>\",\n" +
                "  \"companies\": \"<comma-separated company names or empty>\",\n" +
                "  \"designations\": \"<comma-separated designations or empty>\",\n" +
                "  \"projects\": \"<comma-separated project names or summary or empty>\",\n" +
                "  \"languages\": \"<comma-separated languages or empty>\",\n" +
                "  \"preferredJobRole\": \"<preferred job role based on qualifications and experience or empty>\",\n" +
                "  \"matchScore\": <integer 0-100>,\n" +
                "  \"matchingSkills\": \"<comma-separated matching skills with job or empty>\",\n" +
                "  \"missingSkills\": \"<comma-separated missing skills or empty>\",\n" +
                "  \"jobSuitabilityAnalysis\": \"<brief text suitability analysis or empty>\"\n" +
                "}. " +
                "Ensure the response is raw JSON only, no markdown formatting, no backticks.";

        java.util.Map<String, Object> requestBody = new java.util.HashMap<>();
        java.util.List<java.util.Map<String, Object>> contentsList = new java.util.ArrayList<>();
        java.util.Map<String, Object> contentsMap = new java.util.HashMap<>();
        java.util.List<java.util.Map<String, Object>> partsList = new java.util.ArrayList<>();
        java.util.Map<String, Object> partsMap = new java.util.HashMap<>();

        partsMap.put("text", prompt);
        partsList.add(partsMap);
        contentsMap.put("parts", partsList);
        contentsList.add(contentsMap);
        requestBody.put("contents", contentsList);

        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

        org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity(url, entity, java.util.Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            java.util.Map body = response.getBody();
            java.util.List candidates = (java.util.List) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                java.util.Map candidate = (java.util.Map) candidates.get(0);
                java.util.Map content = (java.util.Map) candidate.get("content");
                if (content != null) {
                    java.util.List parts = (java.util.List) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        java.util.Map part = (java.util.Map) parts.get(0);
                        String responseText = (String) part.get("text");
                        return parseGeminiExtractionJson(responseText);
                    }
                }
            }
        }
        throw new RuntimeException("Empty response from Gemini API");
    }

    private com.hrms.model.ResumeExtraction parseGeminiExtractionJson(String text) {
        String cleanJson = text.trim();
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(cleanJson);

            com.hrms.model.ResumeExtraction r = new com.hrms.model.ResumeExtraction();
            r.setExtractedName(root.path("fullName").asText(""));
            r.setExtractedEmail(root.path("email").asText(""));
            r.setExtractedPhone(root.path("phone").asText(""));
            r.setGender(root.path("gender").asText(""));
            r.setAddress(root.path("address").asText(""));
            r.setLinkedin(root.path("linkedin").asText(""));
            r.setGithub(root.path("github").asText(""));
            r.setPortfolioLinks(root.path("portfolioLinks").asText(""));
            r.setDegree(root.path("degree").asText(""));
            r.setCollege(root.path("college").asText(""));
            r.setGraduationYear(root.path("graduationYear").asText(""));
            r.setExtractedSkills(root.path("skills").asText(""));
            r.setCertifications(root.path("certifications").asText(""));
            r.setExtractedExperience(root.path("workExperience").asText(""));
            r.setExtractedEducation(root.path("degree").asText("") + " from " + root.path("college").asText(""));
            r.setCompanies(root.path("companies").asText(""));
            r.setDesignations(root.path("designations").asText(""));
            r.setProjects(root.path("projects").asText(""));
            r.setLanguages(root.path("languages").asText(""));
            r.setMatchScore(root.path("matchScore").asInt(0));
            r.setAiAnalysis(root.path("jobSuitabilityAnalysis").asText(""));
            r.setMatchingSkills(root.path("matchingSkills").asText(""));
            r.setMissingSkills(root.path("missingSkills").asText(""));
            r.setPreferredJobRole(root.path("preferredJobRole").asText(""));

            return r;
        } catch (Exception ex) {
            System.err.println("Failed to parse Gemini extraction JSON, falling back to Java parser: " + ex.getMessage());
            return runJavaFallbackExtraction(text, "", "");
        }
    }

    public com.hrms.model.ResumeExtraction runJavaFallbackExtraction(String text, String jobTitle, String jobDescription) {
        com.hrms.model.ResumeExtraction r = new com.hrms.model.ResumeExtraction();

        // 1. Email
        java.util.regex.Matcher emailMatcher = java.util.regex.Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(text);
        if (emailMatcher.find()) {
            r.setExtractedEmail(emailMatcher.group().trim());
        }

        // 2. Phone
        java.util.regex.Matcher phoneMatcher = java.util.regex.Pattern.compile("\\+?\\d{10,13}").matcher(text);
        if (phoneMatcher.find()) {
            r.setExtractedPhone(phoneMatcher.group().trim());
        }

        // 3. Name (non-empty first line not containing metadata keywords)
        String[] lines = text.split("\\n");
        String candidateName = "";
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty() && trimmed.length() < 50 && !trimmed.toLowerCase().contains("resume") && !trimmed.toLowerCase().contains("curriculum") && !trimmed.toLowerCase().contains("email") && !trimmed.toLowerCase().contains("phone")) {
                candidateName = trimmed;
                break;
            }
        }
        if (candidateName.isEmpty() && lines.length > 0) {
            candidateName = lines[0].trim();
        }
        r.setExtractedName(candidateName);

        String textLower = text.toLowerCase();

        // 4. Skills Section Extraction (Skills, Technical Skills, Technologies, Programming Languages, Tools, Frameworks)
        java.util.List<String> foundSkills = new java.util.ArrayList<>();
        boolean inSkillsSection = false;
        String[] skillSectionHeaders = {"skills", "technical skills", "technologies", "programming languages", "tools", "frameworks", "key skills", "core competencies"};
        String[] otherSectionHeaders = {"experience", "work experience", "employment", "education", "qualification", "projects", "certifications", "interests", "activities"};
        
        for (String line : lines) {
            String lTrim = line.trim();
            if (lTrim.isEmpty()) continue;
            String lLower = lTrim.toLowerCase();
            
            // Check if we entered another section
            boolean enteredOther = false;
            for (String otherHeader : otherSectionHeaders) {
                if (lLower.startsWith(otherHeader) || lLower.equals(otherHeader)) {
                    enteredOther = true;
                    break;
                }
            }
            if (enteredOther) {
                inSkillsSection = false;
            }
            
            // Check if we are starting a skills section
            boolean enteredSkills = false;
            for (String skillHeader : skillSectionHeaders) {
                if (lLower.startsWith(skillHeader) || lLower.equals(skillHeader)) {
                    enteredSkills = true;
                    break;
                }
            }
            
            if (enteredSkills) {
                inSkillsSection = true;
                // Parse any skills on the header line after colon
                if (lTrim.contains(":")) {
                    String val = lTrim.substring(lTrim.indexOf(":") + 1).trim();
                    if (!val.isEmpty()) {
                        for (String s : val.split(",")) {
                            if (!s.trim().isEmpty() && !foundSkills.contains(s.trim())) {
                                foundSkills.add(s.trim());
                            }
                        }
                    }
                }
                continue;
            }
            
            if (inSkillsSection) {
                String val = lTrim;
                if (lTrim.contains(":")) {
                    val = lTrim.substring(lTrim.indexOf(":") + 1).trim();
                }
                for (String s : val.split(",")) {
                    if (!s.trim().isEmpty() && !foundSkills.contains(s.trim())) {
                        foundSkills.add(s.trim());
                    }
                }
            }
        }
        
        if (foundSkills.isEmpty()) {
            String[] possibleSkills = {"java", "spring boot", "react", "javascript", "angular", "vue", "python", "django", "flask", "c#", "dotnet", "asp.net", "sql", "mysql", "postgresql", "mongodb", "docker", "kubernetes", "aws", "gcp", "azure", "git", "html", "css", "nodejs", "express", "figma", "testing", "selenium", "machine learning", "power bi"};
            for (String skill : possibleSkills) {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(skill) + "\\b", java.util.regex.Pattern.CASE_INSENSITIVE);
                if (p.matcher(text).find()) {
                    String[] words = skill.split(" ");
                    StringBuilder capSkill = new StringBuilder();
                    for (String w : words) {
                        if (!capSkill.isEmpty()) capSkill.append(" ");
                        capSkill.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1));
                    }
                    if (!foundSkills.contains(capSkill.toString())) {
                        foundSkills.add(capSkill.toString());
                    }
                }
            }
        }
        r.setExtractedSkills(String.join(", ", foundSkills));

        // 5. Education
        String edu = "";
        for (String line : lines) {
            String lLower = line.toLowerCase();
            if (lLower.contains("b.tech") || lLower.contains("btech") || lLower.contains("b.e") || lLower.contains("b.e.") || lLower.contains("mca") || lLower.contains("master") || lLower.contains("bachelor") || lLower.contains("degree") || lLower.contains("education") || lLower.contains("m.tech")) {
                edu = line.replaceAll("(?i)^(degree:|education:|qualification:)", "").trim();
                break;
            }
        }
        r.setDegree(edu);
        r.setExtractedEducation(edu);

        // 6. College
        String college = "";
        java.util.regex.Matcher collegeMatcher = java.util.regex.Pattern.compile("(?i)(university|college|institute of technology)[\\w\\s]+").matcher(text);
        if (collegeMatcher.find()) {
            college = collegeMatcher.group().trim();
        }
        r.setCollege(college);
        r.setGraduationYear("");

        // 7. Experience (calculated dynamically from dates and intern / job keywords)
        int totalYears = 0;
        java.util.regex.Matcher rangeMatcher = java.util.regex.Pattern.compile("\\b(19|20)\\d{2}\\s*-\\s*(Present|\\b(19|20)\\d{2}\\b)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
        while (rangeMatcher.find()) {
            String range = rangeMatcher.group();
            String[] parts = range.split("-");
            if (parts.length == 2) {
                try {
                    int startYear = Integer.parseInt(parts[0].trim());
                    int endYear;
                    if (parts[1].trim().equalsIgnoreCase("present")) {
                        endYear = java.time.LocalDate.now().getYear();
                    } else {
                        endYear = Integer.parseInt(parts[1].trim());
                    }
                    int diff = endYear - startYear;
                    totalYears += diff > 0 ? diff : 1;
                } catch (Exception ignored) {}
            }
        }
        
        java.util.regex.Matcher expNumberMatcher = java.util.regex.Pattern.compile("(?i)(\\d+)\\s*(years?|yrs?)\\s*(of)?\\s*experience").matcher(text);
        if (expNumberMatcher.find()) {
            try {
                int years = Integer.parseInt(expNumberMatcher.group(1).trim());
                if (years > totalYears) {
                    totalYears = years;
                }
            } catch (Exception ignored) {}
        }
        
        String expString = totalYears > 0 ? totalYears + " Years" : "";
        if (expString.isEmpty() && (textLower.contains("intern") || textLower.contains("internship"))) {
            expString = "1 Year (Internship)";
        }
        r.setExtractedExperience(expString);

        // 8. Gender
        String gender = "";
        if (textLower.contains("gender: male") || textLower.contains("sex: male") || textLower.contains("gender : male")) {
            gender = "Male";
        } else if (textLower.contains("gender: female") || textLower.contains("sex: female") || textLower.contains("gender : female")) {
            gender = "Female";
        } else if (textLower.contains("gender: other") || textLower.contains("gender : other")) {
            gender = "Other";
        }
        r.setGender(gender);

        // 9. Certifications (NPTEL, AWS, Oracle, Cisco, Google, Microsoft Certifications)
        java.util.List<String> certsList = new java.util.ArrayList<>();
        String[] certKeywords = {"nptel", "aws", "oracle", "cisco", "google", "microsoft", "certified", "certification"};
        for (String line : lines) {
            String lTrim = line.trim();
            if (lTrim.isEmpty()) continue;
            String lLower = lTrim.toLowerCase();
            
            boolean hasCert = false;
            for (String kw : certKeywords) {
                if (lLower.contains(kw)) {
                    hasCert = true;
                    break;
                }
            }
            if (hasCert) {
                String certClean = lTrim.replaceAll("^[•*\\-\\s+]+", "")
                                        .replaceAll("(?i)^(certifications:|certification:|credentials:|credential:|certs:|cert:)", "")
                                        .trim();
                if (!certsList.contains(certClean) && certClean.length() < 100) {
                    certsList.add(certClean);
                }
            }
        }
        r.setCertifications(String.join(", ", certsList));

        // 10. URLs (LinkedIn / Github / Portfolio)
        String linkedin = "";
        String github = "";
        String portfolio = "";
        java.util.regex.Matcher urlMatcher = java.util.regex.Pattern.compile("(?i)https?://[^\\s]+").matcher(text);
        while (urlMatcher.find()) {
            String url = urlMatcher.group().trim();
            if (url.toLowerCase().contains("linkedin.com")) {
                linkedin = url;
            } else if (url.toLowerCase().contains("github.com")) {
                github = url;
            } else {
                portfolio = url;
            }
        }
        if (linkedin.isEmpty()) {
            java.util.regex.Matcher liMatcher = java.util.regex.Pattern.compile("(?i)linkedin\\.com/in/[a-zA-Z0-9_-]+").matcher(text);
            if (liMatcher.find()) {
                linkedin = "https://" + liMatcher.group();
            }
        }
        if (github.isEmpty()) {
            java.util.regex.Matcher ghMatcher = java.util.regex.Pattern.compile("(?i)github\\.com/[a-zA-Z0-9_-]+").matcher(text);
            if (ghMatcher.find()) {
                github = "https://" + ghMatcher.group();
            }
        }
        r.setLinkedin(linkedin);
        r.setGithub(github);
        r.setPortfolioLinks(portfolio);

        // 11. Match Score and analysis calculation dynamically
        int score = 0;
        java.util.List<String> matched = new java.util.ArrayList<>();
        java.util.List<String> missing = new java.util.ArrayList<>();
        if (jobDescription != null && !jobDescription.trim().isEmpty()) {
            String jdLower = jobDescription.toLowerCase();
            for (String skill : foundSkills) {
                if (!skill.trim().isEmpty() && jdLower.contains(skill.toLowerCase())) {
                    matched.add(skill);
                } else if (!skill.trim().isEmpty()) {
                    missing.add(skill);
                }
            }
            if (!foundSkills.isEmpty()) {
                score = Math.round(((float) matched.size() / foundSkills.size()) * 100);
            }
        } else {
            score = Math.min(foundSkills.size() * 15, 80);
        }
        score = Math.min(Math.max(score, 0), 100);
        r.setMatchScore(score);
        r.setAiAnalysis("Candidate matches " + score + "% of skills.");
        r.setMatchingSkills(String.join(", ", matched));
        r.setMissingSkills(String.join(", ", missing));

        // 12. Preferred Job Role
        String preferredRole = "";
        String[] roles = {"Software Engineer", "Java Developer", "React Developer", "QA Engineer", "UI/UX Designer", "Frontend Developer", "Backend Developer", "Full Stack Developer"};
        for (String role : roles) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(role) + "\\b", java.util.regex.Pattern.CASE_INSENSITIVE);
            if (p.matcher(text).find()) {
                preferredRole = role;
                break;
            }
        }
        if (preferredRole.isEmpty()) {
            preferredRole = "Software Engineer";
        }
        r.setPreferredJobRole(preferredRole);

        // 13. Projects
        java.util.List<String> projList = new java.util.ArrayList<>();
        for (String line : lines) {
            String lTrim = line.trim();
            if (lTrim.isEmpty()) continue;
            String lLower = lTrim.toLowerCase();
            if (lLower.contains("project:") || lLower.contains("projects:") || lLower.contains("key project") || lLower.startsWith("project ")) {
                projList.add(lTrim.replaceAll("(?i)^(project:|projects:|-|\\*)", "").trim());
            }
        }
        String projects = String.join(", ", projList);
        r.setProjects(projects.isEmpty() ? "No specific projects detailed in resume." : projects);

        // 14. Address / Location
        String location = "";
        for (String line : lines) {
            String lTrim = line.trim();
            if (lTrim.isEmpty()) continue;
            String lLower = lTrim.toLowerCase();
            if (lLower.startsWith("address:") || lLower.startsWith("location:") || lLower.startsWith("city:") || lLower.startsWith("address :") || lLower.startsWith("location :")) {
                location = lTrim.replaceAll("(?i)^(address:|location:|city:)", "").trim();
                break;
            }
        }
        if (location.isEmpty()) {
            location = "Not Specified";
        }
        r.setAddress(location);

        // 15. Dynamic AI Scores
        int skillScore = score;
        int experienceScore = Math.min(totalYears * 20, 100);
        if (experienceScore == 0) {
            experienceScore = 40;
        }
        int educationScore = 75;
        if (edu.toLowerCase().contains("master") || edu.toLowerCase().contains("mtech") || edu.toLowerCase().contains("mca")) {
            educationScore = 95;
        } else if (edu.toLowerCase().contains("btech") || edu.toLowerCase().contains("b.tech") || edu.toLowerCase().contains("b.e")) {
            educationScore = 85;
        }
        int projectScore = projList.isEmpty() ? 50 : 85;
        int overallScore = (skillScore + experienceScore + educationScore + projectScore) / 4;

        r.setSkillScore(skillScore);
        r.setExperienceScore(experienceScore);
        r.setEducationScore(educationScore);
        r.setProjectScore(projectScore);
        r.setOverallScore(overallScore);

        String matchCat = "Weak Match";
        if (overallScore >= 85) matchCat = "Excellent Match";
        else if (overallScore >= 70) matchCat = "Good Match";
        else if (overallScore >= 50) matchCat = "Average Match";
        r.setMatchCategory(matchCat);

        r.setAiExplanation("Candidate recommended because overall score is " + overallScore + "% and skills match " + skillScore + "% of job requirements.");
        
        String deptSuggest = determineDepartmentBySkills(r.getExtractedSkills());
        r.setSuggestedDepartment(deptSuggest);
        
        r.setSkillGapAnalysis(missing.isEmpty() ? "No critical skill gaps identified." : "Missing skills: " + String.join(", ", missing));
        r.setInterviewReadinessScore(Math.max(overallScore - 5, 0));
        r.setCandidateRisk(totalYears == 0 ? "High Risk (Entry level - no professional experience)" : "Low Risk");
        
        String hiringRec = "Not Recommended";
        if (overallScore >= 85) hiringRec = "Strongly Recommended";
        else if (overallScore >= 70) hiringRec = "Recommended";
        else if (overallScore >= 50) hiringRec = "Needs Review";
        r.setHiringRecommendation(hiringRec);

        return r;
    }

    private String generateMeetingLink() {
        String chars = "abcdefghijklmnopqrstuvwxyz";
        java.util.Random rnd = new java.util.Random();
        StringBuilder sb = new StringBuilder("https://meet.google.com/");
        for (int i = 0; i < 3; i++) sb.append(chars.charAt(rnd.nextInt(26)));
        sb.append("-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(rnd.nextInt(26)));
        sb.append("-");
        for (int i = 0; i < 3; i++) sb.append(chars.charAt(rnd.nextInt(26)));
        return sb.toString();
    }

    private Map<String, Object> suggestSlotMock(Recruitment candidate) {
        Long hrId = 1L;
        String startStr = "09:00";
        String endStr = "17:00";

        if (candidate.getHrEmail() != null && !candidate.getHrEmail().isEmpty()) {
            Optional<com.hrms.model.HrUser> hrOpt = hrUserRepository.findByEmail(candidate.getHrEmail());
            if (hrOpt.isPresent()) {
                hrId = hrOpt.get().getId();
                startStr = hrOpt.get().getShiftStart();
                endStr = hrOpt.get().getShiftEnd();
            }
        } else if (candidate.getAssignedHrId() != null) {
            Optional<com.hrms.model.HrUser> hrOpt = hrUserRepository.findById(candidate.getAssignedHrId());
            if (hrOpt.isPresent()) {
                hrId = hrOpt.get().getId();
                startStr = hrOpt.get().getShiftStart();
                endStr = hrOpt.get().getShiftEnd();
            }
        }
        if (startStr == null || startStr.trim().isEmpty()) {
            startStr = "09:00";
        }
        if (endStr == null || endStr.trim().isEmpty()) {
            endStr = "17:00";
        }

        java.time.LocalTime startTime = java.time.LocalTime.parse(startStr);
        java.time.LocalTime endTime = java.time.LocalTime.parse(endStr);
        
        java.util.List<String> times = new java.util.ArrayList<>();
        java.time.LocalTime tempTime = startTime;
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.ENGLISH);
        
        while (tempTime.plusMinutes(30).isBefore(endTime) || tempTime.plusMinutes(30).equals(endTime)) {
            times.add(tempTime.format(timeFormatter));
            tempTime = tempTime.plusMinutes(30);
        }
        
        if (times.isEmpty()) {
            times.add("11:00 AM");
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("d MMMM yyyy", java.util.Locale.ENGLISH);

        String suggestedDate = null;
        String suggestedTime = null;

        java.time.LocalTime nowTime = java.time.LocalTime.now();
        // Scan next 14 days starting from today
        for (int dayOffset = 0; dayOffset <= 14; dayOffset++) {
            java.time.LocalDate targetDate = today.plusDays(dayOffset);
            java.time.DayOfWeek dayOfWeek = targetDate.getDayOfWeek();
            if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) {
                continue;
            }

            String dateStr = targetDate.format(dateFormatter);

            for (String timeStr : times) {
                // If today, only suggest future times
                if (dayOffset == 0) {
                    java.time.LocalTime slotTime = java.time.LocalTime.parse(timeStr, timeFormatter);
                    if (!slotTime.isAfter(nowTime)) {
                        continue;
                    }
                }

                List<com.hrms.model.InterviewSchedule> conflicts = interviewScheduleRepository.findByInterviewDateAndInterviewTime(dateStr, timeStr);
                boolean hasConflict = false;
                for (com.hrms.model.InterviewSchedule is : conflicts) {
                    if (is.getCandidateId().equals(candidate.getId()) || is.getHrId().equals(hrId)) {
                        hasConflict = true;
                        break;
                    }
                }

                if (!hasConflict) {
                    suggestedDate = dateStr;
                    suggestedTime = timeStr;
                    break;
                }
            }

            if (suggestedDate != null) {
                break;
            }
        }

        if (suggestedDate == null) {
            java.time.LocalDate fallback = today.plusDays(3);
            suggestedDate = fallback.format(dateFormatter);
            suggestedTime = times.get(0);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("interviewDate", suggestedDate);
        res.put("interviewTime", suggestedTime);
        return res;
    }
}
