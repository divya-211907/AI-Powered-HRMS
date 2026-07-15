import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { HrmsContext } from "../context/HrmsContext";
import { AuthContext } from "../context/AuthContext";

/* ================= MODERN HIGH-CONTRAST SVG ICONS ================= */
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
);
const EmployeesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const LeaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const PermissionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const DepartmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const PayrollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
);
const AttendanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const PerformanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const RecruitmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);


const CollapseIcon = ({ collapsed }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

function Sidebar() {
  const { currentUser, role, logout } = useContext(AuthContext);
  const location = useLocation();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useContext(HrmsContext);
 
  const username = currentUser?.name || "HR Manager";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length > 1 && parts[1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Define sidebar links dynamically
  const hrLinks = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/employees", label: "Employees", icon: <EmployeesIcon /> },
    { path: "/attendance", label: "Attendance", icon: <AttendanceIcon /> },
    { path: "/leave", label: "Leave", icon: <LeaveIcon /> },
    { path: "/payroll", label: "Payroll", icon: <PayrollIcon /> },
    { path: "/performance", label: "Performance", icon: <PerformanceIcon /> },

    { path: "/departments", label: "Departments", icon: <DepartmentIcon /> },
    { path: "/hr-permission", label: "Permissions", icon: <PermissionIcon /> },
    { path: "/recruitment", label: "Recruitment", icon: <RecruitmentIcon /> },
    { path: "/reports", label: "Reports", icon: <ReportsIcon /> },
  ];

  const employeeLinks = [
    { path: "/employee-dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/profile", label: "My Profile", icon: <ProfileIcon /> },
    { path: "/employee-attendance", label: "My Attendance", icon: <AttendanceIcon /> },
    { path: "/employee-leave", label: "Apply Leave", icon: <LeaveIcon /> },
    { path: "/employee-permission", label: "Permissions", icon: <PermissionIcon /> },
    { path: "/employee-payroll", label: "My Payroll", icon: <PayrollIcon /> },
    { path: "/employee-performance", label: "My Performance", icon: <PerformanceIcon /> },
  ];

  const candidateLinks = [
    { path: "/candidate-dashboard", label: "Application Form", icon: <RecruitmentIcon /> },
    { path: "/profile", label: "Candidate Profile", icon: <ProfileIcon /> },
  ];

  const currentLinks = role === "HR" ? hrLinks : role === "EMPLOYEE" ? employeeLinks : candidateLinks;

  return (
    <div style={{
      ...styles.sidebar,
      width: isSidebarCollapsed ? "80px" : "270px",
    }}>
      {/* Sidebar Header / Logo */}
      <div style={{
        ...styles.logoSection,
        padding: isSidebarCollapsed ? "20px 10px" : "25px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}>
          <div style={styles.logoCircle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          {!isSidebarCollapsed && (
            <div style={styles.logoText}>
              <h2 style={{ ...styles.title, fontSize: "13px" }}>🏢 NextGen HRMS Account</h2>
              <span style={styles.subtitle}>HRMS Platform</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Handle */}
      <button onClick={toggleSidebar} style={{
        ...styles.collapseBtn,
        right: isSidebarCollapsed ? "26px" : "15px",
        top: "28px",
      }} title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        <CollapseIcon collapsed={isSidebarCollapsed} />
      </button>

      {/* Menu Links */}
      <div style={{
        ...styles.menu,
        padding: isSidebarCollapsed ? "15px 8px" : "15px 15px",
      }}>
        {currentLinks.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path.startsWith("#") ? location.pathname : item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              style={{
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                gap: isSidebarCollapsed ? "0px" : "12px",
              }}
              title={item.label}
            >
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Card at Bottom */}
      <div style={{
        ...styles.userSection,
        padding: isSidebarCollapsed ? "15px 5px" : "20px 15px",
        justifyContent: isSidebarCollapsed ? "center" : "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.avatar}>
            {getInitials(username)}
          </div>
          {!isSidebarCollapsed && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{username}</span>
              <span style={styles.userRole}>{role}</span>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button onClick={handleLogout} style={styles.logoutIconButton} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8" }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "#1E293B", /* Dark Navy */
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 30px rgba(0,0,0,0.12)",
    overflowY: "hidden",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    borderRight: "1px solid #334155",
  },

  logoSection: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "padding 0.3s ease",
  },

  logoCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #4F46E5, #818cf8)", /* Indigo */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
    flexShrink: 0,
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "500",
  },

  collapseBtn: {
    position: "absolute",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#94a3b8",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
    overflowY: "auto",
    transition: "padding 0.3s ease",
  },

  userSection: {
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    background: "rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    transition: "padding 0.3s ease",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4F46E5, #818cf8)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 2px 10px rgba(79, 70, 229, 0.2)",
    flexShrink: 0,
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
  },

  userName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#ffffff",
  },

  userRole: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },

  logoutIconButton: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
};

export default Sidebar;