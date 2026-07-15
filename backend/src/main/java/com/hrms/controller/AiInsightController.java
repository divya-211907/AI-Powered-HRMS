package com.hrms.controller;

import com.hrms.model.*;
import com.hrms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-insights")
@CrossOrigin("*")
public class AiInsightController {

    @Autowired
    private AttendanceAiInsightRepository attendanceRepository;

    @Autowired
    private CandidateAiInsightRepository candidateRepository;

    @Autowired
    private EmployeePerformanceAiInsightRepository performanceRepository;

    @Autowired
    private DepartmentAiInsightRepository departmentRepository;

    @Autowired
    private DashboardAiInsightRepository dashboardRepository;

    // Attendance
    @PostMapping("/attendance")
    public AttendanceAiInsight saveAttendance(@RequestBody AttendanceAiInsight data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.setHrEmail(hrEmail);
        return attendanceRepository.save(data);
    }

    @GetMapping("/attendance")
    public List<AttendanceAiInsight> getAttendance(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return attendanceRepository.findByHrEmail(hrEmail);
        }
        return attendanceRepository.findAll();
    }

    // Candidate
    @PostMapping("/candidate")
    public CandidateAiInsight saveCandidate(@RequestBody CandidateAiInsight data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.setHrEmail(hrEmail);
        return candidateRepository.save(data);
    }

    @GetMapping("/candidate")
    public List<CandidateAiInsight> getCandidate(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return candidateRepository.findByHrEmail(hrEmail);
        }
        return candidateRepository.findAll();
    }

    // Employee Performance
    @PostMapping("/performance")
    public EmployeePerformanceAiInsight savePerformance(@RequestBody EmployeePerformanceAiInsight data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.setHrEmail(hrEmail);
        return performanceRepository.save(data);
    }

    @GetMapping("/performance")
    public List<EmployeePerformanceAiInsight> getPerformance(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return performanceRepository.findByHrEmail(hrEmail);
        }
        return performanceRepository.findAll();
    }

    // Department
    @PostMapping("/department")
    public DepartmentAiInsight saveDepartment(@RequestBody DepartmentAiInsight data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.setHrEmail(hrEmail);
        return departmentRepository.save(data);
    }

    @GetMapping("/department")
    public List<DepartmentAiInsight> getDepartment(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return departmentRepository.findByHrEmail(hrEmail);
        }
        return departmentRepository.findAll();
    }

    // Dashboard
    @PostMapping("/dashboard")
    public DashboardAiInsight saveDashboard(@RequestBody DashboardAiInsight data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.setHrEmail(hrEmail);
        return dashboardRepository.save(data);
    }

    @GetMapping("/dashboard")
    public List<DashboardAiInsight> getDashboard(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return dashboardRepository.findByHrEmail(hrEmail);
        }
        return dashboardRepository.findAll();
    }

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository actualAttendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    @GetMapping("/employee/{id}")
    public java.util.Map<String, Object> getEmployeeIntelligence(
            @PathVariable Long id,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String apiKey) {
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY") != null ? System.getenv("GEMINI_API_KEY") : System.getenv("OPENAI_API_KEY");
        }
        
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Employee not found"));
        
        // Gather attendance logs
        List<Attendance> myAtt = actualAttendanceRepository.findAll().stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(id))
                .toList();
        long totalLogs = myAtt.size();
        long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
        double attendanceRate = totalLogs > 0 ? (presentCount * 100.0 / totalLogs) : 95.0;
        
        // Gather leaves
        List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(id);
        long approvedLeaves = leaves.stream().filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus())).count();
        long pendingLeaves = leaves.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
        
        // Match recruitment record
        java.util.Optional<Recruitment> recOpt = recruitmentRepository.findByEmail(emp.getEmail());
        String skills = recOpt.map(Recruitment::getSkills).orElse("Java, React, SQL");
        String experience = recOpt.map(Recruitment::getExperience).orElse("3 Years");
        String qualification = recOpt.map(Recruitment::getQualification).orElse("B.Tech CS");
        
        String deptName = emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "General";
        
        String prompt = "Perform advanced AI employee intelligence analysis for the following employee details:\n\n" +
                "EMPLOYEE DATA:\n" +
                "- Name: " + emp.getName() + "\n" +
                "- Department: " + deptName + "\n" +
                "- Salary: " + emp.getSalary() + "\n" +
                "- Skills: " + skills + "\n" +
                "- Experience: " + experience + "\n" +
                "- Qualification: " + qualification + "\n" +
                "- Attendance Rate: " + String.format("%.1f", attendanceRate) + "% (total logs: " + totalLogs + ", present: " + presentCount + ")\n" +
                "- Leave History: " + leaves.size() + " total requests (approved: " + approvedLeaves + ", pending: " + pendingLeaves + ")\n\n" +
                "Generate a personalized evaluation report. Compare the employee's current skills against standard high-performance requirements for " + deptName + " / " + qualification + " roles.\n\n" +
                "Return a raw JSON response (no markdown, no backticks, no markdown blocks) with exactly these fields:\n" +
                "{\n" +
                "  \"summary\": \"<personal 1-2 sentence AI executive summary>\",\n" +
                "  \"skillsAnalysis\": \"<brief evaluation of strengths and development areas>\",\n" +
                "  \"skillGapDetection\": [\"<missing skill 1>\", \"<missing skill 2>\"],\n" +
                "  \"trainingRecommendations\": [\"<training course suggestion 1>\", \"<training course suggestion 2>\"],\n" +
                "  \"performanceInsights\": \"<analysis of attendance, leaves, and trends>\",\n" +
                "  \"careerGrowthPrediction\": \"<possible next roles or career progression path>\",\n" +
                "  \"riskAnalysis\": \"<assessment of attrition, attendance, or skill risks>\",\n" +
                "  \"isTopPerformer\": <true or false based on attendance and stats>,\n" +
                "  \"rating\": <rating out of 5.0, e.g. 4.5>,\n" +
                "  \"attendanceRate\": " + String.format("%.1f", attendanceRate) + ",\n" +
                "  \"experience\": \"" + experience + "\",\n" +
                "  \"skills\": \"" + skills + "\"\n" +
                "}";

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            String jsonResponse = callGeminiApi(prompt, apiKey);
            if (jsonResponse != null && !jsonResponse.trim().isEmpty()) {
                try {
                    String cleanJson = jsonResponse.trim();
                    if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
                    }
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    return mapper.readValue(cleanJson, java.util.Map.class);
                } catch (Exception ex) {
                    System.err.println("Failed to parse Gemini response as JSON: " + ex.getMessage());
                }
            }
        }
        
        java.util.Map<String, Object> fallback = new java.util.HashMap<>();
        fallback.put("summary", emp.getName() + " shows strong technical capability and dedication in the " + deptName + " team.");
        fallback.put("skillsAnalysis", "Demonstrates good proficiency in " + skills + ". Needs improvement in advanced system architectures.");
        
        java.util.List<String> gaps = new java.util.ArrayList<>();
        if ("Engineering".equalsIgnoreCase(deptName)) {
            gaps.add("Docker");
            gaps.add("Kubernetes");
            gaps.add("AWS Cloud");
        } else {
            gaps.add("Strategic Leadership");
            gaps.add("Advanced CRM");
        }
        fallback.put("skillGapDetection", gaps);
        
        java.util.List<String> recs = new java.util.ArrayList<>();
        recs.add("Advanced hands-on program in Cloud Deployments");
        recs.add("Professional Communication & Leadership Essentials");
        fallback.put("trainingRecommendations", recs);
        
        fallback.put("performanceInsights", "Attendance rate of " + String.format("%.1f", attendanceRate) + "% is stable. Leave pattern is within standard limits.");
        fallback.put("careerGrowthPrediction", "Next logical progression: Senior Specialist / Team Lead in " + deptName);
        fallback.put("riskAnalysis", "Low attrition risk. Skill gap risk is moderate due to missing cloud native skills.");
        fallback.put("isTopPerformer", attendanceRate >= 96.0);
        fallback.put("rating", 4.3);
        fallback.put("attendanceRate", attendanceRate);
        fallback.put("experience", experience);
        fallback.put("skills", skills);
        
        return fallback;
    }

    private String callGeminiApi(String prompt, String geminiApiKey) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

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
                            return (String) part.get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }
        return null;
    }

    @GetMapping("/wellness-sentinel")
    public List<java.util.Map<String, Object>> getWellnessSentinel(
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String apiKey) {

        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("GEMINI_API_KEY") != null ? System.getenv("GEMINI_API_KEY") : System.getenv("OPENAI_API_KEY");
        }

        List<Employee> emps;
        if (hrEmail != null && !hrEmail.isEmpty()) {
            emps = employeeRepository.findByHrEmail(hrEmail);
        } else {
            emps = employeeRepository.findAll();
        }

        List<Attendance> allAttendance;
        if (hrEmail != null && !hrEmail.isEmpty()) {
            allAttendance = actualAttendanceRepository.findByHrEmail(hrEmail);
        } else {
            allAttendance = actualAttendanceRepository.findAll();
        }

        List<java.util.Map<String, Object>> wellnessList = new java.util.ArrayList<>();
        
        StringBuilder telemetryData = new StringBuilder();
        
        for (Employee emp : emps) {
            List<Attendance> myAtt = allAttendance.stream()
                    .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(emp.getId()))
                    .toList();
            long totalLogs = myAtt.size();
            long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            double attendanceRate = totalLogs > 0 ? (presentCount * 100.0 / totalLogs) : 95.0;
            double otHours = myAtt.stream().mapToDouble(a -> a.getOtHours() != null ? a.getOtHours() : 0.0).sum();
            
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(emp.getId());
            long totalLeaves = leaves.size();
            
            telemetryData.append("- Employee: ").append(emp.getName())
                    .append(" (ID: ").append(emp.getId()).append(")\n")
                    .append("  Department: ").append(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "General").append("\n")
                    .append("  Overtime Hours: ").append(otHours).append(" hrs\n")
                    .append("  Attendance Rate: ").append(String.format("%.1f", attendanceRate)).append("%\n")
                    .append("  Leave Requests: ").append(totalLeaves).append("\n\n");
        }
        
        String prompt = "Perform AI Attrition Risk & Wellness evaluation for the following employee telemetry data:\n\n" +
                telemetryData.toString() +
                "Evaluate the attrition risk and burnout index (0-100%) for each employee.\n" +
                "Return a raw JSON response (no markdown, no backticks, no code blocks) formatted as a JSON array where each object has exactly these fields:\n" +
                "[\n" +
                "  {\n" +
                "    \"employeeId\": <id>,\n" +
                "    \"employeeName\": \"<name>\",\n" +
                "    \"department\": \"<department>\",\n" +
                "    \"burnoutIndex\": <burnout score from 0 to 100>,\n" +
                "    \"riskLevel\": \"<HIGH, MODERATE, or LOW>\",\n" +
                "    \"riskFactors\": [\"<factor 1>\", \"<factor 2>\"],\n" +
                "    \"recommendedIntervention\": \"<actionable HR wellness recommendation>\"\n" +
                "  }\n" +
                "]";

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            String jsonResponse = callGeminiApi(prompt, apiKey);
            if (jsonResponse != null && !jsonResponse.trim().isEmpty()) {
                try {
                    String cleanJson = jsonResponse.trim();
                    if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
                    }
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    return mapper.readValue(cleanJson, new com.fasterxml.jackson.core.type.TypeReference<List<java.util.Map<String, Object>>>() {});
                } catch (Exception ex) {
                    System.err.println("Failed to parse wellness sentinel response as JSON: " + ex.getMessage());
                }
            }
        }
        
        for (Employee emp : emps) {
            List<Attendance> myAtt = allAttendance.stream()
                    .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(emp.getId()))
                    .toList();
            long totalLogs = myAtt.size();
            long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            double attendanceRate = totalLogs > 0 ? (presentCount * 100.0 / totalLogs) : 95.0;
            double otHours = myAtt.stream().mapToDouble(a -> a.getOtHours() != null ? a.getOtHours() : 0.0).sum();
            
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(emp.getId());
            long totalLeaves = leaves.size();
            
            int score = 15;
            List<String> factors = new java.util.ArrayList<>();
            
            if (otHours > 15.0) {
                score += 35;
                factors.add("High Overtime (" + otHours + " hrs)");
            } else if (otHours > 5.0) {
                score += 15;
                factors.add("Moderate Overtime (" + otHours + " hrs)");
            }
            
            if (attendanceRate < 90.0) {
                score += 30;
                factors.add("Attendance Drop (" + String.format("%.1f", attendanceRate) + "%)");
            } else if (attendanceRate < 94.0) {
                score += 10;
                factors.add("Irregular Attendance");
            }
            
            if (totalLeaves > 3) {
                score += 20;
                factors.add("High Leave Usage (" + totalLeaves + " requests)");
            }
            
            if (score > 100) score = 100;
            
            String riskLevel = "LOW";
            String intervention = "Continue standard operational support. Keep up active employee recognition.";
            if (score >= 70) {
                riskLevel = "HIGH";
                intervention = "Schedule a 1-on-1 Wellness sync immediately. Recommend a workload optimization or a 2-day paid wellness break to prevent attrition.";
            } else if (score >= 40) {
                riskLevel = "MODERATE";
                intervention = "Monitor task distribution. Suggest peer support or brief check-in to offset recent overtime/leave patterns.";
            }
            
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("employeeId", emp.getId());
            map.put("employeeName", emp.getName());
            map.put("department", emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "General");
            map.put("burnoutIndex", score);
            map.put("riskLevel", riskLevel);
            map.put("riskFactors", factors);
            map.put("recommendedIntervention", intervention);
            
            wellnessList.add(map);
        }
        
        return wellnessList;
    }
}
