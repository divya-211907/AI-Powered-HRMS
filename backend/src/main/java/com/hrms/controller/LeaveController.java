package com.hrms.controller;

import com.hrms.model.LeaveRequest;
import com.hrms.model.Employee;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin("*")
public class LeaveController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    @Autowired
    private com.hrms.service.LeaveAiService leaveAiService;

    @PostMapping("/apply")
    public LeaveRequest apply(@RequestBody LeaveRequest leave, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        // Retrieve creator HR email from employee record
        Optional<Employee> empOpt = employeeRepository.findById(leave.getEmployeeId());
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            leave.setHrEmail(emp.getHrEmail());
            leave.setEmployeeName(emp.getName());
            leave.setEmployeeEmail(emp.getEmail());
        } else if (hrEmail != null && !hrEmail.isEmpty()) {
            leave.setHrEmail(hrEmail);
        }

        leave.setStatus("PENDING");
        LeaveRequest saved = leaveRequestRepository.save(leave);

        // ✉️ Send Email Alert to HR
        if (saved.getHrEmail() != null && !saved.getHrEmail().isEmpty()) {
            emailService.sendWorkflowMail(
                saved.getHrEmail(),
                "New Employee Request",
                "A new leave request has been submitted by " + saved.getEmployeeName() + " for your review."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getHrEmail(),
                    "New Leave Request: " + saved.getEmployeeName() + " submitted a leave request.",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }

        return saved;
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return leaveRequestRepository.findByHrEmail(hrEmail);
        }
        return leaveRequestRepository.findAll();
    }

    @GetMapping("/{id}/ai-analysis")
    public com.hrms.model.LeaveAiAnalysis getLeaveAiAnalysis(
            @PathVariable Long id,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String geminiApiKey
    ) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        return leaveAiService.generateLeaveRecommendation(leave, geminiApiKey);
    }

    @GetMapping("/my-leaves")
    public List<LeaveRequest> getMyLeaves(@RequestParam Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    @PutMapping("/approve/{id}")
    public LeaveRequest approve(@PathVariable Long id, @RequestBody(required = false) LeaveRequest payload) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        
        leave.setStatus("APPROVED");
        if (payload != null && payload.getRemarks() != null) {
            leave.setRemarks(payload.getRemarks());
        }

        LeaveRequest saved = leaveRequestRepository.save(leave);

        // ✉️ Send Email Alert to Employee
        if (saved.getEmployeeEmail() != null && !saved.getEmployeeEmail().isEmpty()) {
            emailService.sendWorkflowMail(
                saved.getEmployeeEmail(),
                "Request Approved",
                "Your leave request has been approved by HR."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getEmployeeEmail(),
                    "Leave Approved: Your leave request has been APPROVED by HR.",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }

        return saved;
    }

    @PutMapping("/reject/{id}")
    public LeaveRequest reject(@PathVariable Long id, @RequestBody(required = false) LeaveRequest payload) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        
        leave.setStatus("REJECTED");
        if (payload != null && payload.getRemarks() != null) {
            leave.setRemarks(payload.getRemarks());
        }

        LeaveRequest saved = leaveRequestRepository.save(leave);

        // ✉️ Send Email Alert to Employee
        if (saved.getEmployeeEmail() != null && !saved.getEmployeeEmail().isEmpty()) {
            emailService.sendWorkflowMail(
                saved.getEmployeeEmail(),
                "Request Rejected",
                "Your leave request has been rejected by HR."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getEmployeeEmail(),
                    "Leave Rejected: Your leave request has been rejected by HR.",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }

        return saved;
    }

    @PutMapping("/update/{id}")
    public LeaveRequest update(@PathVariable Long id, @RequestBody LeaveRequest updated) {
        LeaveRequest existing = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found"));
        
        if (!"PENDING".equalsIgnoreCase(existing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a leave request that is already " + existing.getStatus());
        }
        
        existing.setFromDate(updated.getFromDate());
        existing.setToDate(updated.getToDate());
        existing.setLeaveType(updated.getLeaveType());
        existing.setReason(updated.getReason());
        
        return leaveRequestRepository.save(existing);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        leaveRequestRepository.deleteById(id);
    }
}