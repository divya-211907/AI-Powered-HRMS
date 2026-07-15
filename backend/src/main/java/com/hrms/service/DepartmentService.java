package com.hrms.service;

import com.hrms.model.Department;
import com.hrms.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository repo;

    // GET ALL
    public List<Department> getAllDepartments() {
        return repo.findAll();
    }

    // ADD
    public Department addDepartment(Department d) {
        return repo.save(d);
    }

    // UPDATE
    public Department updateDepartment(int id, Department d) {
        Department dept = repo.findById(id).orElseThrow();
        dept.setDepartmentName(d.getDepartmentName());
        dept.setManager(d.getManager());
        dept.setEmployeeCount(d.getEmployeeCount());
        return repo.save(dept);
    }

    // DELETE
    public void deleteDepartment(int id) {
        repo.deleteById(id);
    }
}