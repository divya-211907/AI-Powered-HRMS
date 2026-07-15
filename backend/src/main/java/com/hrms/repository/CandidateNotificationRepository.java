package com.hrms.repository;

import com.hrms.model.CandidateNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateNotificationRepository extends JpaRepository<CandidateNotification, Long> {
    List<CandidateNotification> findByEmailOrderByCreatedAtDesc(String email);
    long countByEmailAndIsReadFalse(String email);
}
