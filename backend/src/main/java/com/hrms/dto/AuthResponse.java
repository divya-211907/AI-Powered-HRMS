package com.hrms.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String username;
    private int employeeId;

    public AuthResponse() {
    }

    public AuthResponse(
            String token,
            String role,
            String username,
            int employeeId) {

        this.token = token;
        this.role = role;
        this.username = username;
        this.employeeId = employeeId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(
            String username) {
        this.username = username;
    }

    public int getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(
            int employeeId) {
        this.employeeId = employeeId;
    }
}