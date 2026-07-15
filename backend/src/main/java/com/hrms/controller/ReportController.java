package com.hrms.controller;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportController {

    @GetMapping
    public Map<String, Object> getReport() {

        Map<String, Object> report = new HashMap<>();
        report.put("totalEmployees", 10);
        report.put("presentToday", 7);
        report.put("onLeave", 2);
        report.put("recruitmentOpen", 3);

        return report;
    }
}