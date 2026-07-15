package com.hrms.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class DateValidator {
    
    public static void validateNotPastDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return;
        }
        try {
            LocalDate today = LocalDate.now();
            LocalDate parsedDate = null;
            String clean = dateStr.trim();
            
            if (clean.matches("\\d{4}-\\d{2}-\\d{2}")) {
                parsedDate = LocalDate.parse(clean);
            } else if (clean.matches("\\d{1,2} [a-zA-Z]+ \\d{4}")) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);
                parsedDate = LocalDate.parse(clean, formatter);
            } else if (clean.contains("T")) {
                parsedDate = LocalDateTime.parse(clean).toLocalDate();
            } else {
                parsedDate = LocalDate.parse(clean);
            }
            
            if (parsedDate != null && parsedDate.isBefore(today)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Past dates are not allowed.");
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            // Ignore non-date strings or unparseable text
        }
    }
}
