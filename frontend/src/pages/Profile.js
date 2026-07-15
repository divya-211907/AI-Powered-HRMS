import React, { useEffect, useState, useContext } from "react";
import { getPayrolls, getPerformances, getRecruitmentByEmail, updateHrProfile } from "../services/ApiService";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { currentUser, role, updateCurrentUser } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [performance, setPerformance] = useState(null);

  // HR Shift config states
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");

  useEffect(() => {
    const user = currentUser;

    if (!user) return;

    if (role === "CANDIDATE") {
      const fetchLatestCandidate = async () => {
        try {
          const res = await getRecruitmentByEmail(user.email);
          if (res.data) {
            setEmployee(res.data);
          } else {
            setEmployee(user);
          }
        } catch (err) {
          console.error(err);
          setEmployee(user);
        }
      };
      fetchLatestCandidate();
    } else {
      setEmployee(user);
      loadData(user);
      if (role === "HR") {
        setShiftStart(user.shiftStart || "09:00");
        setShiftEnd(user.shiftEnd || "17:00");
      }
    }
  }, [role]);

  const handleSaveHrSettings = async () => {
    try {
      const user = currentUser;
      const updated = {
        ...user,
        shiftStart,
        shiftEnd
      };

      const res = await updateHrProfile(updated);
      if (res.data) {
        updateCurrentUser(res.data);
        setEmployee(res.data);
      } else {
        updateCurrentUser(updated);
        setEmployee(updated);
      }
      alert("✅ Shift timings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save shift timings.");
    }
  };

  const loadData = async (user) => {
    try {
      const payrollRes = await getPayrolls();
      const pay = payrollRes.data.find(
        (p) => String(p.employeeId) === String(user.id)
      );
      setSalary(pay || null);

      const perfRes = await getPerformances();
      const perf = perfRes.data.find(
        (p) => String(p.employeeId) === String(user.id)
      );
      setPerformance(perf || null);
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  };

  if (!employee) {
    return (
      <div className="profile-container empty-profile">
        <h2>No Profile Found</h2>
      </div>
    );
  }

  const displayName = role === "CANDIDATE" 
    ? (employee.candidateName || "Candidate User") 
    : (employee.name || "Employee User");

  const getStatusStyle = (status) => {
    const normal = status ? status.toUpperCase() : "UNDER REVIEW";
    if (normal === "SELECTED" || normal === "OFFERED") {
      return { background: "rgba(16, 185, 129, 0.12)", color: "#10b981" };
    }
    if (normal === "REJECTED" || normal === "NOT SELECTED") {
      return { background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" };
    }
    if (normal === "INTERVIEW SCHEDULED") {
      return { background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" };
    }
    return { background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
  };

  if (role === "CANDIDATE") {
    return (
      <div className="profile-container animate-fade-in">
        <div className="profile-card-wrapper">
          {/* Candidate Hero Card */}
          <div className="profile-hero-card candidate-theme">
            <div className="profile-avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-hero-meta">
              <span className="profile-badge-pill">🎯 Candidate Portal</span>
              <h1>{displayName}</h1>
              <p className="profile-email-desc">✉️ {employee.email}</p>
            </div>
            <div className="profile-glow-spot"></div>
          </div>

          <div className="profile-widgets-grid">
            {/* Card 1: Personal Details */}
            <div className="profile-info-widget glass-card">
              <div className="widget-header">
                <span className="widget-icon">👤</span>
                <h3>Personal Details</h3>
              </div>
              <div className="widget-body">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{employee.candidateName || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{employee.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mobile</span>
                  <span className="info-value">{employee.mobile || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Current Location</span>
                  <span className="info-value">{employee.currentLocation || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Projects</span>
                  <span className="info-value">{employee.projects || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted Education</span>
                  <span className="info-value">{employee.qualification || "Not Provided"}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Application Overview */}
            <div className="profile-info-widget glass-card">
              <div className="widget-header">
                <span className="widget-icon">💼</span>
                <h3>Application Overview</h3>
              </div>
              <div className="widget-body">
                <div className="info-row">
                  <span className="info-label">Applied Role</span>
                  <span className="info-value">{employee.position || "Not Selected"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Application Status</span>
                  <span 
                    className="info-value"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "800",
                      ...getStatusStyle(employee.status)
                    }}
                  >
                    {employee.status || "Under Review"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted Skills</span>
                  <span className="info-value">{employee.skills || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted Experience</span>
                  <span className="info-value">{employee.experience || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted Certifications</span>
                  <span className="info-value">{employee.certifications || "Not Provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted LinkedIn URL</span>
                  <span className="info-value">
                    {employee.linkedinUrl ? (
                      <a href={employee.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                        {employee.linkedinUrl}
                      </a>
                    ) : "Not Provided"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted GitHub URL</span>
                  <span className="info-value">
                    {employee.githubUrl ? (
                      <a href={employee.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                        {employee.githubUrl}
                      </a>
                    ) : "Not Provided"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Extracted Portfolio URL</span>
                  <span className="info-value">
                    {employee.portfolioUrl ? (
                      <a href={employee.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                        {employee.portfolioUrl}
                      </a>
                    ) : "Not Provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "HR") {
    return (
      <div className="profile-container animate-fade-in">
        <div className="profile-card-wrapper">
          {/* HR Hero Card */}
          <div className="profile-hero-card hr-theme" style={{ background: "linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)" }}>
            <div className="profile-avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-hero-meta">
              <span className="profile-badge-pill">👑 HR Administration Portal</span>
              <h1>{displayName}</h1>
              <p className="profile-email-desc">✉️ {employee.email}</p>
            </div>
            <div className="profile-glow-spot"></div>
          </div>

          <div className="profile-widgets-grid">
            {/* Account Details Widget */}
            <div className="profile-info-widget glass-card">
              <div className="widget-header">
                <span className="widget-icon">👤</span>
                <h3>HR Profile Details</h3>
              </div>
              <div className="widget-body">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{employee.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{employee.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Organization</span>
                  <span className="info-value">{employee.companyName || "NextGen Workspace"}</span>
                </div>
              </div>
            </div>

            {/* Shift & Working Hours Configuration */}
            <div className="profile-info-widget glass-card">
              <div className="widget-header">
                <span className="widget-icon">⚙️</span>
                <h3>Workforce Shift Timings Settings</h3>
              </div>
              <div className="widget-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Shift Start Time (Late Threshold)</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Shift End Time (Overtime Threshold)</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  />
                </div>

                <button
                  onClick={handleSaveHrSettings}
                  style={{
                    padding: "10px 14px",
                    background: "var(--accent-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginTop: "10px",
                    transition: "all 0.2s"
                  }}
                >
                  Save Shift Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-card-wrapper">
        {/* Employee Hero Card */}
        <div className="profile-hero-card">
          <div className="profile-avatar-circle">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-hero-meta">
            <span className="profile-badge-pill">🏢 NextGen HRMS Account</span>
            <h1>{displayName}</h1>
            <p className="profile-email-desc">✉️ {employee.email}</p>
          </div>
          <div className="profile-glow-spot"></div>
        </div>

        <div className="profile-widgets-grid employee-grid-triple">
          {/* Card 1: Account Details */}
          <div className="profile-info-widget glass-card">
            <div className="widget-header">
              <span className="widget-icon">👤</span>
              <h3>Account Details</h3>
            </div>
            <div className="widget-body">
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{displayName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email Address</span>
                <span className="info-value">{employee.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Department</span>
                <span className="info-value">{employee.department?.departmentName || employee.department || "General"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Username</span>
                <span className="info-value">{employee.username || "Not Set"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Location</span>
                <span className="info-value">{employee.address || "Not Set"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Salary Details */}
          <div className="profile-info-widget glass-card">
            <div className="widget-header">
              <span className="widget-icon">💰</span>
              <h3>Salary & Compensation</h3>
            </div>
            <div className="widget-body">
              {salary ? (
                <>
                  <div className="info-row">
                    <span className="info-label">Basic Salary</span>
                    <span className="info-value">₹ {salary.basicSalary?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Bonus Allowances</span>
                    <span className="info-value">₹ {salary.bonus?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Deductions</span>
                    <span className="info-value" style={{ color: "var(--accent-danger)" }}>₹ {salary.deductions?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="info-row highlight-net-salary">
                    <span className="info-label" style={{ fontWeight: "800" }}>Net Salary</span>
                    <span className="info-value" style={{ color: "var(--accent-success)", fontWeight: "900" }}>
                      ₹ {(Number(salary.basicSalary) + Number(salary.bonus) - Number(salary.deductions)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              ) : (
                <div className="empty-widget-data">
                  <span>💰</span>
                  <p>No Salary Data Available</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Performance Ratings */}
          <div className="profile-info-widget glass-card">
            <div className="widget-header">
              <span className="widget-icon">⭐</span>
              <h3>Performance</h3>
            </div>
            <div className="widget-body">
              {performance ? (
                <>
                  <div className="info-row">
                    <span className="info-label">Review Rating</span>
                    <span 
                      className="info-value" 
                      style={{ 
                        color: "#f59e0b", 
                        fontWeight: "900",
                        background: "rgba(245, 158, 11, 0.08)",
                        padding: "3px 8px",
                        borderRadius: "8px"
                      }}
                    >
                      ★ {performance.rating} / 5
                    </span>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span className="info-label">HR Feedback Remarks:</span>
                    <p style={{ fontSize: "12px", margin: 0, lineHeight: "1.4", fontStyle: "italic", color: "var(--text-secondary)" }}>
                      "{performance.remarks || "No comments logged."}"
                    </p>
                  </div>
                </>
              ) : (
                <div className="empty-widget-data">
                  <span>⭐</span>
                  <p>No Performance Data Available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;