package com.hrms.repository;

import com.hrms.model.CandidateAiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CandidateAiInsightRepository extends JpaRepository<CandidateAiInsight, Long> {
    List<CandidateAiInsight> findByHrEmail(String hrEmail);
}
