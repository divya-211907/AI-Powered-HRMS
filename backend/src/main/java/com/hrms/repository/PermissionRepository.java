package com.hrms.repository;

import com.hrms.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByEmployeeId(Long employeeId);
    List<Permission> findByEmployeeIdAndDate(Long employeeId, String date);
    List<Permission> findByHrEmail(String hrEmail);
}