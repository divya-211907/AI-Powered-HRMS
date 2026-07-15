package com.hrms.repository;

import com.hrms.model.CandidateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateStatusRepository extends JpaRepository<CandidateStatus, Long> {
    List<CandidateStatus> findByEmailOrderByUpdatedAtDesc(String email);
}
