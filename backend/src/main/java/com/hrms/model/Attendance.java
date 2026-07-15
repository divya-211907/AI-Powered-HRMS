package com.hrms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String date;
    private String checkIn;
    private String checkOut;
    private String status;
    private Integer otHours;

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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(String checkIn) {
        this.checkIn = checkIn;
    }

    public String getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(String checkOut) {
        this.checkOut = checkOut;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getOtHours() {
        return otHours;
    }

    public void setOtHours(Integer otHours) {
        if (otHours != null && otHours < 0) {
            this.otHours = 0;
        } else {
            this.otHours = otHours;
        }
    }

    @PrePersist
    @PreUpdate
    public void preventNegativeValues() {
        if (this.otHours != null && this.otHours < 0) {
            this.otHours = 0;
        }
        com.hrms.service.DateValidator.validateNotPastDate(this.date);
    }

    private String hrEmail;

    public String getHrEmail() {
        return hrEmail;
    }

    public void setHrEmail(String hrEmail) {
        this.hrEmail = hrEmail;
    }
}