package com.hrms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hrms.model.Dashboard;

@Service
public class DashboardService {

    @Autowired private EmployeeService employeeService;
    @Autowired private AttendanceService attendanceService;
    @Autowired private LeaveService leaveService;
    @Autowired private PayrollService payrollService;
    @Autowired private DepartmentService departmentService;
    @Autowired private RecruitmentService recruitmentService;
    @Autowired private PerformanceService performanceService;

    public Dashboard getDashboardData() {

        Dashboard d = new Dashboard();

        d.setTotalEmployees(employeeService.getAll().size());
        d.setTotalAttendance(attendanceService.getAllAttendance().size());
        d.setTotalLeaves(leaveService.getAll().size());
        d.setTotalPayrolls(payrollService.getAllPayrolls().size());
        d.setTotalDepartments(departmentService.getAllDepartments().size());
        d.setTotalRecruitments(recruitmentService.getAllRecruitments().size());
        d.setTotalPerformances(performanceService.getAllPerformances().size());

        return d;
    }
}