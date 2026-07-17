package com.hrms.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin("*")
public class PerformanceController {

    private List<Map<String, Object>> list = new ArrayList<>();

    @GetMapping
    public List<Map<String, Object>> getAll(@RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return list.stream().filter(p -> hrEmail.equalsIgnoreCase((String) p.get("hrEmail"))).toList();
        }
        return list;
    }

    @Autowired
    private com.hrms.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.hrms.repository.CandidateNotificationRepository candidateNotificationRepository;

    @PostMapping
    public Map<String, Object> add(@RequestBody Map<String, Object> data, @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        data.put("id", list.size() + 1);
        if (hrEmail != null) {
            data.put("hrEmail", hrEmail);
        }
        if (data.containsKey("rating") && data.get("rating") != null) {
            Object ratingObj = data.get("rating");
            int rVal = 0;
            if (ratingObj instanceof Number) {
                rVal = ((Number) ratingObj).intValue();
            } else {
                try {
                    rVal = Integer.parseInt(ratingObj.toString());
                } catch (NumberFormatException e) {
                    // ignore
                }
            }
            if (rVal < 0) {
                rVal = 0;
            }
            data.put("rating", rVal);
        }
        
        // Log Notification for Employee
        if (data.containsKey("employeeId") && data.get("employeeId") != null) {
            try {
                Long empId = Long.parseLong(data.get("employeeId").toString());
                employeeRepository.findById(empId).ifPresent(emp -> {
                    try {
                        candidateNotificationRepository.save(new com.hrms.model.CandidateNotification(
                            emp.getEmail(),
                            "Performance Review Update: A new performance evaluation has been posted for you.",
                            false,
                            java.time.LocalDateTime.now()
                        ));
                    } catch (Exception ex) {
                        System.err.println("Failed to log performance review notification: " + ex.getMessage());
                    }
                });
            } catch (Exception ex) {
                System.err.println("Failed to resolve employee for performance review notification: " + ex.getMessage());
            }
        }

        list.add(data);
        return data;
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable int id,
                                      @RequestBody Map<String, Object> data) {
        if (data.containsKey("rating") && data.get("rating") != null) {
            Object ratingObj = data.get("rating");
            int rVal = 0;
            if (ratingObj instanceof Number) {
                rVal = ((Number) ratingObj).intValue();
            } else {
                try {
                    rVal = Integer.parseInt(ratingObj.toString());
                } catch (NumberFormatException e) {
                    // ignore
                }
            }
            if (rVal < 0) {
                rVal = 0;
            }
            data.put("rating", rVal);
        }
        for (Map<String, Object> p : list) {
            if ((int) p.get("id") == id) {
                p.putAll(data);
                return p;
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        list.removeIf(p -> (int) p.get("id") == id);
    }
}