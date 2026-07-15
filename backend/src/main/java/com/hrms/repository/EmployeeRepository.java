package com.hrms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hrms.model.Employee;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByUsername(String username);

    Employee findByEmployeeId(String employeeId);

    Employee findByEmail(String email);

    List<Employee> findByHrEmail(String hrEmail);

    Employee findByEmailAndHrEmail(String email, String hrEmail);

    Employee findByMobileNumber(String mobileNumber);

    Employee findByCandidateId(Long candidateId);

    List<Employee> findAllByEmail(String email);

    List<Employee> findAllByMobileNumber(String mobileNumber);

    List<Employee> findAllByCandidateId(Long candidateId);
}