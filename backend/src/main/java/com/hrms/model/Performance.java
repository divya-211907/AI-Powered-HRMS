package com.hrms.model;

public class Performance {

    private int employeeId;
    private String employeeName;
    private String department;
    private int rating;
    private String remarks;

    public Performance() {
    }

    public Performance(
            int employeeId,
            String employeeName,
            String department,
            int rating,
            String remarks) {

        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.rating = rating;
        this.remarks = remarks;
    }

    public int getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(int employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(
            String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(
            String department) {
        this.department = department;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(
            String remarks) {
        this.remarks = remarks;
    }

    private String hrEmail;

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }
}