package com.hrms.model;

public class User {
    public String username;
    public String password;
    public String role;

    public User(String u, String p, String r) {
        this.username = u;
        this.password = p;
        this.role = r;
    }
}