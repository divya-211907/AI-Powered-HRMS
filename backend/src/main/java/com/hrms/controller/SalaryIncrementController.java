package com.hrms.controller;

import com.hrms.model.SalaryIncrementRecommendation;
import com.hrms.model.Employee;
import com.hrms.model.Attendance;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.SalaryIncrementRecommendationRepository;
import com.hrms.service.SalaryIncrementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin("*")
public class SalaryIncrementController {

    @Autowired
    private SalaryIncrementService incrementService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private SalaryIncrementRecommendationRepository recommendationRepository;

    @Autowired
    private EmployeeController employeeController;

    @GetMapping("/increment-recommendations")
    public ResponseEntity<List<SalaryIncrementRecommendation>> getRecommendations(
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        
        String email = hrEmail != null ? hrEmail : "admin@workspace.com";
        List<SalaryIncrementRecommendation> recs = incrementService.getOrCreateRecommendations(email);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/ai-revision")
    public ResponseEntity<List<AiRevisionResponse>> getAiRevision(
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        
        String email = hrEmail != null ? hrEmail : "admin@workspace.com";
        List<Employee> emps = employeeRepository.findByHrEmail(email);
        List<AiRevisionResponse> list = new ArrayList<>();

        for (Employee emp : emps) {
            SalaryIncrementRecommendation rec = incrementService.getOrCreateRecommendationForEmployee(emp, email);

            EmployeeController.EmployeePerformanceScoreResponse scoreDetails = employeeController.getPerformanceScore(emp.getId());

            double rating;
            if (scoreDetails.performanceScore >= 95) rating = 5.0;
            else if (scoreDetails.performanceScore >= 85) rating = 4.5;
            else if (scoreDetails.performanceScore >= 75) rating = 4.0;
            else if (scoreDetails.performanceScore >= 65) rating = 3.5;
            else if (scoreDetails.performanceScore >= 50) rating = 3.0;
            else rating = 2.0;

            List<Attendance> myAtt = attendanceRepository.findAll().stream()
                    .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(emp.getId()))
                    .toList();
            double overtimeHours = myAtt.stream().mapToDouble(a -> a.getOtHours() != null ? a.getOtHours() : 0.0).sum();

            double recommendedIncrement = 0;
            if (scoreDetails.performanceScore > 90) {
                recommendedIncrement = 10.0 + (scoreDetails.attendanceScore >= 95 ? 2.0 : 0.0) + (overtimeHours > 20 ? 1.5 : 0.0) + (rating >= 4.8 ? 1.5 : 0.0);
                recommendedIncrement = Math.min(recommendedIncrement, 15.0);
            } else if (scoreDetails.performanceScore >= 80) {
                recommendedIncrement = 7.0 + (scoreDetails.attendanceScore >= 90 ? 1.5 : 0.0) + (overtimeHours > 15 ? 1.0 : 0.0) + (rating >= 4.0 ? 0.5 : 0.0);
                recommendedIncrement = Math.min(recommendedIncrement, 10.0);
            } else if (scoreDetails.performanceScore >= 70) {
                recommendedIncrement = 4.0 + (scoreDetails.attendanceScore >= 80 ? 1.5 : 0.0) + (overtimeHours > 10 ? 1.0 : 0.0) + (rating >= 3.5 ? 0.5 : 0.0);
                recommendedIncrement = Math.min(recommendedIncrement, 7.0);
            } else if (scoreDetails.performanceScore >= 60) {
                recommendedIncrement = 2.0 + (scoreDetails.attendanceScore >= 70 ? 1.0 : 0.0) + (overtimeHours > 5 ? 0.5 : 0.0) + (rating >= 3.0 ? 0.5 : 0.0);
                recommendedIncrement = Math.min(recommendedIncrement, 4.0);
            } else {
                recommendedIncrement = 0.0 + (scoreDetails.attendanceScore >= 60 ? 1.0 : 0.0) + (overtimeHours > 0 ? 1.0 : 0.0);
                recommendedIncrement = Math.min(recommendedIncrement, 2.0);
            }

            String assessment;
            if (scoreDetails.performanceScore >= 90) {
                assessment = "Outstanding Performer: Consistently exceeds expectations. Recommended for promotion and salary revision.";
            } else if (scoreDetails.performanceScore >= 80) {
                assessment = "Excellent Performer: Strong contribution and reliable attendance. Eligible for salary increment.";
            } else if (scoreDetails.performanceScore >= 70) {
                assessment = "Good Performer: Strong contribution and reliable attendance. Eligible for salary increment.";
            } else if (scoreDetails.performanceScore >= 60) {
                assessment = "Average Performer: Performance is stable. Moderate salary revision recommended.";
            } else {
                assessment = "Needs Improvement: Performance improvement required before salary revision.";
            }

            double currentSalary = emp.getSalary() != null ? emp.getSalary() : 0.0;
            
            rec.setAttendanceRate(scoreDetails.attendanceScore);
            rec.setOvertimeHours(overtimeHours);
            rec.setPerformanceRating((int) Math.round(rating));
            rec.setCurrentSalary(currentSalary);
            
            if ("PENDING".equalsIgnoreCase(rec.getStatus())) {
                rec.setSuggestedIncrement(recommendedIncrement);
                rec.setNewEstimatedSalary(currentSalary * (1.0 + (recommendedIncrement / 100.0)));
            }
            rec.setReason(assessment);
            recommendationRepository.save(rec);

            AiRevisionResponse dto = new AiRevisionResponse();
            dto.id = rec.getId();
            dto.employeeId = emp.getEmployeeId();
            dto.employeeName = emp.getName();
            dto.attendance = scoreDetails.attendanceScore;
            dto.attendanceRate = scoreDetails.attendanceScore;
            dto.performanceScore = scoreDetails.performanceScore;
            dto.rating = rating;
            dto.performanceRating = rating;
            dto.overtimeHours = overtimeHours;
            dto.currentSalary = currentSalary;
            dto.recommendedIncrement = rec.getSuggestedIncrement();
            dto.suggestedIncrement = rec.getSuggestedIncrement();
            dto.newSalary = rec.getNewEstimatedSalary();
            dto.newEstimatedSalary = rec.getNewEstimatedSalary();
            dto.assessment = assessment;
            dto.status = rec.getStatus();
            dto.reason = rec.getReason();

            list.add(dto);
        }

        return ResponseEntity.ok(list);
    }

