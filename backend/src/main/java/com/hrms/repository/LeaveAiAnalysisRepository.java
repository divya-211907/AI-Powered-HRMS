package com.hrms.repository;

import com.hrms.model.LeaveAiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LeaveAiAnalysisRepository extends JpaRepository<LeaveAiAnalysis, Long> {
    Optional<LeaveAiAnalysis> findByLeaveRequestId(Long leaveRequestId);
}
