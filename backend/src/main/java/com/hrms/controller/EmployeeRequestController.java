package com.hrms.controller;

import com.hrms.model.EmployeeRequest;
import com.hrms.model.Employee;
import com.hrms.repository.EmployeeRequestRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin("*")
public class EmployeeRequestController {

    @Autowired
    private EmployeeRequestRepository employeeRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    @PostMapping("/apply")
    public EmployeeRequest apply(@RequestBody EmployeeRequest request, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        // Link HR email from Employee creation record
        Optional<Employee> empOpt = employeeRepository.findById(request.getEmployeeId());
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            request.setHrEmail(emp.getHrEmail());
            request.setEmployeeName(emp.getName());
            request.setEmployeeEmail(emp.getEmail());
        } else if (hrEmail != null && !hrEmail.isEmpty()) {
            request.setHrEmail(hrEmail);
        }

        request.setStatus("PENDING");
        EmployeeRequest saved = employeeRequestRepository.save(request);

        // ✉️ Send Email Alert to HR
        if (saved.getHrEmail() != null && !saved.getHrEmail().isEmpty()) {
            String readableType = saved.getRequestType().replace("_", " ").toLowerCase();
            emailService.sendWorkflowMail(
                saved.getHrEmail(),
                "New Employee Request",
                "A new " + readableType + " request has been submitted by " + saved.getEmployeeName() + " for your review."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getHrEmail(),
                    "New Request: " + saved.getEmployeeName() + " submitted a " + readableType + " request.",
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
    public List<EmployeeRequest> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return employeeRequestRepository.findByHrEmail(hrEmail);
        }
        return employeeRequestRepository.findAll();
    }

    @GetMapping("/my-requests")
    public List<EmployeeRequest> getMyRequests(@RequestParam Long employeeId) {
        return employeeRequestRepository.findByEmployeeId(employeeId);
    }

    @PutMapping("/approve/{id}")
    public EmployeeRequest approve(@PathVariable Long id, @RequestBody(required = false) EmployeeRequest payload) {
        EmployeeRequest request = employeeRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee request not found"));
        
        request.setStatus("APPROVED");
        if (payload != null && payload.getRemarks() != null) {
            request.setRemarks(payload.getRemarks());
        }

        EmployeeRequest saved = employeeRequestRepository.save(request);

        // ✉️ Send Email Alert to Employee
        if (saved.getEmployeeEmail() != null && !saved.getEmployeeEmail().isEmpty()) {
            String readableType = saved.getRequestType().replace("_", " ").toLowerCase();
            emailService.sendWorkflowMail(
                saved.getEmployeeEmail(),
                "Request Approved",
                "Your " + readableType + " request has been approved by HR."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getEmployeeEmail(),
                    "Request Approved: Your " + readableType + " request has been approved.",
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
    public EmployeeRequest reject(@PathVariable Long id, @RequestBody(required = false) EmployeeRequest payload) {
        EmployeeRequest request = employeeRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee request not found"));
        
        request.setStatus("REJECTED");
        if (payload != null && payload.getRemarks() != null) {
            request.setRemarks(payload.getRemarks());
        }

        EmployeeRequest saved = employeeRequestRepository.save(request);

        // ✉️ Send Email Alert to Employee
        if (saved.getEmployeeEmail() != null && !saved.getEmployeeEmail().isEmpty()) {
            String readableType = saved.getRequestType().replace("_", " ").toLowerCase();
            emailService.sendWorkflowMail(
                saved.getEmployeeEmail(),
                "Request Rejected",
                "Your " + readableType + " request has been rejected by HR."
            );
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getEmployeeEmail(),
                    "Request Rejected: Your " + readableType + " request has been rejected by HR.",
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
    public EmployeeRequest update(@PathVariable Long id, @RequestBody EmployeeRequest updated) {
        EmployeeRequest existing = employeeRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee request not found"));
        
        if (!"PENDING".equalsIgnoreCase(existing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a request that is already " + existing.getStatus());
        }
        
        existing.setDetails(updated.getDetails());
        
        return employeeRequestRepository.save(existing);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        employeeRequestRepository.deleteById(id);
    }
}
