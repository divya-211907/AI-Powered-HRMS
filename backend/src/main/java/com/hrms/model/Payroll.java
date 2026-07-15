package com.hrms.model;

import jakarta.persistence.*;

@Entity
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private double basicSalary;
    private double bonus;
    private double deductions;
    private double netSalary;

    // getters & setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public double getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(double basicSalary) {
        this.basicSalary = Math.max(0, basicSalary);
    }

    public double getBonus() {
        return bonus;
    }

    public void setBonus(double bonus) {
        this.bonus = Math.max(0, bonus);
    }

    public double getDeductions() {
        return deductions;
    }

    public void setDeductions(double deductions) {
        this.deductions = Math.max(0, deductions);
    }

    public double getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(double netSalary) {
        this.netSalary = Math.max(0, netSalary);
    }

    @PrePersist
    @PreUpdate
    public void preventNegativeValues() {
        this.basicSalary = Math.max(0, this.basicSalary);
        this.bonus = Math.max(0, this.bonus);
        this.deductions = Math.max(0, this.deductions);
        this.netSalary = Math.max(0, this.netSalary);
    }

    private String hrEmail;

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }

    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }
}