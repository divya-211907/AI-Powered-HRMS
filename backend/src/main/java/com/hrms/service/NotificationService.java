package com.hrms.service;

import com.hrms.model.Notification;
import com.hrms.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    @Autowired
    private EmailService emailService;

    public Notification addNotification(Notification notification) {
        boolean isNew = (notification.getId() == null);
        Notification saved = repo.save(notification);
        
        if (isNew && saved.getEmail() != null && !saved.getEmail().isEmpty()) {
            try {
                String subject = saved.getTitle() != null ? saved.getTitle() : "New Notification";
                String messageText = saved.getMessage() != null ? saved.getMessage() : "";
                emailService.sendWorkflowMail(saved.getEmail(), subject, messageText);
                System.out.println("Email notification sent to: " + saved.getEmail());
            } catch (Exception ex) {
                System.err.println("Failed to send email notification to: " + saved.getEmail() + " - " + ex.getMessage());
            }
        }
        return saved;
    }

    public List<Notification> getAllNotifications() {
        return repo.findAll();
    }

    public List<Notification> getNotificationsByReceiver(String receiver) {
        return repo.findAll().stream()
                .filter(n -> receiver.equalsIgnoreCase(n.getEmail()) || receiver.equalsIgnoreCase(n.getRole()))
                .toList();
    }

    public List<Notification> fetchNotifications(String role, Long userId) {
        return repo.fetchNotificationsForUser(role, userId);
    }

    public long countUnread(String role, Long userId) {
        return repo.countUnreadNotificationsForUser(role, userId);
    }

    public void markAllRead(String role, Long userId) {
        List<Notification> all = repo.fetchNotificationsForUser(role, userId);
        for (Notification n : all) {
            if (!n.isRead()) {
                n.setRead(true);
                repo.save(n);
            }
        }
    }

    public void deleteNotification(Long id) {
        repo.deleteById(id);
    }
}