package com.hrms.controller;

import com.hrms.model.HrUser;
import com.hrms.repository.HrUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/api/hr")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private HrUserRepository hrUserRepository;

    @PostMapping("/register")
    public HrUser register(@RequestBody HrUser user) {
        if (hrUserRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "HR account already exists");
        }
        user.setPassword(com.hrms.util.SecurityHelper.encode(user.getPassword()));
        user.setPasswordHistory(user.getPassword());
        user.setFirstLogin(true);
        return hrUserRepository.save(user);
    }

    @PostMapping("/login")
    public HrUser login(@RequestParam String email, @RequestParam String password) {
        System.out.println("[HR LOGIN DEBUG] Received login request for email: '" + email + "' with password: '" + password + "'");
        Optional<HrUser> hrOpt = hrUserRepository.findByEmail(email);
        if (hrOpt.isEmpty()) {
            System.out.println("[HR LOGIN DEBUG] Email '" + email + "' not found in database!");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        HrUser hr = hrOpt.get();
        boolean bcryptMatches = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches(password, hr.getPassword());
        boolean helperMatches = com.hrms.util.SecurityHelper.matches(password, hr.getPassword());
        System.out.println("[HR LOGIN DEBUG] Stored password in DB: '" + hr.getPassword() + "'");
        System.out.println("[HR LOGIN DEBUG] BCrypt matches: " + bcryptMatches + ", SecurityHelper matches: " + helperMatches);
        if (!helperMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        hr.setToken(com.hrms.util.JwtHelper.generateToken(hr.getEmail(), "HR"));
        return hr;
    }

    @PostMapping("/login-otp")
    public HrUser loginOtp(@RequestParam String email) {
        Optional<HrUser> hrOpt = hrUserRepository.findByEmail(email);
        if (hrOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HR account not found");
        }
        HrUser hr = hrOpt.get();
        hr.setToken(com.hrms.util.JwtHelper.generateToken(hr.getEmail(), "HR"));
        return hr;
    }
    
    @GetMapping("/check-email")
    public boolean checkEmail(@RequestParam String email) {
        return hrUserRepository.findByEmail(email).isPresent();
    }

    @GetMapping("/test-users")
    public java.util.List<HrUser> getTestUsers() {
        return hrUserRepository.findAll();
    }

    @PutMapping("/profile")
    public HrUser updateProfile(@RequestBody HrUser updatedUser) {
        HrUser existing = hrUserRepository.findByEmail(updatedUser.getEmail())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "HR User not found"));
        existing.setName(updatedUser.getName());
        existing.setCompanyName(updatedUser.getCompanyName());
        if (updatedUser.getShiftStart() != null) {
            existing.setShiftStart(updatedUser.getShiftStart());
        }
        if (updatedUser.getShiftEnd() != null) {
            existing.setShiftEnd(updatedUser.getShiftEnd());
        }
        return hrUserRepository.save(existing);
    }

    @Autowired
    private com.hrms.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.hrms.repository.RecruitmentRepository recruitmentRepository;

    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest req) {
        String email = req.getEmail().trim();
        String role = req.getRole().toUpperCase();
        String currentPassword = req.getCurrentPassword();
        String newPassword = req.getNewPassword();

        if (role.equals("HR") || role.equals("ADMIN")) {
            Optional<HrUser> hrOpt = hrUserRepository.findByEmail(email);
            if (hrOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HR/Admin account not found");
            }
            HrUser hr = hrOpt.get();
            if (!com.hrms.util.SecurityHelper.matches(currentPassword, hr.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
            }
            if (com.hrms.util.SecurityHelper.matches(newPassword, hr.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse current password");
            }
            // Check history
            if (hr.getPasswordHistory() != null && !hr.getPasswordHistory().isEmpty()) {
                String[] history = hr.getPasswordHistory().split(",");
                for (String past : history) {
                    if (com.hrms.util.SecurityHelper.matches(newPassword, past)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse previous password");
                    }
                }
            }
            // Encrypt and save
            String encoded = com.hrms.util.SecurityHelper.encode(newPassword);
            hr.setPassword(encoded);
            String hist = hr.getPasswordHistory();
            hr.setPasswordHistory((hist == null || hist.isEmpty()) ? encoded : hist + "," + encoded);
            hr.setFirstLogin(false);
            hrUserRepository.save(hr);
        } else if (role.equals("EMPLOYEE")) {
            java.util.List<com.hrms.model.Employee> emps = employeeRepository.findAllByEmail(email);
            if (emps.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee account not found");
            }
            com.hrms.model.Employee emp = emps.get(0);
            if (!com.hrms.util.SecurityHelper.matches(currentPassword, emp.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
            }
            if (com.hrms.util.SecurityHelper.matches(newPassword, emp.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse current password");
            }
            if (emp.getPasswordHistory() != null && !emp.getPasswordHistory().isEmpty()) {
                String[] history = emp.getPasswordHistory().split(",");
                for (String past : history) {
                    if (com.hrms.util.SecurityHelper.matches(newPassword, past)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse previous password");
                    }
                }
            }
            String encoded = com.hrms.util.SecurityHelper.encode(newPassword);
            emp.setPassword(encoded);
            String hist = emp.getPasswordHistory();
            emp.setPasswordHistory((hist == null || hist.isEmpty()) ? encoded : hist + "," + encoded);
            emp.setFirstLogin(false);
            employeeRepository.save(emp);
        } else if (role.equals("CANDIDATE")) {
            Optional<com.hrms.model.Recruitment> rOpt = recruitmentRepository.findByEmail(email);
            if (rOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate account not found");
            }
            com.hrms.model.Recruitment r = rOpt.get();
            if (!com.hrms.util.SecurityHelper.matches(currentPassword, r.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
            }
            if (com.hrms.util.SecurityHelper.matches(newPassword, r.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse current password");
            }
            if (r.getPasswordHistory() != null && !r.getPasswordHistory().isEmpty()) {
                String[] history = r.getPasswordHistory().split(",");
                for (String past : history) {
                    if (com.hrms.util.SecurityHelper.matches(newPassword, past)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reuse previous password");
                    }
                }
            }
            String encoded = com.hrms.util.SecurityHelper.encode(newPassword);
            r.setPassword(encoded);
            String hist = r.getPasswordHistory();
            r.setPasswordHistory((hist == null || hist.isEmpty()) ? encoded : hist + "," + encoded);
            r.setFirstLogin(false);
            recruitmentRepository.save(r);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
    }

    public static class ChangePasswordRequest {
        private String email;
        private String role;
        private String currentPassword;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
