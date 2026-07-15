package com.hrms.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.dto.AttendanceDTO;
import com.hrms.model.Attendance;
import com.hrms.model.Employee;
import com.hrms.model.HrUser;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PermissionRepository;
import com.hrms.repository.HrUserRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private HrUserRepository hrUserRepository;

    // ================= CHECK-IN =================
    public Attendance checkIn(Long employeeId) {

        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        String today = LocalDate.now().toString();
        List<Attendance> existingLogs = attendanceRepository.findAll();
        Attendance att = existingLogs.stream()
                .filter(a -> a.getEmployee() != null && a.getEmployee().getId().equals(employeeId) && today.equals(a.getDate()))
                .findFirst()
                .orElse(null);

        LocalTime now = LocalTime.now();
        LocalTime deadline = LocalTime.of(9, 30);

        if (att != null) {
            if (att.getCheckIn() != null) {
                return att;
            }
            att.setCheckIn(now.toString());
            att.setStatus("Absent");
            return attendanceRepository.save(att);
        }

        att = new Attendance();
        att.setEmployee(emp);
        att.setDate(today);
        att.setCheckIn(now.toString());

        if (now.isAfter(deadline)) {
            att.setStatus("Absent");
        } else {
            att.setStatus("Present");
        }

        att.setOtHours(0);
        att.setHrEmail(emp.getHrEmail());

        return attendanceRepository.save(att);
    }

    // ================= CHECK-OUT =================
    public Attendance checkOut(Long id) {

        Attendance att = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        LocalTime out = LocalTime.now();
        att.setCheckOut(out.toString());

        String endStr = "17:00";
        if (att.getEmployee() != null && att.getEmployee().getHrEmail() != null && !att.getEmployee().getHrEmail().isEmpty()) {
            endStr = hrUserRepository.findByEmail(att.getEmployee().getHrEmail())
                .map(HrUser::getShiftEnd)
                .orElse("17:00");
        }

        LocalTime shiftEnd = LocalTime.parse(endStr);
        if (out.isAfter(shiftEnd)) {
            long ot = java.time.Duration.between(shiftEnd, out).toHours();
            att.setOtHours((int) ot);
        } else {
            att.setOtHours(0);
        }

        if (att.getHrEmail() == null && att.getEmployee() != null) {
            att.setHrEmail(att.getEmployee().getHrEmail());
        }

        return attendanceRepository.save(att);
    }

    // ================= GET ALL =================
    public List<AttendanceDTO> getAllAttendance() {

        return attendanceRepository.findAll().stream().map(a -> {

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

            // 🔥 IMPORTANT FIX HERE
            if ("Late".equalsIgnoreCase(a.getStatus())) {
                dto.status = "ABSENT (Late)";
            } else {
                dto.status = a.getStatus();
            }

            dto.otHours = a.getOtHours();

            return dto;
        }).toList();
    }
    // ================= DELETE =================
    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }
}