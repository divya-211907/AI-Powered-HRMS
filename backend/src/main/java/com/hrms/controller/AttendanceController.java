package com.hrms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hrms.dto.AttendanceDTO;
import com.hrms.model.Attendance;
import com.hrms.model.Employee;
import com.hrms.service.AttendanceService;
import com.hrms.repository.AttendanceRepository;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    @Autowired
    private AttendanceService service;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    // ================= GET ALL =================
    @GetMapping
    public List<AttendanceDTO> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        List<Attendance> list = (hrEmail != null && !hrEmail.isEmpty())
            ? attendanceRepository.findByHrEmail(hrEmail)
            : attendanceRepository.findAll();

        return list.stream().map(a -> {
            AttendanceDTO dto = new AttendanceDTO();
            dto.id = a.getId();
            Employee emp = a.getEmployee();
            if (emp != null) {
                dto.employeeId = emp.getId();
                dto.employeeName = emp.getName();
            } else {
                dto.employeeId = 0L;
                dto.employeeName = "Unknown";
            }
            dto.date = a.getDate();
            dto.checkIn = a.getCheckIn();
            dto.checkOut = a.getCheckOut();
            if ("Late".equalsIgnoreCase(a.getStatus())) {
                dto.status = "ABSENT (Late)";
            } else {
                dto.status = a.getStatus();
            }
            dto.otHours = a.getOtHours();
            return dto;
        }).toList();
    }

    // ================= CHECK IN =================
    @PostMapping("/checkin/{employeeId}")
    public Attendance checkIn(@PathVariable Long employeeId, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        Attendance att = service.checkIn(employeeId);
        if (hrEmail != null && !hrEmail.isEmpty()) {
            att.setHrEmail(hrEmail);
            attendanceRepository.save(att);
        }
        if (att != null && att.getEmployee() != null && att.getEmployee().getEmail() != null) {
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    att.getEmployee().getEmail(),
                    "Attendance Checked In successfully. Status: " + att.getStatus() + ".",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }
        return att;
    }

    // ================= CHECK OUT =================
    @PutMapping("/checkout/{id}")
    public Attendance checkOut(@PathVariable Long id) {
        Attendance att = service.checkOut(id);
        if (att != null && att.getEmployee() != null && att.getEmployee().getEmail() != null) {
            try {
                candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                    att.getEmployee().getEmail(),
                    "Attendance Checked Out successfully. OT Hours logged: " + att.getOtHours() + ".",
                    false,
                    java.time.LocalDateTime.now()
                ));
            } catch (Exception ex) {
                System.err.println("Failed to log notification: " + ex.getMessage());
            }
        }
        return att;
    }

    @Autowired
    private com.hrms.service.AttendanceSchedulerService schedulerService;

    @PostMapping("/test/trigger-scheduler")
    public String triggerScheduler() {
        schedulerService.markAbsentIfNoCheckIn();
        return "Scheduler triggered successfully";
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}