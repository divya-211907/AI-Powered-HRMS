package com.hrms.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class SecurityHelper {
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public static String encode(String rawPassword) {
        if (rawPassword == null) return null;
        return encoder.encode(rawPassword);
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) return false;
        
        // 1. Try standard BCrypt verification
        try {
            if (encoder.matches(rawPassword, encodedPassword)) {
                return true;
            }
        } catch (Exception ignored) {}

        // 2. Fallback to raw text matching
        if (rawPassword.equals(encodedPassword)) {
            return true;
        }

        // 3. Fallback to Base64 decoded matching
        try {
            String decoded = new String(java.util.Base64.getDecoder().decode(encodedPassword));
            if (rawPassword.equals(decoded)) {
                return true;
            }
        } catch (Exception ignored) {}

        return false;
    }
}
