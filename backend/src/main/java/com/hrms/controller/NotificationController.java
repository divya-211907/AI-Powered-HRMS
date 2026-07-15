package com.hrms.controller;

import com.hrms.model.Notification;
import com.hrms.model.CandidateStatus;
import com.hrms.service.NotificationService;
import com.hrms.repository.CandidateStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CandidateStatusRepository statusRepository;

    @PostMapping("/add")
    public Notification addNotification(@RequestBody Notification notification) {
        return notificationService.addNotification(notification);
    }

    @GetMapping("/all")
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email) {
        if (role != null && userId != null) {
            return notificationService.fetchNotifications(role, userId);
        } else if (email != null) {
            return notificationService.getNotificationsByReceiver(email);
        }
        return notificationService.getAllNotifications();
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email) {
        if (role != null && userId != null) {
            return notificationService.countUnread(role, userId);
        } else if (email != null) {
            return notificationService.getNotificationsByReceiver(email).stream()
                    .filter(n -> !n.isRead())
                    .count();
        }
        return 0;
    }

    @PutMapping("/read-all")
    public String readAll(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email) {
        if (role != null && userId != null) {
            notificationService.markAllRead(role, userId);
        } else if (email != null) {
            List<Notification> list = notificationService.getNotificationsByReceiver(email);
            for (Notification n : list) {
                n.setRead(true);
                notificationService.addNotification(n);
            }
        }
        return "All marked read";
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        List<Notification> all = notificationService.getAllNotifications();
        for (Notification n : all) {
            if (n.getId().equals(id)) {
                n.setRead(true);
                return notificationService.addNotification(n);
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return "Notification deleted";
    }

    @GetMapping("/history")
    public List<CandidateStatus> getStatusHistory(@RequestParam String email) {
        return statusRepository.findByEmailOrderByUpdatedAtDesc(email);
    }
}