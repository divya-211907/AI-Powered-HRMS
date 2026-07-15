package com.hrms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hrms.model.Payroll;
import com.hrms.service.PayrollService;
import com.hrms.repository.PayrollRepository;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin("*")
public class PayrollController {

    @Autowired
    private PayrollService service;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    @PostMapping
    public Payroll add(@RequestBody Payroll payroll, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        payroll.setHrEmail(hrEmail);
        Payroll saved = service.addPayroll(payroll);
        if (saved != null && saved.getEmployee() != null && saved.getEmployee().getEmail() != null) {
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    saved.getEmployee().getEmail(),
                    "Payroll Update: Your payslip with Net Salary ₹" + String.format("%,.2f", saved.getNetSalary()) + " has been processed.",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }
        return saved;
    }

    @GetMapping
    public List<Payroll> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return payrollRepository.findByHrEmail(hrEmail);
        }
        return service.getAllPayrolls();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}