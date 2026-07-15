package com.hrms.service;

import com.hrms.model.*;
import com.hrms.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiChatService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    public String processChat(String query, String email, String role, String geminiApiKey) {
        if (role == null || email == null) {
            return "I couldn't identify your role or login email. Please log out and log back in.";
        }

        boolean isEmployee = role.equalsIgnoreCase("EMPLOYEE");
        boolean isCandidate = role.equalsIgnoreCase("CANDIDATE");

        if (!isEmployee && !isCandidate) {
            return "AI Chatbot is only enabled for Employees and Candidates.";
        }

        if (isEmployee) {
            Employee emp = null;
            List<Employee> emailMatches = employeeRepository.findAllByEmail(email);
            if (emailMatches != null && !emailMatches.isEmpty()) {
                emp = emailMatches.get(0);
            }
            if (emp == null) {
                // Try finding by username
                List<Employee> list = employeeRepository.findByUsername(email);
                if (list != null && !list.isEmpty()) {
                    emp = list.get(0);
                }
            }

            if (emp == null) {
                return "Your employee profile was not found in the database. Please contact HR to set up your profile.";
            }

            // Gather Leave Requests
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(emp.getId());
            long approvedLeaves = leaves.stream().filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus())).count();
            long pendingLeaves = leaves.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();
            long remainingLeaves = 12 - approvedLeaves;

            // Gather Attendance Logs
            List<Attendance> allAtt = attendanceRepository.findAll();
            final Employee finalEmp = emp;
            List<Attendance> myAtt = allAtt.stream()
                    .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(finalEmp.getId()))
                    .toList();
            long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            long lateCount = myAtt.stream().filter(a -> "Late".equalsIgnoreCase(a.getStatus())).count();

            // Gather Payroll Checks
            List<Payroll> allPay = payrollRepository.findAll();
            List<Payroll> myPay = allPay.stream()
                    .filter(p -> p.getEmployee() != null && p.getEmployee().getId().equals(finalEmp.getId()))
                    .toList();

            double basic = emp.getSalary();
            double net = emp.getSalary();
            double bonus = 0;
            double deductions = 0;

            if (!myPay.isEmpty()) {
                Payroll activePay = myPay.get(0);
                basic = activePay.getBasicSalary();
                bonus = activePay.getBonus();
                deductions = activePay.getDeductions();
                net = activePay.getNetSalary();
            }

            // Compile Employee Context
            String deptName = emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "General Operations";
            String context = "You are the 'Employee AI Assistant', a personal HR companion.\n" +
                    "EMPLOYEE PROFILE:\n" +
                    "- Name: " + emp.getName() + "\n" +
                    "- Email: " + emp.getEmail() + "\n" +
                    "- Department: " + deptName + "\n" +
                    "- Current Monthly Salary: " + emp.getSalary() + "\n\n" +
                    "LEAVE REQUESTS:\n" +
                    "- Approved Leaves: " + approvedLeaves + " days\n" +
                    "- Pending Leaves: " + pendingLeaves + " days\n" +
                    "- Remaining Casual Leave Balance: " + remainingLeaves + " days (out of 12)\n\n" +
                    "ATTENDANCE TODAY:\n" +
                    "- Present Days: " + presentCount + "\n" +
                    "- Late Days: " + lateCount + "\n" +
                    "- Total Logs: " + myAtt.size() + "\n\n" +
                    "PAYROLL SLIP:\n" +
                    "- Basic Salary: " + basic + "\n" +
                    "- Bonus: " + bonus + "\n" +
                    "- Deductions: " + deductions + "\n" +
                    "- Net Payout: " + net + "\n\n" +
                    "Answer the employee's questions professionally using this context. Format in clean markdown.";

            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
                String responseText = callGeminiApi(query, context, geminiApiKey);
                if (responseText != null) {
                    return responseText;
                }
            }

            return runEmployeeFallback(query, emp, leaves, approvedLeaves, remainingLeaves, myAtt, presentCount, lateCount, basic, net, bonus, deductions);
        } else {
            List<Recruitment> recsList = recruitmentRepository.findAll();
            final String targetEmail = email;
            Optional<Recruitment> recOpt = recsList.stream()
                    .filter(r -> targetEmail.equalsIgnoreCase(r.getEmail()))
                    .findFirst();
            if (recOpt.isEmpty()) {
                return "I couldn't locate any active job application matching your candidate email: " + email + ". Please submit an application form first.";
            }

            Recruitment rec = recOpt.get();

            // Compile Candidate Context
            String context = "You are the 'Recruitment AI Assistant', a guide for candidates.\n" +
                    "CANDIDATE APPLICATION DETAILS:\n" +
                    "- Name: " + rec.getCandidateName() + "\n" +
                    "- Email: " + rec.getEmail() + "\n" +
                    "- Mobile: " + rec.getMobile() + "\n" +
                    "- Applied Position: " + rec.getPosition() + "\n" +
                    "- Qualifications: " + rec.getQualification() + "\n" +
                    "- Skills: " + rec.getSkills() + "\n" +
                    "- Experience: " + rec.getExperience() + "\n" +
                    "- Application Status: " + rec.getStatus() + "\n" +
                    "- Match Fit Score: " + rec.getAiScore() + "%\n" +
                    "- Interview Details: " + (rec.getInterviewDetails() != null ? rec.getInterviewDetails() : "None scheduled yet") + "\n" +
                    "- HR Remarks: " + (rec.getRemarks() != null ? rec.getRemarks() : "No feedback logged yet") + "\n\n" +
                    "Answer the candidate's questions professionally using this context. Format in clean markdown.";

            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
                String responseText = callGeminiApi(query, context, geminiApiKey);
                if (responseText != null) {
                    return responseText;
                }
            }

            return runCandidateFallback(query, rec);
        }
    }

    private String callGeminiApi(String query, String systemInstructions, String geminiApiKey) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contentsList = new ArrayList<>();
            Map<String, Object> contentsMap = new HashMap<>();
            List<Map<String, Object>> partsList = new ArrayList<>();
            Map<String, Object> partsMap = new HashMap<>();

            partsMap.put("text", systemInstructions + "\n\nUSER QUESTION: " + query + "\n\nProvide your response now:");
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
                            return (String) part.get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini Chat API call failed: " + e.getMessage());
        }
        return null;
    }

    private String runEmployeeFallback(
            String query,
            Employee emp,
            List<LeaveRequest> leaves,
            long approvedCount,
            long remainingLeaves,
            List<Attendance> myAtt,
            long presentCount,
            long lateCount,
            double basic,
            double net,
            double bonus,
            double deductions
    ) {
        String q = query.toLowerCase();
        if (q.contains("leave") || q.contains("off") || q.contains("vacation") || q.contains("holiday")) {
            return "### 🌴 Your Leave Balance & Status\n" +
                    "- **Remaining Casual Leave Balance**: **" + remainingLeaves + "** days remaining (out of 12).\n" +
                    "- **Approved Leave Requests**: " + approvedCount + " days.\n" +
                    "- **Total Request History**: " + leaves.size() + " request(s) submitted.\n\n" +
                    "Leave requests must be applied at least 3 days in advance via the *Apply Leave* menu.";
        }
        if (q.contains("attendance") || q.contains("present") || q.contains("late") || q.contains("absent") || q.contains("check")) {
            return "### ⏰ Your Attendance Summary\n" +
                    "- **Present Days**: " + presentCount + "\n" +
                    "- **Late Check-ins**: " + lateCount + "\n" +
                    "- **Total Logs Checked**: " + myAtt.size() + " record(s).\n\n" +
                    "Standard arrival limit is 9:15 AM. 3 late arrivals result in 1 day leave deduction.";
        }
        if (q.contains("payroll") || q.contains("salary") || q.contains("payslip") || q.contains("deduction")) {
            return "### 💰 Your Salary Details & Payslip\n" +
                    "- **Basic Salary**: ₹" + String.format("%,.2f", basic) + "\n" +
                    "- **Bonus Allocations**: ₹" + String.format("%,.2f", bonus) + "\n" +
                    "- **Deductions Applied**: ₹" + String.format("%,.2f", deductions) + "\n" +
                    "- **Net Monthly Payout**: **₹" + String.format("%,.2f", net) + "**";
        }
        if (q.contains("profile") || q.contains("department") || q.contains("designation") || q.contains("my info") || q.contains("who am i")) {
            String dept = emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "General Operations";
            return "### 👨‍💼 Your Profile Information\n" +
                    "- **Name**: " + emp.getName() + "\n" +
                    "- **Email**: " + emp.getEmail() + "\n" +
                    "- **Department**: " + dept + "\n" +
                    "- **Designation/Role**: Employee";
        }

        return "### 👋 Hello " + emp.getName() + "! I am your Employee AI Assistant\n" +
                "I can fetch your attendance logs, leave balances, payslip summaries, or profile details.\n\n" +
                "Try asking:\n" +
                "* *\"How many leave days do I have remaining?\"*\n" +
                "* *\"Show my net salary details\"*\n" +
                "* *\"Am I marked present today?\"*";
    }

    private String runCandidateFallback(String query, Recruitment rec) {
        String q = query.toLowerCase();
        if (q.contains("status") || q.contains("stage") || q.contains("interview") || q.contains("progress")) {
            String details = rec.getInterviewDetails() != null ? rec.getInterviewDetails() : "None scheduled yet. HR will contact you if shortlisted.";
            return "### 🎯 Your Application Status\n" +
                    "- **Position Applied**: " + rec.getPosition() + "\n" +
                    "- **Current Status**: **" + rec.getStatus() + "**\n" +
                    "- **Interview Details**: " + details + "\n" +
                    "- **HR Feedback / Remarks**: " + (rec.getRemarks() != null ? rec.getRemarks() : "Your application is currently being evaluated.");
        }
        if (q.contains("resume") || q.contains("skill") || q.contains("match") || q.contains("improve")) {
            return "### 🧠 AI Resume & Fit Analysis\n" +
                    "- **Candidate Name**: " + rec.getCandidateName() + "\n" +
                    "- **Extracted Skills**: " + rec.getSkills() + "\n" +
                    "- **Extracted Education**: " + rec.getQualification() + "\n" +
                    "- **Match Fit Score**: **" + rec.getAiScore() + "%**\n\n" +
                    "Complete courses in spring boot, mysql, or react to increase matching scores.";
        }

        return "### 👋 Hello " + rec.getCandidateName() + "! I am your Recruitment AI Assistant\n" +
                "I can verify your application status, check interview timings, and suggest resume skill improvements.\n\n" +
                "Try asking:\n" +
                "* *\"What is my application status?\"*\n" +
                "* *\"What skills should I improve?\"*\n" +
                "* *\"Help me prepare for my interview\"*";
    }
}
