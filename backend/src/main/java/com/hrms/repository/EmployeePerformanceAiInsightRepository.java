package com.hrms.repository;

import com.hrms.model.EmployeePerformanceAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeePerformanceAiInsightRepository extends JpaRepository<EmployeePerformanceAiInsight, Long> {
    List<EmployeePerformanceAiInsight> findByHrEmail(String hrEmail);
}
