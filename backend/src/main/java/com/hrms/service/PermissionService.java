package com.hrms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.model.Permission;
import com.hrms.repository.PermissionRepository;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository repo;

    public Permission apply(Permission p) {

        List<Permission> existing =
                repo.findByEmployeeIdAndDate(
                        p.getEmployeeId(),
                        p.getDate()
                );

        if (!existing.isEmpty()) {
            throw new RuntimeException("Permission already applied for this date");
        }

        p.setStatus("PENDING");

        return repo.save(p);
    }

    public List<Permission> getAll() {
        return repo.findAll();
    }

    public List<Permission> getByEmployee(Long id) {
        return repo.findByEmployeeId(id);
    }

    public Permission approve(Long id) {
        Permission p = repo.findById(id).orElseThrow();
        p.setStatus("APPROVED");
        return repo.save(p);
    }

    public Permission reject(Long id) {
        Permission p = repo.findById(id).orElseThrow();
        p.setStatus("REJECTED");
        return repo.save(p);
    }

    // 🔥 DELETE METHOD
    public void delete(Long id) {
        repo.deleteById(id);
    }
}