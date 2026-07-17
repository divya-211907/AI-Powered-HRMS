package com.hrms.controller;

import com.hrms.model.Notification;
import com.hrms.model.CandidateStatus;
import com.hrms.service.NotificationService;
import com.hrms.repository.CandidateStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CandidateStatusRepository statusRepository;

    @Autowired
    private com.hrms.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.hrms.repository.HrUserRepository hrUserRepository;

    @Autowired
    private com.hrms.repository.RecruitmentRepository recruitmentRepository;

    private UserDetails resolveUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            io.jsonwebtoken.Claims claims = com.hrms.util.JwtHelper.parseToken(token);
            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            
            Long id = null;
            if ("HR".equalsIgnoreCase(role)) {
                java.util.Optional<com.hrms.model.HrUser> hrOpt = hrUserRepository.findByEmail(email);
                if (hrOpt.isPresent()) {
                    id = hrOpt.get().getId();
                }
            } else if ("EMPLOYEE".equalsIgnoreCase(role)) {
                java.util.List<com.hrms.model.Employee> emps = employeeRepository.findAllByEmail(email);
                if (!emps.isEmpty()) {
                    id = emps.get(0).getId();
                }
            } else if ("CANDIDATE".equalsIgnoreCase(role)) {
                java.util.Optional<com.hrms.model.Recruitment> candOpt = recruitmentRepository.findByEmail(email);
                if (candOpt.isPresent()) {
                    id = candOpt.get().getId();
                }
            } else if ("ADMIN".equalsIgnoreCase(role)) {
                id = 1L; // default Admin ID
            }
            
            if (id == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found in system");
            }
            
            return new UserDetails(id, role, email);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token", e);
        }
    }

    private void validateOwnership(Notification n, UserDetails user) {
        boolean isOwner = false;
        if (n.getRecipientRole() != null && n.getRecipientRole().equalsIgnoreCase(user.getRole())) {
            if (n.getRecipientId() == null || n.getRecipientId().equals(user.getId())) {
                isOwner = true;
            }
        }
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You do not own this notification");
        }
    }

    @PostMapping("/add")
    public Notification addNotification(@RequestBody Notification notification) {
        return notificationService.addNotification(notification);
    }

    @GetMapping("/my")
    public List<Notification> getMyNotifications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserDetails user = resolveUserFromToken(authHeader);
        return notificationService.fetchNotifications(user.getRole(), user.getId());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserDetails user = resolveUserFromToken(authHeader);
        return notificationService.countUnread(user.getRole(), user.getId());
    }

    @PutMapping("/read-all")
    public String readAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserDetails user = resolveUserFromToken(authHeader);
        notificationService.markAllRead(user.getRole(), user.getId());
        return "All marked read";
    }

    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserDetails user = resolveUserFromToken(authHeader);
        Notification n = notificationService.getAllNotifications().stream()
                .filter(notif -> notif.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        validateOwnership(n, user);
        n.setRead(true);
        return notificationService.addNotification(n);
    }

    @PutMapping("/{id}/read")
    public Notification markAsReadLegacy(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return markAsRead(id, authHeader);
    }

    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserDetails user = resolveUserFromToken(authHeader);
        Notification n = notificationService.getAllNotifications().stream()
                .filter(notif -> notif.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        validateOwnership(n, user);
        notificationService.deleteNotification(id);
        return "Notification deleted";
    }

    @GetMapping("/history")
    public List<CandidateStatus> getStatusHistory(@RequestParam String email) {
        return statusRepository.findByEmailOrderByUpdatedAtDesc(email);
    }

    private static class UserDetails {
        private final Long id;
        private final String role;
        private final String email;
        
        public UserDetails(Long id, String role, String email) {
            this.id = id;
            this.role = role;
            this.email = email;
        }
        
        public Long getId() { return id; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
    }
}