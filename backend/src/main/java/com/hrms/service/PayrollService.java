package com.hrms.service;

import com.hrms.model.Payroll;
import com.hrms.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository repo;

    public Payroll addPayroll(Payroll payroll) {
        payroll.setBasicSalary(Math.max(0, payroll.getBasicSalary()));
        payroll.setBonus(Math.max(0, payroll.getBonus()));
        payroll.setDeductions(Math.max(0, payroll.getDeductions()));

        double netSalary =
                payroll.getBasicSalary()
                + payroll.getBonus()
                - payroll.getDeductions();

        payroll.setNetSalary(Math.max(0, netSalary));

        return repo.save(payroll);
    }

    public List<Payroll> getAllPayrolls() {
        return repo.findAll();
    }

    public Payroll getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}