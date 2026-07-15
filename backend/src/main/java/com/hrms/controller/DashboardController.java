package com.hrms.controller;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @GetMapping
    public Map<String, Object> getDashboard() {

        Map<String, Object> data = new HashMap<>();

        data.put("employees", 10);
        data.put("leaves", 3);
        data.put("attendance", 20);
        data.put("payroll", 5);

        return data;
    }
}