import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HrmsContext } from "../context/HrmsContext";
import { AuthContext } from "../context/AuthContext";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification
} from "../services/ApiService";

/* ================= NAV SVG ICONS ================= */

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" fill="currentColor" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" fill="currentColor" />
  </svg>
);

const getNotifDetails = (message) => {
  const msgLower = message.toLowerCase();
  let title = "🔔 System Update";
  let icon = "📢";
  let badgeClass = "badge-info";
  
  if (msgLower.includes("leave")) {
    title = msgLower.includes("approve") ? "🔔 Leave Request Approved" : msgLower.includes("reject") ? "🔔 Leave Request Rejected" : "🔔 Leave Request Update";
    icon = "🌴";
    badgeClass = "badge-warning";
  } else if (msgLower.includes("interview")) {
    title = "🔔 Interview Scheduled";
    icon = "📅";
    badgeClass = "badge-primary";
  } else if (msgLower.includes("candidate") || msgLower.includes("application")) {
    title = "🔔 New Candidate Application";
    icon = "🎯";
    badgeClass = "badge-success";
  } else if (msgLower.includes("payroll") || msgLower.includes("salary")) {
    title = "🔔 Payroll Audit Alert";
    icon = "💰";
    badgeClass = "badge-success";
  }
  
  return { title, icon, badgeClass };
};

