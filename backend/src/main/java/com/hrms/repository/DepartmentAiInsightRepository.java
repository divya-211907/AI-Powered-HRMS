package com.hrms.repository;

import com.hrms.model.DepartmentAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentAiInsightRepository extends JpaRepository<DepartmentAiInsight, Long> {
    List<DepartmentAiInsight> findByHrEmail(String hrEmail);
}
