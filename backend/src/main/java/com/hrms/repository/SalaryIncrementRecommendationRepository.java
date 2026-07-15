package com.hrms.repository;

import com.hrms.model.SalaryIncrementRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryIncrementRecommendationRepository extends JpaRepository<SalaryIncrementRecommendation, Long> {
    List<SalaryIncrementRecommendation> findByHrEmail(String hrEmail);
    Optional<SalaryIncrementRecommendation> findByEmployeeIdAndStatus(Long employeeId, String status);
    Optional<SalaryIncrementRecommendation> findByEmployeeId(Long employeeId);
}
