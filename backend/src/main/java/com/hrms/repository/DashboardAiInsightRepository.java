package com.hrms.repository;

import com.hrms.model.DashboardAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DashboardAiInsightRepository extends JpaRepository<DashboardAiInsight, Long> {
    List<DashboardAiInsight> findByHrEmail(String hrEmail);
}
