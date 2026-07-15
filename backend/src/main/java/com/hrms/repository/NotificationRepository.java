package com.hrms.repository;

import com.hrms.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.role = :role OR n.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> fetchNotificationsForUser(@Param("role") String role, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.role = :role OR n.userId = :userId) AND n.isRead = false")
    long countUnreadNotificationsForUser(@Param("role") String role, @Param("userId") Long userId);
}
