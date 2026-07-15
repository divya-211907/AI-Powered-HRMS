package com.hrms.otp;

import java.util.HashMap;
import java.util.Map;

public class OTPStore {

    public static class OTPData {
        private final String otp;
        private final long expiryTimeMs;
        private int failedAttempts = 0;

        public OTPData(String otp, long expiryTimeMs) {
            this.otp = otp;
            this.expiryTimeMs = expiryTimeMs;
        }

        public String getOtp() {
            return otp;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expiryTimeMs;
        }

        public int getFailedAttempts() {
            return failedAttempts;
        }

        public void incrementFailedAttempts() {
            this.failedAttempts++;
        }
    }

    public static Map<String, OTPData> otpMap = new HashMap<>();

}