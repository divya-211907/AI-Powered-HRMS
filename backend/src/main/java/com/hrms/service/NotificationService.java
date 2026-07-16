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

    public Notification addNotification(Notification notification) {
        return repo.save(notification);
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