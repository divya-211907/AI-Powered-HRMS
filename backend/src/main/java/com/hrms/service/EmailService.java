package com.hrms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.util.Random;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("hrms62000@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("HTML MAIL SENT SUCCESSFULLY TO: " + to);
        } catch (Exception e) {
            System.err.println("HTML MAIL SENDING FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getHtmlTemplate(String title, String gradientHeader, String contentBody, String actionButtonText, String actionButtonUrl) {
        String buttonHtml = "";
        if (actionButtonText != null && !actionButtonText.isEmpty()) {
            buttonHtml = "<div style='text-align: center; margin-top: 30px;'>" +
                    "<a href='" + actionButtonUrl + "' style='background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); transition: all 0.2s;'>" + actionButtonText + "</a>" +
                    "</div>";
        }
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='utf-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <style>" +
                "    body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 0; }" +
                "    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }" +
                "    .header { background: " + gradientHeader + "; padding: 40px 30px; text-align: center; color: #ffffff; }" +
                "    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                "    .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; }" +
                "    .footer { background-color: #f9fafb; padding: 20px 35px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; }" +
                "    .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }" +
                "    .badge-primary { background-color: #dbeafe; color: #1e40af; }" +
                "    .badge-success { background-color: #dcfce7; color: #166534; }" +
                "    .badge-danger { background-color: #fee2e2; color: #991b1b; }" +
                "    .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #f3f4f6; }" +
                "    .info-table td { padding: 14px 20px; border-bottom: 1px solid #f3f4f6; }" +
                "    .info-table td.label { font-weight: 600; color: #4b5563; width: 35%; }" +
                "    .info-table td.value { color: #111827; font-weight: 700; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>" + title + "</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      " + contentBody + "" +
                "      " + buttonHtml + "" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <p>&copy; 2026 HRMS Portal. All rights reserved.</p>" +
                "      <p>This is an automated notification. Please do not reply directly to this email.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    public void sendEmail(String email, String otp) {
        String body = "<p>Your verification code is:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <span style='font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 4px; border: 2px dashed #3b82f6; padding: 10px 25px; border-radius: 8px; background-color: #eff6ff;'>" + otp + "</span>" +
                "</div>" +
                "<p>This OTP is valid for 2 minutes only.</p>" +
                "<p>Do not share this code with anyone.</p>";
        String html = getHtmlTemplate("OTP Verification", "linear-gradient(135deg, #1e3a8a, #3b82f6)", body, null, null);
        sendHtmlEmail(email, "HRMS OTP Verification", html);
    }

    public void sendRecruitmentStatusMail(String email, String status) {
        sendRecruitmentStatusMail(email, status, null, null);
    }

    public void sendRecruitmentStatusMail(String email, String status, String remarks, String interviewDetails) {
        String title = "Application Update";
        String gradient = "linear-gradient(135deg, #1e3a8a, #3b82f6)";
        String badgeClass = "badge-primary";
        String statusText = status != null ? status : "Under Review";
        
        String explanation = "<p>Your application is currently under review by our recruitment team.</p>";
        
        if ("Shortlisted".equalsIgnoreCase(status)) {
            title = "Congratulations! Shortlisted";
            badgeClass = "badge-success";
            explanation = "<p>We are pleased to inform you that your profile has been shortlisted for the next stage of our interview process. We will reach out shortly with further details.</p>";
        } else if ("Interview Scheduled".equalsIgnoreCase(status)) {
            title = "Interview Scheduled";
            badgeClass = "badge-primary";
            explanation = "<p>Your interview has been scheduled successfully. Please find the details below:</p>" +
                    "<pre style='background-color:#f3f4f6; padding:15px; border-radius:6px; font-family:inherit; white-space:pre-wrap;'>" + (interviewDetails != null ? interviewDetails : "Details to follow.") + "</pre>";
        } else if ("Selected".equalsIgnoreCase(status) || "Hired".equalsIgnoreCase(status)) {
            title = "Congratulations! Selected";
            gradient = "linear-gradient(135deg, #15803d, #22c55e)";
            badgeClass = "badge-success";
            explanation = "<p>We are absolutely thrilled to extend our job offer to you! You have been selected for the position. Welcome aboard!</p>";
        } else if ("Rejected".equalsIgnoreCase(status)) {
            title = "Application Update";
            gradient = "linear-gradient(135deg, #991b1b, #ef4444)";
            badgeClass = "badge-danger";
            explanation = "<p>Thank you for your interest in joining our team. After careful review, we regret to inform you that we will not be moving forward with your application at this stage.</p>";
        }

        String safeRemarks = (remarks != null && !remarks.trim().isEmpty()) ? remarks : "";
        String remarksHtml = "";
        if (!safeRemarks.isEmpty()) {
            remarksHtml = "<div style='margin-top:20px; border-left:4px solid #3b82f6; padding-left:15px; color:#4b5563; font-style:italic;'>HR Remarks: \"" + safeRemarks + "\"</div>";
        }

        String body = "<div class='badge " + badgeClass + "'>" + statusText + "</div>" + explanation + remarksHtml;
        String html = getHtmlTemplate(title, gradient, body, "View Portal", "http://localhost:3000/candidate-login");
        sendHtmlEmail(email, title, html);
    }

    public void sendInterviewScheduledMail(String email, String date, String time, String type, String meetingLink) {
        String body = "<p>Congratulations! You have been shortlisted, and your interview is scheduled.</p>" +
                "<table class='info-table'>" +
                "  <tr><td class='label'>Date</td><td class='value'>" + date + "</td></tr>" +
                "  <tr><td class='label'>Time</td><td class='value'>" + time + "</td></tr>" +
                "  <tr><td class='label'>Type</td><td class='value'>" + type + "</td></tr>" +
                "  <tr><td class='label'>Meeting Link</td><td class='value'><a href='" + meetingLink + "' target='_blank'>" + (meetingLink != null ? meetingLink : "Join Meet") + "</a></td></tr>" +
                "</table>" +
                "<p style='color:#ef4444; font-weight:600;'>Please ensure you are available 10 minutes prior to the scheduled time.</p>";
        String html = getHtmlTemplate("Interview Scheduled", "linear-gradient(135deg, #1e3a8a, #3b82f6)", body, "Launch Meeting", meetingLink);
        sendHtmlEmail(email, "Interview Scheduled Details", html);
    }

    public void sendSelectionMail(String email, String candidateName, String jobRole, String employeeId, String username, String tempPassword) {
        String body = "<p>Dear " + candidateName + ",</p>" +
                "<p>We are delighted to welcome you to the company! You have been selected for the position of <strong>" + jobRole + "</strong>.</p>" +
                "<p>Your official corporate employee account has been provisioned successfully. Below are your login credentials:</p>" +
                "<table class='info-table'>" +
                "  <tr><td class='label'>Employee ID</td><td class='value'>" + employeeId + "</td></tr>" +
                "  <tr><td class='label'>Username</td><td class='value'>" + username + "</td></tr>" +
                "  <tr><td class='label'>Temporary Password</td><td class='value' style='color:#ef4444; font-family:monospace;'>" + tempPassword + "</td></tr>" +
                "</table>" +
                "<p>Please change your password immediately after logging in for safety.</p>";
        String html = getHtmlTemplate("Welcome Aboard!", "linear-gradient(135deg, #15803d, #22c55e)", body, "Log In to Employee Portal", "http://localhost:3000/login");
        sendHtmlEmail(email, "Welcome to the Company - Selection & Credentials", html);
    }

    public void sendLeaveStatusMail(String email, String status) {
        String title = "Leave Request Status";
        String gradient = "linear-gradient(135deg, #1e3a8a, #3b82f6)";
        String explanation = "";
        String badgeClass = "badge-primary";

        if ("APPROVED".equalsIgnoreCase(status)) {
            title = "Leave Request Approved";
            gradient = "linear-gradient(135deg, #15803d, #22c55e)";
            badgeClass = "badge-success";
            explanation = "<p>Dear Employee,</p><p>We are pleased to inform you that your leave request has been reviewed and officially <strong>APPROVED</strong> by the management.</p>";
        } else {
            title = "Leave Request Declined";
            gradient = "linear-gradient(135deg, #991b1b, #ef4444)";
            badgeClass = "badge-danger";
            explanation = "<p>Dear Employee,</p><p>We regret to inform you that your leave request has been reviewed and <strong>DECLINED</strong> at this time due to operational requirements.</p>";
        }

        String body = "<div class='badge " + badgeClass + "'>" + status + "</div>" + explanation;
        String html = getHtmlTemplate(title, gradient, body, "View Portal", "http://localhost:3000/login");
        sendHtmlEmail(email, title, html);
    }

    public void sendLoginCredentials(String to, String username, String password) {
        String body = "<p>Welcome to our Company HRMS Portal.</p>" +
                "<p>Your employee credentials have been generated below:</p>" +
                "<table class='info-table'>" +
                "  <tr><td class='label'>Username</td><td class='value'>" + username + "</td></tr>" +
                "  <tr><td class='label'>Password</td><td class='value' style='font-family:monospace;'>" + password + "</td></tr>" +
                "</table>" +
                "<p>For safety, please revise your password on first login.</p>";
        String html = getHtmlTemplate("HRMS Access Credentials", "linear-gradient(135deg, #1e3a8a, #3b82f6)", body, "Access HRMS", "http://localhost:3000/login");
        sendHtmlEmail(to, "HRMS Access Credentials", html);
    }

    public void sendEmployeeCredentials(String email, String name, String employeeId, String username, String generatedPassword) {
        String body = "<p>Hello " + name + ",</p>" +
                "<p>Your employee account has been created successfully.</p>" +
                "<p><strong>Login Credentials:</strong></p>" +
                "<table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>" +
                "  <tr><td style='padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;'>Employee ID</td><td style='padding: 8px; border: 1px solid #e2e8f0;'>" + employeeId + "</td></tr>" +
                "  <tr><td style='padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;'>Username</td><td style='padding: 8px; border: 1px solid #e2e8f0;'>" + username + "</td></tr>" +
                "  <tr><td style='padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;'>Temporary Password</td><td style='padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;'>" + generatedPassword + "</td></tr>" +
                "</table>" +
                "<p><strong>Important:</strong><br/>You must change your password during your first login.</p>" +
                "<p><strong>Login URL:</strong><br/><a href='http://localhost:3000/login'>http://localhost:3000/login</a></p>" +
                "<p>Regards,<br/>HR Team</p>";
        String html = getHtmlTemplate("Welcome to NextGen HRMS", "linear-gradient(135deg, #4f46e5, #06b6d4)", body, "Login to Portal", "http://localhost:3000/login");
        sendHtmlEmail(email, "Welcome to NextGen HRMS", html);
    }

    public void sendWorkflowMail(String toEmail, String subject, String bodyText) {
        String body = "<p>" + bodyText + "</p>";
        String html = getHtmlTemplate(subject, "linear-gradient(135deg, #1e3a8a, #3b82f6)", body, "Open Portal", "http://localhost:3000/login");
        sendHtmlEmail(toEmail, subject, html);
    }

    public void sendIncrementMail(String email, String employeeName, double oldSalary, double incrementPct, double newSalary) {
        String body = "<p>Dear " + employeeName + ",</p>" +
                "<p>Congratulations! Based on your performance review, we are pleased to notify you that your salary has been revised.</p>" +
                "<table class='info-table'>" +
                "  <tr><td class='label'>Increment</td><td class='value' style='color:#166534;'>" + String.format("%.1f", incrementPct) + "%</td></tr>" +
                "  <tr><td class='label'>Old Salary</td><td class='value'>₹" + String.format("%,.2f", oldSalary) + "</td></tr>" +
                "  <tr><td class='label'>New Revised Salary</td><td class='value' style='color:#2563eb;'>₹" + String.format("%,.2f", newSalary) + "</td></tr>" +
                "</table>" +
                "<p>Thank you for your dedicated service and outstanding contribution to our company.</p>";
        String html = getHtmlTemplate("Congratulations! Salary Revised", "linear-gradient(135deg, #15803d, #22c55e)", body, "View Increment Letter", "http://localhost:3000/login");
        sendHtmlEmail(email, "Revised Salary and Appraisal Notification", html);
    }
}
