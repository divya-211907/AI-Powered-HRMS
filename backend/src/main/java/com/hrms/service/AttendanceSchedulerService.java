package com.hrms.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.hrms.model.Attendance;
import com.hrms.model.Employee;
import com.hrms.model.CandidateNotification;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.CandidateNotificationRepository;
import java.time.LocalDateTime;

@Service
public class AttendanceSchedulerService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private CandidateNotificationRepository candidateNotificationRepository;

    // 🔥 runs every day at 09:31 AM
    @Scheduled(cron = "0 31 9 * * *")
    public void markAbsentIfNoCheckIn() {

        String today = LocalDate.now().toString();

        List<Employee> employees = employeeRepository.findAll();

        for (Employee emp : employees) {

            // check if attendance already exists for today
            boolean exists = attendanceRepository.findAll()
                    .stream()
                    .anyMatch(a ->
                            a.getEmployee() != null &&
                            a.getEmployee().getId().equals(emp.getId()) &&
                            today.equals(a.getDate())
                    );

            // ❌ if no record → mark Absent
            if (!exists) {
                Attendance att = new Attendance();
                att.setEmployee(emp);
                att.setDate(today);
                att.setCheckIn(null);
                att.setCheckOut(null);
                att.setStatus("Absent");
                att.setOtHours(0);
                att.setHrEmail(emp.getHrEmail());

                attendanceRepository.save(att);

                // Send notification to employee
                CandidateNotification notif = new CandidateNotification();
                notif.setEmail(emp.getEmail());
                notif.setTitle("Absent Alert");
                notif.setMessage("You have been marked Absent because no check-in was recorded before 09:30 AM.");
                notif.setRead(false);
                notif.setCreatedAt(LocalDateTime.now());
                candidateNotificationRepository.save(notif);
            }
        }
    }
}