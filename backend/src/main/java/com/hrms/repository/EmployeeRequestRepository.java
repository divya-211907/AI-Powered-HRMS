package com.hrms.repository;

import com.hrms.model.EmployeeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRequestRepository extends JpaRepository<EmployeeRequest, Long> {
    List<EmployeeRequest> findByHrEmail(String hrEmail);
    List<EmployeeRequest> findByEmployeeId(Long employeeId);
}
