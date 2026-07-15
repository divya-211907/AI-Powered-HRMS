package com.hrms.service;

import com.hrms.model.Employee;
import com.hrms.model.Attendance;
import com.hrms.model.LeaveRequest;
import com.hrms.model.Performance;
import com.hrms.model.SalaryIncrementRecommendation;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.SalaryIncrementRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SalaryIncrementService {

    @Autowired
    private SalaryIncrementRecommendationRepository recommendationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    @Value("${hrms.max.increment.limit:50.0}")
    private double maxIncrementLimit;

    public SalaryIncrementRecommendation getOrCreateRecommendationForEmployee(Employee emp, String hrEmail) {
        Optional<SalaryIncrementRecommendation> existing = recommendationRepository.findByEmployeeId(emp.getId());
        if (existing.isPresent()) {
            return existing.get();
        } else {
            SalaryIncrementRecommendation rec = new SalaryIncrementRecommendation();
            rec.setEmployeeId(emp.getId());
            rec.setEmployeeName(emp.getName());
            rec.setStatus("PENDING");
            rec.setHrEmail(hrEmail);
            return recommendationRepository.save(rec);
        }
    }

    public List<SalaryIncrementRecommendation> getOrCreateRecommendations(String hrEmail) {
        List<Employee> emps = employeeRepository.findByHrEmail(hrEmail);
        List<SalaryIncrementRecommendation> results = new ArrayList<>();

        for (Employee emp : emps) {
            Optional<SalaryIncrementRecommendation> existing = recommendationRepository.findByEmployeeId(emp.getId());
            if (existing.isPresent()) {
                SalaryIncrementRecommendation rec = existing.get();
                if ("PENDING".equalsIgnoreCase(rec.getStatus())) {
                    calculateAndSyncRecommendation(rec, emp, hrEmail);
                }
                results.add(rec);
            } else {
                SalaryIncrementRecommendation rec = new SalaryIncrementRecommendation();
                rec.setEmployeeId(emp.getId());
                rec.setEmployeeName(emp.getName());
                rec.setStatus("PENDING");
                rec.setHrEmail(hrEmail);
                calculateAndSyncRecommendation(rec, emp, hrEmail);
                results.add(rec);
            }
        }
        return results;
    }

    private void calculateAndSyncRecommendation(SalaryIncrementRecommendation rec, Employee emp, String hrEmail) {
        List<Attendance> myAtt = attendanceRepository.findByHrEmail(hrEmail).stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(emp.getId()))
                .toList();
        long totalLogs = myAtt.size();
        long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
        double attendanceRate = totalLogs > 0 ? (presentCount * 100.0 / totalLogs) : 95.0;
        double otHours = myAtt.stream().mapToDouble(a -> a.getOtHours() != null ? a.getOtHours() : 0.0).sum();

        Performance perf = performanceService.getPerformances(emp.getId().intValue());
        int rating = perf != null ? perf.getRating() : 3;

        List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(emp.getId());
        long leaveCount = leaves.size();

        String exp = emp.getExperience() != null ? emp.getExperience() : "0 Years";

        double pct = 5.0;
        boolean isEligible = true;
        String perfLabel = "Average";

        if (rating >= 5) {
            pct = 15.0;
            perfLabel = "Excellent";
        } else if (rating >= 4) {
            pct = 10.0;
            perfLabel = "Good";
        } else if (rating >= 3) {
            pct = 5.0;
            perfLabel = "Average";
        } else {
            pct = 0.0;
            isEligible = false;
            perfLabel = "Poor";
        }

        if (isEligible) {
            if (attendanceRate > 95.0) {
                pct += 2.0;
            } else if (attendanceRate < 85.0) {
                pct -= 3.0;
            }

            if (otHours > 20.0) {
                pct += 1.0;
            }

            if (leaveCount > 10) {
                pct -= 2.0;
            }

            pct = Math.max(0.0, Math.min(maxIncrementLimit, pct));
        }

        String reason = "";
        if (isEligible) {
            reason = "Eligible for Salary Increment due to " + perfLabel.toLowerCase() + " performance (Rating: " + rating + "/5). " +
                     "Attendance rate of " + String.format("%.0f", attendanceRate) + "% and " +
                     (otHours > 0 ? otHours + " overtime hours logged." : "consistent contributions.");
        } else {
            reason = "Not recommended for increment at this time due to poor performance rating (" + rating + "/5).";
        }

        double currentSalary = emp.getSalary() != null ? emp.getSalary() : 0.0;
        double newSalary = currentSalary * (1.0 + (pct / 100.0));

        rec.setAttendanceRate(Math.round(attendanceRate * 10.0) / 10.0);
        rec.setOvertimeHours(otHours);
        rec.setPerformanceRating(rating);
        rec.setExperience(exp);
        rec.setEligible(isEligible);
        rec.setSuggestedIncrement(Math.round(pct * 10.0) / 10.0);
        rec.setOriginalSuggestedIncrement(Math.round(pct * 10.0) / 10.0);
        rec.setReason(reason);
        rec.setCurrentSalary(currentSalary);
        rec.setNewEstimatedSalary(Math.round(newSalary * 100.0) / 100.0);

        recommendationRepository.save(rec);
    }

    public SalaryIncrementRecommendation modifyPercentage(Long id, double percentage, String remarks) {
        if (percentage < 0) {
            throw new IllegalArgumentException("Increment percentage cannot be negative.");
        }
        if (percentage > maxIncrementLimit) {
            throw new IllegalArgumentException("Increment exceeds maximum allowed limit of " + maxIncrementLimit + "%");
        }

        SalaryIncrementRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));

        if (!"PENDING".equalsIgnoreCase(rec.getStatus())) {
            throw new IllegalStateException("Only pending recommendations can be modified.");
        }

        double newSalary = rec.getCurrentSalary() * (1.0 + (percentage / 100.0));
        rec.setSuggestedIncrement(Math.round(percentage * 10.0) / 10.0);
        rec.setNewEstimatedSalary(Math.round(newSalary * 100.0) / 100.0);
        if (remarks != null && !remarks.trim().isEmpty()) {
            rec.setReason(remarks.trim());
        } else {
            rec.setReason(rec.getReason() + " (Modified by HR to " + percentage + "%)");
        }
        
        return recommendationRepository.save(rec);
    }

    @Transactional
    public SalaryIncrementRecommendation approveRecommendation(Long id) {
        SalaryIncrementRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));

        if (!"PENDING".equalsIgnoreCase(rec.getStatus())) {
            throw new IllegalStateException("Recommendation has already been processed.");
        }

        Employee emp = employeeRepository.findById(rec.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        double oldSalary = emp.getSalary() != null ? emp.getSalary() : 0.0;
        emp.setSalary(rec.getNewEstimatedSalary());
        employeeRepository.save(emp);

        rec.setStatus("APPROVED");
        SalaryIncrementRecommendation saved = recommendationRepository.save(rec);

        try {
            candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                emp.getEmail(),
                "Congratulations! Your salary has been revised.",
                false,
                java.time.LocalDateTime.now()
            ));
        } catch (Exception ex) {
            System.err.println("Failed to log candidate notification: " + ex.getMessage());
        }

        emailService.sendIncrementMail(emp.getEmail(), emp.getName(), oldSalary, rec.getSuggestedIncrement(), rec.getNewEstimatedSalary());

        return saved;
    }

    public SalaryIncrementRecommendation rejectRecommendation(Long id) {
        SalaryIncrementRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));

        if (!"PENDING".equalsIgnoreCase(rec.getStatus())) {
            throw new IllegalStateException("Recommendation has already been processed.");
        }

        rec.setStatus("REJECTED");
        return recommendationRepository.save(rec);
    }
}