    public static class AiRevisionResponse {
        public Long id;
        public String employeeId;
        public String employeeName;
        public int attendance;
        public int performanceScore;
        public double rating;
        public double overtimeHours;
        public double currentSalary;
        public double recommendedIncrement;
        public double newSalary;
        public String assessment;
        public String status;
        public String reason;
        
        public double attendanceRate;
        public double performanceRating;
        public double suggestedIncrement;
        public double newEstimatedSalary;
    }

    @PutMapping("/increment-recommendations/{id}/modify")
    public ResponseEntity<?> modifyPercentage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        
        try {
            if (!payload.containsKey("percentage")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Percentage parameter is required."));
            }
            double percentage = Double.parseDouble(payload.get("percentage").toString());
            String remarks = payload.containsKey("remarks") ? (String) payload.get("remarks") : null;
            SalaryIncrementRecommendation updated = incrementService.modifyPercentage(id, percentage, remarks);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @PostMapping("/increment-recommendations/{id}/approve")
    public ResponseEntity<?> approveRecommendation(@PathVariable Long id) {
        try {
            SalaryIncrementRecommendation approved = incrementService.approveRecommendation(id);
            return ResponseEntity.ok(approved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @PostMapping("/increment-recommendations/{id}/reject")
    public ResponseEntity<?> rejectRecommendation(@PathVariable Long id) {
        try {
            SalaryIncrementRecommendation rejected = incrementService.rejectRecommendation(id);
            return ResponseEntity.ok(rejected);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "An unexpected error occurred."));
        }
    }
}
