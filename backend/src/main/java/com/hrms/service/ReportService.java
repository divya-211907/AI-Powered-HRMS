package com.hrms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.model.Report;

@Service
public class ReportService {

    @Autowired private EmployeeService employeeService;
    @Autowired private DepartmentService departmentService;
    @Autowired private AttendanceService attendanceService;
    @Autowired private LeaveService leaveService;
    @Autowired private PayrollService payrollService;
    @Autowired private RecruitmentService recruitmentService;
    @Autowired private PerformanceService performanceService;

    public Report generateReport() {

        Report r = new Report();

        r.setTotalEmployees(employeeService.getAll().size());
        r.setTotalDepartments(departmentService.getAllDepartments().size());
        r.setTotalAttendance(attendanceService.getAllAttendance().size());
        r.setTotalLeaves(leaveService.getAll().size());
        r.setTotalPayrolls(payrollService.getAllPayrolls().size());
        r.setTotalRecruitments(recruitmentService.getAllRecruitments().size());
        r.setTotalPerformances(performanceService.getAllPerformances().size());

        return r;
    }
}