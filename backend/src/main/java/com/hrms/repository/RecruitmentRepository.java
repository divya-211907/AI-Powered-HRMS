package com.hrms.repository;

import com.hrms.model.Recruitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {
    List<Recruitment> findByHrEmail(String hrEmail);
    Optional<Recruitment> findByEmail(String email);
    List<Recruitment> findByAssignedHrId(Long assignedHrId);
    Optional<Recruitment> findByEmailAndPosition(String email, String position);
    Optional<Recruitment> findByMobileAndPosition(String mobile, String position);
    Optional<Recruitment> findByEmailAndJobOpeningId(String email, Long jobOpeningId);
    Optional<Recruitment> findByMobileAndJobOpeningId(String mobile, Long jobOpeningId);
}
