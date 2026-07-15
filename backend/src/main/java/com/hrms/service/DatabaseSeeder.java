package com.hrms.service;

import com.hrms.model.HrUser;
import com.hrms.repository.HrUserRepository;
import com.hrms.util.SecurityHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private HrUserRepository hrUserRepository;

    @Override
    public void run(String... args) throws Exception {
        String hrEmail = "24ada52@karpagamtech.ac.in";
        Optional<HrUser> hrOpt = hrUserRepository.findByEmail(hrEmail);
        if (hrOpt.isEmpty()) {
            System.out.println("Seeding default HR user: " + hrEmail);
            HrUser hr = new HrUser();
            hr.setName("Sarmila S");
            hr.setEmail(hrEmail);
            hr.setPassword(SecurityHelper.encode("Sarmi@123"));
            hr.setCompanyName("NextGen Tech");
            hr.setFirstLogin(false);
            hrUserRepository.save(hr);
            System.out.println("Default HR user seeded successfully!");
        } else {
            System.out.println("HR user already exists in the database.");
        }
    }
}
