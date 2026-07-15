package com.hrms.repository;

import com.hrms.model.AttendanceAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceAiInsightRepository extends JpaRepository<AttendanceAiInsight, Long> {
    List<AttendanceAiInsight> findByHrEmail(String hrEmail);
}
