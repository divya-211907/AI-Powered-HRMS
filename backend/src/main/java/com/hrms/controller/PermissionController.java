package com.hrms.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hrms.model.Permission;
import com.hrms.model.Employee;
import com.hrms.service.PermissionService;
import com.hrms.repository.PermissionRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.EmailService;

@RestController
@RequestMapping("/api/permission")
@CrossOrigin("*")
public class PermissionController {

    @Autowired
    private PermissionService service;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public Permission apply(@RequestBody Permission p, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        // Retrieve creator HR email from employee record
        if (p.getEmployeeId() != null) {
            Optional<Employee> empOpt = employeeRepository.findById(p.getEmployeeId());
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                p.setHrEmail(emp.getHrEmail());
                p.setEmployeeName(emp.getName());
            }
        } else if (hrEmail != null && !hrEmail.isEmpty()) {
            p.setHrEmail(hrEmail);
        }

        Permission saved = service.apply(p);

        // ✉️ Send Email Alert to HR
        if (saved.getHrEmail() != null && !saved.getHrEmail().isEmpty()) {
            emailService.sendWorkflowMail(
                saved.getHrEmail(),
                "New Employee Request",
                "A new Permission request has been submitted by " + saved.getEmployeeName() + " for your review."
            );
        }

        return saved;
    }

    @GetMapping
    public List<Permission> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return permissionRepository.findByHrEmail(hrEmail);
        }
        return service.getAll();
    }

    @GetMapping("/{employeeId}")
    public List<Permission> getByEmployee(@PathVariable Long employeeId) {
        return service.getByEmployee(employeeId);
    }

    @PutMapping("/approve/{id}")
    public Permission approve(@PathVariable Long id) {
        Permission p = service.approve(id);
        
        // Retrieve employee email to notify them
        if (p.getEmployeeId() != null) {
            employeeRepository.findById(p.getEmployeeId()).ifPresent(emp -> {
                if (emp.getEmail() != null && !emp.getEmail().isEmpty()) {
                    emailService.sendWorkflowMail(
                        emp.getEmail(),
                        "Request Approved",
                        "Your permission request has been approved by HR."
                    );
                }
            });
        }
        return p;
    }

    @PutMapping("/reject/{id}")
    public Permission reject(@PathVariable Long id) {
        Permission p = service.reject(id);
        
        // Retrieve employee email to notify them
        if (p.getEmployeeId() != null) {
            employeeRepository.findById(p.getEmployeeId()).ifPresent(emp -> {
                if (emp.getEmail() != null && !emp.getEmail().isEmpty()) {
                    emailService.sendWorkflowMail(
                        emp.getEmail(),
                        "Request Rejected",
                        "Your permission request has been rejected by HR."
                    );
                }
            });
        }
        return p;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}