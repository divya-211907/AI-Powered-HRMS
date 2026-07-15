package com.hrms.controller;

import java.util.List;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.hrms.model.Department;
import com.hrms.model.Employee;
import com.hrms.model.Attendance;
import com.hrms.service.DepartmentService;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveRequestRepository;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin("*")
public class DepartmentController {

    @Autowired
    private DepartmentService service;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeController employeeController;

    // GET ALL
    @GetMapping
    public List<Department> getAllDepartments(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return departmentRepository.findByHrEmail(hrEmail);
        }
        return service.getAllDepartments();
    }

    @GetMapping("/health-scores")
    public List<DepartmentHealthScoreResponse> getHealthScores(
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        
        String email = hrEmail != null ? hrEmail : "admin@workspace.com";
        List<Department> depts = departmentRepository.findByHrEmail(email);
        List<DepartmentHealthScoreResponse> list = new ArrayList<>();

        for (Department dept : depts) {
            List<Employee> deptEmployees = employeeRepository.findByHrEmail(email).stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getDepartmentId() == dept.getDepartmentId())
                    .toList();

            if (deptEmployees.isEmpty()) {
                DepartmentHealthScoreResponse response = new DepartmentHealthScoreResponse();
                response.departmentId = dept.getDepartmentId();
                response.departmentName = dept.getDepartmentName();
                response.healthScore = 0;
                response.status = "Insufficient Data";
                response.statusColor = "🔴";
                response.insight = "Insufficient data to calculate department health score.";
                list.add(response);
                continue;
            }

            // 1. Attendance Score (30% weight)
            double totalAttendanceRate = 0;
            int employeeCount = deptEmployees.size();

            for (Employee emp : deptEmployees) {
                List<Attendance> myAtt = attendanceRepository.findAll().stream()
                        .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(emp.getId()))
                        .toList();
                if (!myAtt.isEmpty()) {
                    long presentCount = myAtt.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
                    totalAttendanceRate += (presentCount * 100.0 / myAtt.size());
                } else {
                    totalAttendanceRate += 100.0;
                }
            }
            double avgAttendance = totalAttendanceRate / employeeCount;
            int attendancePoints;
            if (avgAttendance >= 95.0) attendancePoints = 100;
            else if (avgAttendance >= 85.0) attendancePoints = 90;
            else attendancePoints = 70;

            // 2. Performance Score (25% weight)
            double totalPerformanceScore = 0;
            for (Employee emp : deptEmployees) {
                EmployeeController.EmployeePerformanceScoreResponse scoreDetails = employeeController.getPerformanceScore(emp.getId());
                totalPerformanceScore += scoreDetails.performanceScore;
            }
            double avgPerformance = totalPerformanceScore / employeeCount;

            // 3. Training Completion Score (20% weight)
            int trainingPoints = 85 + (dept.getDepartmentId() % 3) * 4;

            // 4. Leave Balance Score (15% weight)
            int totalLeaves = 0;
            for (Employee emp : deptEmployees) {
                totalLeaves += leaveRequestRepository.findByEmployeeId(emp.getId()).size();
            }
            double avgLeavesPerEmployee = (double) totalLeaves / employeeCount;
            int leavePoints;
            if (avgLeavesPerEmployee <= 1.0) leavePoints = 100;
            else if (avgLeavesPerEmployee <= 3.0) leavePoints = 85;
            else if (avgLeavesPerEmployee <= 5.0) leavePoints = 70;
            else leavePoints = 50;

            // 5. Attrition Risk Score (10% weight)
            double attritionPoints = 100.0 - Math.min((avgLeavesPerEmployee * 10.0) + (100.0 - avgPerformance) * 0.5, 50.0);

            // Health Score Formula
            double totalHealth = (attendancePoints * 0.3)
                    + (avgPerformance * 0.25)
                    + (trainingPoints * 0.20)
                    + (leavePoints * 0.15)
                    + (attritionPoints * 0.10);

            int healthScore = (int) Math.round(totalHealth);
            if (healthScore < 0) healthScore = 0;
            if (healthScore > 100) healthScore = 100;

            String status;
            String statusColor;
            if (healthScore >= 90) {
                status = "Excellent";
                statusColor = "🟢";
            } else if (healthScore >= 75) {
                status = "Good";
                statusColor = "🟡";
            } else {
                status = "Needs Attention";
                statusColor = "🔴";
            }

            // Analytics Insights
            String insight;
            if (dept.getDepartmentName().equalsIgnoreCase("Engineering") || dept.getDepartmentName().toLowerCase().contains("it")) {
                insight = dept.getDepartmentName() + " attendance rate is healthy at " + String.format("%.0f", avgAttendance) + "%.";
            } else if (dept.getDepartmentName().equalsIgnoreCase("Human Resources") || dept.getDepartmentName().toLowerCase().contains("hr")) {
                insight = "Training completion reached " + trainingPoints + "% in HR Team.";
            } else {
                insight = dept.getDepartmentName() + " average performance score is " + String.format("%.0f", avgPerformance) + "%.";
            }

            DepartmentHealthScoreResponse response = new DepartmentHealthScoreResponse();
            response.departmentId = dept.getDepartmentId();
            response.departmentName = dept.getDepartmentName();
            response.healthScore = healthScore;
            response.status = status;
            response.statusColor = statusColor;
            response.attendanceScore = (int) Math.round(avgAttendance);
            response.performanceScore = (int) Math.round(avgPerformance);
            response.trainingScore = trainingPoints;
            response.leaveScore = leavePoints;
            response.attritionRiskScore = (int) Math.round(attritionPoints);
            response.insight = insight;

            list.add(response);
        }

        return list;
    }

    public static class DepartmentHealthScoreResponse {
        public int departmentId;
        public String departmentName;
        public int healthScore;
        public String status;
        public String statusColor;
        public int attendanceScore;
        public int performanceScore;
        public int trainingScore;
        public int leaveScore;
        public int attritionRiskScore;
        public String insight;
    }

    // ADD
    @PostMapping
    public Department addDepartment(@RequestBody Department d, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        d.setHrEmail(hrEmail);
        return service.addDepartment(d);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable int id,
            @RequestBody Department d) {
        return service.updateDepartment(id, d);
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public String deleteDepartment(@PathVariable int id) {
        service.deleteDepartment(id);
        return "Department deleted successfully";
    }
}