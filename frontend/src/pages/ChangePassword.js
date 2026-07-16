import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function ChangePassword() {
  const { currentUser, role, updateCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6 && pwd.length <= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    if (newPassword.length < 6 || newPassword.length > 10) return { text: "Weak (Length must be 6-10)", color: "#EF4444" };
    if (score < 4) return { text: "Medium", color: "#F59E0B" };
    return { text: "Strong", color: "#10B981" };
  };

  const strength = getStrength(newPassword);
  const strengthDetails = getStrengthLabel(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 10) {
      setError("Password must be between 6 and 10 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one digit.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/hr/change-password", {
        email: currentUser?.email,
        role: role,
        currentPassword,
        newPassword
      });

      setSuccess("Password updated successfully!");
      
      const updatedUser = { ...currentUser, firstLogin: false };
      updateCurrentUser(updatedUser);

      setTimeout(() => {
        if (role === "HR" || role === "ADMIN") {
          navigate("/dashboard");
        } else if (role === "EMPLOYEE") {
          navigate("/employee-dashboard");
        } else {
          navigate("/candidate-dashboard");
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-card animate-fade-in">
        <h2 style={styles.title}>🔐 Security Center</h2>
        <p style={styles.subtitle}>
          {currentUser?.firstLogin 
            ? "First Login Detected: Please set a secure password to unlock access to your dashboard." 
            : "Update your account password. Choose a strong combination of characters."}
        </p>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {newPassword && (
            <div style={styles.strengthWrapper}>
              <div style={styles.strengthTextRow}>
                <span style={styles.strengthLabel}>Password Strength:</span>
                <strong style={{ color: strengthDetails.color }}>{strengthDetails.text}</strong>
              </div>
              <div style={styles.strengthBarOuter}>
                <div 
                  style={{
                    height: "100%",
                    width: `${(strength / 5) * 100}%`,
                    background: strengthDetails.color,
                    borderRadius: "2px",
                    transition: "width 0.4s ease, background-color 0.4s ease"
                  }}
                />
              </div>
              <ul style={styles.validationList}>
                <li style={{ color: (newPassword.length >= 6 && newPassword.length <= 10) ? "#10B981" : "var(--text-secondary)" }}>
                  {(newPassword.length >= 6 && newPassword.length <= 10) ? "✓" : "○"} Length: 6 to 10 characters
                </li>
                <li style={{ color: /[A-Z]/.test(newPassword) ? "#10B981" : "var(--text-secondary)" }}>
                  {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least 1 uppercase letter
                </li>
                <li style={{ color: /[a-z]/.test(newPassword) ? "#10B981" : "var(--text-secondary)" }}>
                  {/[a-z]/.test(newPassword) ? "✓" : "○"} At least 1 lowercase letter
                </li>
                <li style={{ color: /[0-9]/.test(newPassword) ? "#10B981" : "var(--text-secondary)" }}>
                  {/[0-9]/.test(newPassword) ? "✓" : "○"} At least 1 number
                </li>
                <li style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                  ○ Special character (optional)
                </li>
              </ul>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: "20px 0"
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    textAlign: "center",
    marginBottom: "8px"
  },
  subtitle: {
    fontSize: "12.5px",
    color: "var(--text-secondary)",
    textAlign: "center",
    lineHeight: "1.5",
    marginBottom: "25px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-secondary)"
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    background: "var(--stat-card-bg)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  submitBtn: {
    marginTop: "10px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
    transition: "transform 0.2s, opacity 0.2s"
  },
  errorAlert: {
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.1)",
    borderLeft: "4px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    fontSize: "12.5px",
    lineHeight: "1.4",
    marginBottom: "10px"
  },
  successAlert: {
    padding: "12px 16px",
    background: "rgba(16, 185, 129, 0.1)",
    borderLeft: "4px solid #10B981",
    borderRadius: "6px",
    color: "#10B981",
    fontSize: "12.5px",
    lineHeight: "1.4",
    marginBottom: "10px"
  },
  strengthWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "var(--bg-app)",
    borderRadius: "8px",
    border: "1px solid var(--border-color)"
  },
  strengthTextRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px"
  },
  strengthLabel: {
    color: "var(--text-secondary)"
  },
  strengthBarOuter: {
    width: "100%",
    height: "4px",
    background: "var(--border-color)",
    borderRadius: "2px",
    overflow: "hidden"
  },
  validationList: {
    margin: "4px 0 0",
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "11px"
  }
};

export default ChangePassword;
