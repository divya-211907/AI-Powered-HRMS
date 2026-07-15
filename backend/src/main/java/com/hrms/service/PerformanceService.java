package com.hrms.service;

import com.hrms.model.Performance;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PerformanceService {

    private final List<Performance> performances =
            new ArrayList<>();

    public Performance addPerformance(
            Performance performance) {

        performances.add(
                performance);

        return performance;
    }

    public List<Performance> getAllPerformances() {

        return performances;
    }

    public Performance getPerformances(
            int employeeId) {

        for (Performance performances :
                performances) {

            if (performances.getEmployeeId()
                    == employeeId) {

                return performances;
            }
        }

        return null;
    }
}