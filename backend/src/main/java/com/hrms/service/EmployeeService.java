package com.hrms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.model.Employee;
import com.hrms.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository repo;

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public Employee add(Employee e) {

        Employee existing = null;
        if (e.getHrEmail() != null) {
            existing = repo.findByEmailAndHrEmail(e.getEmail(), e.getHrEmail());
        } else {
            existing = repo.findByEmail(e.getEmail());
        }

        if (existing != null) {
            throw new RuntimeException(
                    "Employee already exists in the company"
            );
        }

        // Generate unique employee ID
        if (e.getEmployeeId() == null || !e.getEmployeeId().matches("^EMP-\\d{4}-[A-Z0-9]+-\\d{4}$")) {
            int currentYear = java.time.LocalDate.now().getYear();
            String deptCode = "DEPT";
            if (e.getDepartment() != null && e.getDepartment().getDepartmentName() != null) {
                deptCode = e.getDepartment().getDepartmentName().toUpperCase().replaceAll("[^A-Z0-9]", "");
                if (deptCode.isEmpty()) {
                    deptCode = "DEPT";
                }
            }
            
            java.util.Random rand = new java.util.Random();
            boolean unique = false;
            String employeeId = null;
            int retries = 0;
            while (!unique && retries < 100) {
                int randomNum = 1000 + rand.nextInt(9000); // 4-digit number
                String candidateId = "EMP-" + currentYear + "-" + deptCode + "-" + randomNum;
                if (repo.findByEmployeeId(candidateId) == null) {
                    employeeId = candidateId;
                    unique = true;
                }
                retries++;
            }
            if (employeeId == null) {
                employeeId = "EMP-" + currentYear + "-" + deptCode + "-" + (1000 + rand.nextInt(9000));
            }
            e.setEmployeeId(employeeId);
        }

        e.setPassword(com.hrms.util.SecurityHelper.encode(e.getPassword()));
        e.setPasswordHistory(e.getPassword());
        e.setFirstLogin(true);
        Employee saved = repo.save(e);
        try {
            com.hrms.model.Notification notification = new com.hrms.model.Notification();
            notification.setEmail(saved.getEmail());
            notification.setTitle("Welcome to the Company");
            notification.setMessage("Welcome to the team, " + saved.getName() + "! Your employee profile has been created successfully.");
            notification.setType("EMPLOYEE_ADDED");
            notification.setRead(false);
            
            org.springframework.context.ApplicationContext ctx = com.hrms.util.SpringContextHelper.getContext();
            if (ctx != null) {
                com.hrms.service.NotificationService notifService = ctx.getBean(com.hrms.service.NotificationService.class);
                notifService.addNotification(notification);
            }
        } catch (Exception ex) {
            System.err.println("Failed to save employee welcome notification: " + ex.getMessage());
        }
        return saved;
    }
    public Employee update(Long id, Employee emp) {

        Employee e = repo.findById(id).orElse(null);

        if (e != null) {
            e.setName(emp.getName());
            e.setEmail(emp.getEmail());
            e.setDepartment(emp.getDepartment());
            e.setSalary(emp.getSalary());
            e.setUsername(emp.getUsername());
            e.setPassword(emp.getPassword());
            
            // Keep existing employeeId, do not overwrite it with request value if it's already set.
            if (e.getEmployeeId() == null || e.getEmployeeId().isEmpty()) {
                e.setEmployeeId(emp.getEmployeeId());
            }
            e.setMobileNumber(emp.getMobileNumber());
            e.setAddress(emp.getAddress());
            e.setSkills(emp.getSkills());
            e.setResume(emp.getResume());
            e.setExperience(emp.getExperience());
            e.setDesignation(emp.getDesignation());
            e.setProfileInformation(emp.getProfileInformation());
            e.setStatus(emp.getStatus());

            return repo.save(e);
        }

        return null;
    }

    @Autowired
    private com.hrms.repository.AttendanceRepository attendanceRepository;

    @Autowired
    private com.hrms.repository.PayrollRepository payrollRepository;

    public void delete(Long id) {
        java.util.List<com.hrms.model.Attendance> atts = attendanceRepository.findAll().stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(id))
                .collect(java.util.stream.Collectors.toList());
        attendanceRepository.deleteAll(atts);

        java.util.List<com.hrms.model.Payroll> pays = payrollRepository.findAll().stream()
                .filter(p -> p.getEmployee() != null && p.getEmployee().getId().equals(id))
                .collect(java.util.stream.Collectors.toList());
        payrollRepository.deleteAll(pays);

        repo.deleteById(id);
    }

    public Employee login(String username, String password) {
        List<Employee> emps = repo.findByUsername(username);
        if (emps != null) {
            for (Employee e : emps) {
                if (com.hrms.util.SecurityHelper.matches(password, e.getPassword())) {
                    e.setToken(com.hrms.util.JwtHelper.generateToken(e.getEmail(), "EMPLOYEE"));
                    return e;
                }
            }
        }
        return null;
    }
}