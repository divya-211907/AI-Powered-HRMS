package com.hrms.repository;

import com.hrms.model.ResumeExtraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeExtractionRepository extends JpaRepository<ResumeExtraction, Long> {
    Optional<ResumeExtraction> findByCandidateId(Long candidateId);
}
