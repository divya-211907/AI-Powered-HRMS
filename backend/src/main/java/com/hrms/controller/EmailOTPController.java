package com.hrms.controller;

import com.hrms.otp.OTPStore;
import com.hrms.service.EmailService;
import com.hrms.model.Recruitment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin("*")
public class EmailOTPController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public Map<String, Object> sendOtp(@RequestBody Recruitment req) {
        String email = req.getEmail();
        
        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required");
        }

        // Validate email format
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        String otp = emailService.generateOtp();
        long expiryTimeMs = System.currentTimeMillis() + 2 * 60 * 1000; // 2 minutes
        
        OTPStore.otpMap.put(email, new OTPStore.OTPData(otp, expiryTimeMs));

        boolean emailSent = false;
        String errorMsg = null;

        try {
            emailService.sendEmail(email, otp);
            emailSent = true;
        } catch (Exception e) {
            // Remove OTP from storage if delivery fails
            OTPStore.otpMap.remove(email);
            String errMsg = e.getMessage();
            if (errMsg != null && (errMsg.contains("Authentication failed") || errMsg.contains("535"))) {
                throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Gmail SMTP Authentication Failed: The app password in application.properties has expired or is invalid. Please update spring.mail.username and spring.mail.password with your own active credentials.", 
                    e
                );
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Email delivery failed: " + e.getMessage(), e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("emailSent", emailSent);
        
        return response;
    }
   
    @Autowired
    private com.hrms.repository.RecruitmentRepository recruitmentRepository;

    @PostMapping("/verify")
    public Recruitment verify(@RequestBody Recruitment req) {
        String email = req.getEmail();
        String enteredOtp = req.getPassword();

        if (email == null || enteredOtp == null || email.trim().isEmpty() || enteredOtp.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and OTP are required");
        }

        OTPStore.OTPData otpData = OTPStore.otpMap.get(email);

        if (otpData == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired. Please request a new OTP.");
        }

        if (otpData.isExpired()) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired. Please request a new OTP.");
        }

        if (otpData.getFailedAttempts() >= 5) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "❌ Too many failed attempts. Please request a new OTP.");
        }

        if (otpData.getOtp().equals(enteredOtp.trim())) {
            OTPStore.otpMap.remove(email);
            
            java.util.Optional<Recruitment> rOpt = recruitmentRepository.findByEmail(email);
            Recruitment r;
            if (rOpt.isPresent()) {
                r = rOpt.get();
            } else {
                r = new Recruitment();
                r.setEmail(email);
                r.setCandidateName("Candidate");
            }
            r.setToken(com.hrms.util.JwtHelper.generateToken(r.getEmail(), "CANDIDATE"));
            return r;
        }

        otpData.incrementFailedAttempts();
        if (otpData.getFailedAttempts() >= 5) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "❌ Too many failed attempts. Please request a new OTP.");
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "❌ Invalid OTP. Please enter the correct OTP.");
    }

    @PostMapping("/send-generic")
    public Map<String, Object> sendGenericOtp(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required");
        }
        String otp = emailService.generateOtp();
        long expiryTimeMs = System.currentTimeMillis() + 2 * 60 * 1000; // 2 minutes
        OTPStore.otpMap.put(email, new OTPStore.OTPData(otp, expiryTimeMs));

        emailService.sendEmail(email, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        return response;
    }

    @PostMapping("/verify-generic")
    public Map<String, Object> verifyGenericOtp(@RequestParam String email, @RequestParam String otp) {
        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and OTP are required");
        }
        
        OTPStore.OTPData otpData = OTPStore.otpMap.get(email);

        if (otpData == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired. Please request a new OTP.");
        }

        if (otpData.isExpired()) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired. Please request a new OTP.");
        }

        if (otpData.getFailedAttempts() >= 5) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "❌ Too many failed attempts. Please request a new OTP.");
        }

        if (otpData.getOtp().equals(otp.trim())) {
            OTPStore.otpMap.remove(email);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            return response;
        }

        otpData.incrementFailedAttempts();
        if (otpData.getFailedAttempts() >= 5) {
            OTPStore.otpMap.remove(email);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "❌ Too many failed attempts. Please request a new OTP.");
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "❌ Invalid OTP. Please enter the correct OTP.");
    }
}