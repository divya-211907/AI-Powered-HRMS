package com.hrms.service;

import com.hrms.model.LeaveRequest;
import com.hrms.model.LeaveAiAnalysis;
import com.hrms.model.Employee;
import com.hrms.model.Attendance;
import com.hrms.model.Performance;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveAiAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaveAiService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveAiAnalysisRepository leaveAiAnalysisRepository;

    @Autowired
    private PerformanceService performanceService;

    public LeaveAiAnalysis generateLeaveRecommendation(LeaveRequest leave, String geminiApiKey) {
        Employee employee = employeeRepository.findById(leave.getEmployeeId()).orElse(null);
        if (employee == null) {
            return new LeaveAiAnalysis(leave.getId(), leave.getEmployeeId(), "Recommend Manual Review", 50, "Employee record not found.");
        }

        // 1. Gather all inputs
        long requestedDays = calculateRequestedDays(leave.getFromDate(), leave.getToDate());
        
        List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(employee.getId());
        long approvedCount = leaves.stream()
            .filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus()))
            .mapToLong(l -> calculateRequestedDays(l.getFromDate(), l.getToDate()))
            .sum();
        long remainingBalance = 12 - approvedCount;

        // Attendance rate
        List<Attendance> allAtt = attendanceRepository.findAll();
        List<Attendance> myAtt = allAtt.stream()
            .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(employee.getId()))
            .collect(Collectors.toList());
        long presentCount = myAtt.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) || "LATE".equalsIgnoreCase(a.getStatus())).count();
        double attendanceRate = 90.0;
        if (!myAtt.isEmpty()) {
            attendanceRate = ((double) presentCount / myAtt.size()) * 100.0;
        }

        // Performance
        int rating = 4;
        String perfRemarks = "N/A";
        Performance perf = performanceService.getPerformances(employee.getId().intValue());
        if (perf != null) {
            rating = perf.getRating();
            perfRemarks = perf.getRemarks();
        }

        // Team availability & Department workload
        List<Employee> deptEmployees = employeeRepository.findByHrEmail(employee.getHrEmail()).stream()
            .filter(emp -> emp.getDepartment() != null && employee.getDepartment() != null && emp.getDepartment().getDepartmentId() == employee.getDepartment().getDepartmentId())
            .collect(Collectors.toList());
        
        List<LeaveRequest> overlappingApproved = new ArrayList<>();
        for (Employee deptEmp : deptEmployees) {
            if (deptEmp.getId().equals(employee.getId())) continue;
            List<LeaveRequest> empLeaves = leaveRequestRepository.findByEmployeeId(deptEmp.getId());
            for (LeaveRequest lr : empLeaves) {
                if ("APPROVED".equalsIgnoreCase(lr.getStatus()) && checkOverlap(leave.getFromDate(), leave.getToDate(), lr.getFromDate(), lr.getToDate())) {
                    overlappingApproved.add(lr);
                }
            }
        }

        String deptName = employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "General";
        int totalDeptMembers = deptEmployees.size();
        int activeApprovedAbsences = overlappingApproved.size();
        int availableTeamCount = totalDeptMembers - activeApprovedAbsences;

        // Check if there is an existing analysis for this request to avoid re-generating
        Optional<LeaveAiAnalysis> existing = leaveAiAnalysisRepository.findByLeaveRequestId(leave.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        // Trigger AI or Fallback
        LeaveAiAnalysis analysis;
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                analysis = callGeminiLeaveRecommendationApi(
                    employee.getName(), deptName, leave.getLeaveType(), leave.getFromDate(), leave.getToDate(), leave.getReason(),
                    remainingBalance, requestedDays, attendanceRate, approvedCount, rating, perfRemarks,
                    availableTeamCount, totalDeptMembers, activeApprovedAbsences, leave.getId(), employee.getId(), geminiApiKey
                );
            } catch (Exception ex) {
                System.err.println("Gemini Leave Analysis failed, falling back to Java rule engine: " + ex.getMessage());
                analysis = runJavaFallbackLeaveAnalysis(leave.getId(), employee.getId(), remainingBalance, requestedDays, attendanceRate, rating, availableTeamCount, totalDeptMembers);
            }
        } else {
            analysis = runJavaFallbackLeaveAnalysis(leave.getId(), employee.getId(), remainingBalance, requestedDays, attendanceRate, rating, availableTeamCount, totalDeptMembers);
        }

        return leaveAiAnalysisRepository.save(analysis);
    }

    private long calculateRequestedDays(String fromStr, String toStr) {
        try {
            LocalDate from = LocalDate.parse(fromStr);
            LocalDate to = LocalDate.parse(toStr);
            return ChronoUnit.DAYS.between(from, to) + 1;
        } catch (Exception ex) {
            return 1;
        }
    }

    private boolean checkOverlap(String from1, String to1, String from2, String to2) {
        try {
            LocalDate start1 = LocalDate.parse(from1);
            LocalDate end1 = LocalDate.parse(to1);
            LocalDate start2 = LocalDate.parse(from2);
            LocalDate end2 = LocalDate.parse(to2);
            return !start1.isAfter(end2) && !start2.isAfter(end1);
        } catch (Exception ex) {
            return false;
        }
    }

    private LeaveAiAnalysis runJavaFallbackLeaveAnalysis(
        Long leaveRequestId, Long employeeId, long remainingBalance, long requestedDays,
        double attendanceRate, int rating, int availableTeamCount, int totalDeptMembers
    ) {
        String rec = "Recommend Approval";
        int score = 85;
        String reason = "Employee has sufficient leave balance, good attendance record, and adequate department coverage.";

        if (requestedDays > remainingBalance) {
            rec = "Recommend Rejection";
            score = 90;
            reason = "Requested leave duration (" + requestedDays + " days) exceeds remaining leave balance (" + remainingBalance + " days).";
        } else if (attendanceRate < 75.0) {
            rec = "Recommend Rejection";
            score = 80;
            reason = "Employee attendance rate is low (" + String.format("%.1f", attendanceRate) + "%), indicating excessive absence patterns.";
        } else if (totalDeptMembers > 1 && (double) availableTeamCount / totalDeptMembers <= 0.6) {
            rec = "Recommend Manual Review";
            score = 85;
            reason = "Multiple team members in the department are already on leave during the requested dates, creating staffing coverage risks.";
        } else if (rating < 3) {
            rec = "Recommend Manual Review";
            score = 75;
            reason = "Employee performance rating is low (" + rating + "/5). Suggesting manual review to assess performance impact.";
        }

        return new LeaveAiAnalysis(leaveRequestId, employeeId, rec, score, reason);
    }

    private LeaveAiAnalysis callGeminiLeaveRecommendationApi(
        String name, String department, String leaveType, String fromDate, String toDate, String reasonText,
        long balance, long requestedDays, double attendanceRate, long approvedCount, int rating, String perfRemarks,
        int availableTeam, int totalDept, int activeAbsences, Long leaveRequestId, Long employeeId, String geminiApiKey
    ) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        String prompt = "Perform AI-powered Leave Approval Recommendation analysis.\n" +
                "Evaluate the following employee leave request parameters:\n" +
                "- Employee Name: " + name + "\n" +
                "- Department: " + department + "\n" +
                "- Leave Type: " + leaveType + "\n" +
                "- Requested Dates: " + fromDate + " to " + toDate + " (Duration: " + requestedDays + " days)\n" +
                "- Reason: " + reasonText + "\n" +
                "- Leave Balance: " + balance + " days remaining\n" +
                "- Attendance Rate: " + String.format("%.1f", attendanceRate) + "%\n" +
                "- Previous Approved Leaves: " + approvedCount + " days\n" +
                "- Performance Rating: " + rating + "/5 (" + perfRemarks + ")\n" +
                "- Team Coverage: " + availableTeam + " available out of " + totalDept + " members (" + activeAbsences + " on leave)\n\n" +
                "Analyze these factors to return a recommendation. Avoid always approving or rejecting. Generate dynamically.\n" +
                "Return a JSON response object with exactly these fields:\n" +
                "{\n" +
                "  \"recommendation\": \"Recommend Approval\" or \"Recommend Rejection\" or \"Recommend Manual Review\",\n" +
                "  \"confidenceScore\": <integer 0-100>,\n" +
                "  \"aiReason\": \"<detailed analysis reasoning text>\"\n" +
                "}.\n" +
                "Ensure the response is raw JSON only, no markdown formatting, no backticks.";

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contentsList = new ArrayList<>();
        Map<String, Object> contentsMap = new HashMap<>();
        List<Map<String, Object>> partsList = new ArrayList<>();
        Map<String, Object> partsMap = new HashMap<>();

        partsMap.put("text", prompt);
        partsList.add(partsMap);
        contentsMap.put("parts", partsList);
        contentsList.add(contentsMap);
        requestBody.put("contents", contentsList);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                if (content != null) {
                    List parts = (List) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        String responseText = (String) part.get("text");
                        return parseGeminiLeaveJson(responseText, leaveRequestId, employeeId);
                    }
                }
            }
        }
        throw new RuntimeException("Empty response from Gemini API");
    }

    private LeaveAiAnalysis parseGeminiLeaveJson(String text, Long leaveRequestId, Long employeeId) {
        String cleanJson = text.trim();
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replaceAll("^```json", "").replaceAll("^```", "").replaceAll("```$", "").trim();
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(cleanJson);

            String rec = root.path("recommendation").asText("Recommend Manual Review");
            int score = root.path("confidenceScore").asInt(75);
            String reason = root.path("aiReason").asText("Analysis completed.");

            return new LeaveAiAnalysis(leaveRequestId, employeeId, rec, score, reason);
        } catch (Exception ex) {
            System.err.println("Failed to parse Gemini Leave JSON, using fallback: " + ex.getMessage());
            return new LeaveAiAnalysis(leaveRequestId, employeeId, "Recommend Manual Review", 70, "Failed to parse AI output: " + text);
        }
    }
}
