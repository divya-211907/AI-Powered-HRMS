package com.hrms.repository;

import com.hrms.model.RecruitmentFraud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentFraudRepository extends JpaRepository<RecruitmentFraud, Long> {
    Optional<RecruitmentFraud> findFirstByApplicationIdOrderByCreatedAtDesc(Long applicationId);
    List<RecruitmentFraud> findByCandidateIdOrderByCreatedAtDesc(String candidateId);
}