function Navbar() {
  const { theme, toggleTheme, isAiOpen, setIsAiOpen } = useContext(HrmsContext);
  const { currentUser, role, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const username = currentUser?.name || "HR Manager";
  const employeeId = currentUser?.employeeId || "";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length > 1 && parts[1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
  };

  // Notifications DB states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await getNotifications(role, currentUser.id);
      if (res.data) {
        setNotifications(res.data);
      }
      const countRes = await getUnreadNotificationCount(role, currentUser.id);
      setUnreadCount(countRes.data || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      await markAllNotificationsAsRead(role, currentUser.id);
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div style={styles.navbar}>
      {/* Spacer where the search bar used to be */}
      <div style={{ flex: 1 }} />

      {/* Right Controls Container */}
      <div style={styles.controls}>
        {/* AI Assistant Button (Only for Employee and Candidate) */}
        {role !== "HR" && role !== "ADMIN" && (
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="navbar-icon-btn navbar-ai-btn"
            title="Toggle AI Assistant"
          >
            <SparkIcon />
            <span style={styles.pulseDot}></span>
          </button>
        )}

        {/* Sliding Pill Theme Switcher */}
        <div 
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            background: theme === "dark" ? "#1e293b" : "#e2e8f0",
            padding: "4px",
            borderRadius: "30px",
            width: "60px",
            position: "relative",
            cursor: "pointer",
            border: "1px solid " + (theme === "dark" ? "#334155" : "#cbd5e1"),
            userSelect: "none",
            marginRight: "10px",
            transition: "all 0.3s ease"
          }}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {/* Sliding indicator */}
          <div 
            style={{
              position: "absolute",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "var(--accent-primary)",
              left: theme === "dark" ? "30px" : "4px",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          />
          <span style={{ zIndex: 1, fontSize: "12px", marginLeft: "6px", opacity: theme === "light" ? 1 : 0.6 }}>☀️</span>
          <span style={{ zIndex: 1, fontSize: "12px", marginLeft: "10px", opacity: theme === "dark" ? 1 : 0.6 }}>🌙</span>
        </div>

        {/* Notifications Dropdown Toggle */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="navbar-icon-btn navbar-bell-btn"
            title="Notifications"
          >
            <span style={{ fontSize: "18px" }}>🔔</span>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div style={styles.notificationBox} className="glass-card animate-fade-in">
              <div style={styles.notificationHeader}>
                <h4>Notifications</h4>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {unreadCount > 0 && <span style={styles.notificationCount}>{unreadCount} new</span>}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }} 
                    style={{ background: "transparent", border: "none", color: "var(--accent-primary)", fontSize: "11px", fontWeight: "700", cursor: "pointer", padding: 0 }}
                  >
                    Mark All Read
                  </button>
                </div>
              </div>

              <div style={styles.notificationScroll}>
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const isNotifRead = n.read || n.isRead;
                    const { title, icon, badgeClass } = getNotifDetails(n.message);

                    return (
                      <div
                        key={n.id}
                        style={{
                          ...styles.notificationItem,
                          opacity: isNotifRead ? 0.8 : 1,
                          background: isNotifRead ? "transparent" : "rgba(37, 99, 235, 0.06)",
                          borderLeft: isNotifRead ? "3px solid transparent" : "3px solid var(--accent-primary)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={styles.notificationIconCircle} className={badgeClass}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ 
                            ...styles.notificationTitle, 
                            fontWeight: isNotifRead ? "600" : "800",
                            fontSize: "12.5px"
                          }}>
                            {title}
                          </span>
                          <p style={{ ...styles.notificationDetail, color: "var(--text-secondary)", marginTop: "2px" }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date(n.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "8px", justifyContent: "center" }}>
                          {!isNotifRead && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                              style={{ background: "transparent", border: "none", color: "#10B981", cursor: "pointer", fontSize: "13px", padding: 0 }}
                              title="Mark as Read"
                            >
                              ✓
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                            style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "13px", padding: 0 }}
                            title="Delete Notification"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={styles.emptyNotification}>
                    <span style={{ fontSize: "28px" }}>🔔</span>
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider line in controls */}
        <div style={styles.divider}></div>

        {/* User Profile Badge & Dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="navbar-profile-badge animate-fade-in"
          >
            <div style={styles.avatar}>
              {getInitials(username)}
            </div>
            <div className="profile-badge-text-block" style={styles.profileBadgeText}>
              <span style={styles.profileBadgeName}>{username}</span>
              <span style={styles.profileBadgeRole}>{role}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", color: "var(--text-secondary)" }}><polyline points="6 9 12 15 18 9" /></svg>
          </div>

          {showProfileDropdown && (
            <div style={styles.profileDropdown} className="glass-card animate-fade-in">
              <div style={styles.profileHeader}>
                <div style={styles.avatarLarge}>
                  {getInitials(username)}
                </div>
                <div style={styles.profileHeaderDetails}>
                  <h4 style={styles.profileName}>{username}</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ID: {employeeId}</span>
                  <span style={styles.profileRole}>{role}</span>
                </div>
              </div>
              <div style={styles.profileDivider}></div>
              
              <Link to="/profile" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </Link>
              
              <Link to="/settings" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                Settings
              </Link>

              <div className="profile-dropdown-item" onClick={() => { setShowNotifications(true); setShowProfileDropdown(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                Notifications
              </div>

              <Link to="/change-password" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Change Password
              </Link>

              <div className="profile-dropdown-item logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 30px",
    background: "var(--bg-panel)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
    position: "sticky",
    top: 0,
    zIndex: 999,
  },

  searchContainer: {
    flex: 1,
    maxWidth: "380px",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "var(--bg-app)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "8px 14px",
    color: "var(--text-secondary)",
  },

  searchInput: {
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    padding: 0,
    fontSize: "14px",
    outline: "none",
    width: "100%",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  divider: {
    width: "1px",
    height: "24px",
    background: "var(--border-color)",
    margin: "0 4px",
  },

  iconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    position: "relative",
  },

  pulseDot: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--accent-primary)",
    animation: "pulse 2s infinite",
  },

  badge: {
    position: "absolute",
    top: "6px",
    right: "6px",
    background: "var(--accent-danger)",
    color: "white",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "800",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.2)",
    flexShrink: 0,
  },

  profileBadgeText: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },

  profileBadgeName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    lineHeight: "1.2",
  },

  profileBadgeRole: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "500",
    marginTop: "2px",
  },

  notificationBox: {
    position: "absolute",
    right: 0,
    top: "52px",
    width: "320px",
    background: "var(--bg-panel)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-lg)",
    maxHeight: "380px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid var(--border-color)",
  },

  notificationCount: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--accent-primary)",
    background: "rgba(59, 130, 246, 0.1)",
    padding: "3px 8px",
    borderRadius: "12px",
  },

  notificationScroll: {
    overflowY: "auto",
    padding: "8px",
  },

  notificationItem: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginBottom: "4px",
  },

  notificationIconCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  notificationTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    display: "block",
  },

  notificationDetail: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginTop: "2px",
    lineHeight: "1.4",
  },

  emptyNotification: {
    textAlign: "center",
    padding: "30px 20px",
    color: "var(--text-secondary)",
  },

  profileDropdown: {
    position: "absolute",
    right: 0,
    top: "52px",
    width: "250px",
    background: "var(--bg-panel)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-lg)",
    padding: "12px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "8px",
  },

  avatarLarge: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },

  profileHeaderDetails: {
    display: "flex",
    flexDirection: "column",
  },

  profileName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },

  profileRole: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "500",
    marginTop: "2px",
  },

  profileDivider: {
    height: "1px",
    background: "var(--border-color)",
    margin: "8px 0",
  },
};

export default Navbar;