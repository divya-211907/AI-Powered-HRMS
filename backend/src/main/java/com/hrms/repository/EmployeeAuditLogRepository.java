package com.hrms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hrms.model.EmployeeAuditLog;

@Repository
public interface EmployeeAuditLogRepository extends JpaRepository<EmployeeAuditLog, Long> {
}
