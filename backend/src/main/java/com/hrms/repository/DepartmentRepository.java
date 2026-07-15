package com.hrms.repository;

import com.hrms.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    List<Department> findByHrEmail(String hrEmail);
    java.util.Optional<Department> findByDepartmentName(String departmentName);
}
