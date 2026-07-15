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

    public static class HrLoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(
            @RequestBody(required = false) HrLoginRequest req,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String password) {
        
        String finalEmail = null;
        String finalPassword = null;

        if (req != null) {
            finalEmail = req.getEmail();
            finalPassword = req.getPassword();
        }

        if (finalEmail == null || finalEmail.isEmpty()) {
            finalEmail = email;
        }
        if (finalPassword == null || finalPassword.isEmpty()) {
            finalPassword = password;
        }

        System.out.println("Login Attempt");
        System.out.println("Email: " + finalEmail);
        System.out.println("Password: " + finalPassword);

        Optional<HrUser> hrOpt = hrUserRepository.findByEmail(finalEmail);
        if (hrOpt.isEmpty()) {
            System.out.println("User not found: " + finalEmail);
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid Email or Password");
            return org.springframework.http.ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        HrUser hr = hrOpt.get();
        System.out.println("Database email: " + hr.getEmail());
        System.out.println("Database password: " + hr.getPassword());
        System.out.println("Incoming password: " + finalPassword);

        boolean match = com.hrms.util.SecurityHelper.matches(finalPassword, hr.getPassword());
        System.out.println("Password match result: " + match);

        if (!match) {
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid Email or Password");
            return org.springframework.http.ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        hr.setToken(com.hrms.util.JwtHelper.generateToken(hr.getEmail(), "HR"));

        java.util.Map<String, Object> success = new java.util.HashMap<>();
        success.put("success", true);
        success.put("id", hr.getId());
        success.put("name", hr.getName());
        success.put("email", hr.getEmail());
        success.put("token", hr.getToken());

        return org.springframework.http.ResponseEntity.ok(success);
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
