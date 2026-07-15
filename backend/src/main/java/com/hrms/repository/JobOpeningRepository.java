package com.hrms.repository;

import com.hrms.model.JobOpening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {
    List<JobOpening> findByHrEmail(String hrEmail);
    List<JobOpening> findByHrId(Long hrId);
}
