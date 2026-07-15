import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  employeeLogin,
  sendOtp,
  verifyOtp,
  loginHr,
  loginHrOtp,
  sendGenericOtp,
  verifyGenericOtp,
  checkHrEmail
} from "../services/ApiService";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [role, setRole] = useState("hr");
  
  // HR Password Login States
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");
  const [showHrPassword, setShowHrPassword] = useState(false);
  
  // Employee Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Candidate/HR OTP States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpDisabled, setOtpDisabled] = useState(false);
  
  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  useEffect(() => {
    if (resendCountdown > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    };
  }, [resendCountdown]);

  const handleBackToEmail = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccess("");
    setCountdown(0);
    setResendCountdown(0);
    setOtpDisabled(false);
  };

  // HR PASSWORD LOGIN
  const handleHrPasswordLogin = async (e) => {
    if (e) e.preventDefault();
    if (!hrEmail || !hrPassword) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await loginHr(hrEmail.trim(), hrPassword);
      if (res.data) {
        login(res.data, "HR");
        alert("HR Login Successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid Email or Password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // HR/CANDIDATE SEND OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = email.trim();

    if (!targetEmail) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (role === "hr") {
        // Check if HR email actually exists in DB
        const existsRes = await checkHrEmail(targetEmail);
        if (existsRes.data === false) {
          setError("HR account not found with this email. Please register first.");
          setLoading(false);
          return;
        }
        await sendGenericOtp(targetEmail);
      } else {
        // Candidate Send OTP
        await sendOtp(targetEmail);
      }
      setSuccess("✅ OTP Sent successfully! Please check your email.");
      setStep(2);
      setCountdown(120); // 2 minutes
      setResendCountdown(30); // 30 seconds
      setOtpDisabled(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // HR/CANDIDATE VERIFY OTP & LOGIN
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = email.trim();
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (role === "hr") {
        // 1. Verify generic OTP
        await verifyGenericOtp(targetEmail, otp);
        // 2. Fetch HR user data
        const res = await loginHrOtp(targetEmail);
        if (res.data) {
          login(res.data, "HR");
          setSuccess("✅ OTP Verified Successfully");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } else {
        // Candidate OTP Login
        const res = await verifyOtp(targetEmail, otp);
        if (res.data) {
          login(res.data, "CANDIDATE");
          setSuccess("✅ OTP Verified Successfully");
          setTimeout(() => {
            navigate("/candidate-dashboard");
          }, 1500);
        } else {
          setError("❌ Invalid OTP. Please enter the correct OTP.");
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "❌ Invalid OTP. Please enter the correct OTP.";
      setError(errMsg);
      if (errMsg.includes("Too many failed attempts")) {
        setOtpDisabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // EMPLOYEE LOGIN
  const handleEmployeeLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError("Please enter your employee username and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await employeeLogin({ username, password });
      if (!res.data) {
        setError("Employee record not found. Please verify details.");
        return;
      }
      login(res.data, "EMPLOYEE");
      alert("Employee Login Successful!");
      navigate("/employee-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 6-digit OTP references
  const otpRef0 = useRef();
  const otpRef1 = useRef();
  const otpRef2 = useRef();
  const otpRef3 = useRef();
  const otpRef4 = useRef();
  const otpRef5 = useRef();
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  const handleOtpChange = (value, idx) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    
    const otpArr = otp.padEnd(6, " ").split("");
    otpArr[idx] = cleanValue ? cleanValue.charAt(cleanValue.length - 1) : " ";
    const finalOtp = otpArr.join("").replace(/\s/g, "");
    setOtp(finalOtp);
    
    if (cleanValue && idx < 5) {
      otpRefs[idx + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && (!otp[idx] || otp[idx] === " ") && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (pasteData.length === 6) {
      setOtp(pasteData);
      otpRefs[5].current?.focus();
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      height: "100vh",
      maxHeight: "100vh",
      width: "100vw",
      background: theme === "dark" ? "#0f172a" : "#f8fafc",
      color: theme === "dark" ? "#ffffff" : "#0f172a",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* LEFT SIDE: BANNER & ILLUSTRATION */}
      <div style={{
        flex: "1.2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: theme === "dark" 
          ? "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)" 
          : "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
        padding: "30px 40px",
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        borderRight: theme === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0"
      }} className="login-banner-left">
        {/* Company Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 2 }}>
          <span style={{ fontSize: "24px" }}>💼</span>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: theme === "dark" ? "#818cf8" : "#2563eb", letterSpacing: "-0.5px", margin: 0 }}>NextGen HRMS</h2>
        </div>

        {/* Welcome text & highlights */}
        <div style={{ zIndex: 2, margin: "auto 0" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "900", lineHeight: "1.2", marginBottom: "12px", color: theme === "dark" ? "#ffffff" : "#1e293b" }}>Create Your Organization Workspace</h1>
          <p style={{ fontSize: "13.5px", color: theme === "dark" ? "#94a3b8" : "#475569", lineHeight: "1.5", maxWidth: "480px", marginBottom: "20px" }}>
            Empower your workforce with AI-driven HR solutions designed for modern enterprises.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
            {[
              {
                emoji: "🤖",
                title: "AI Recruitment & Resume Intelligence",
                desc: "Leverage AI-powered resume analysis, candidate matching, and intelligent hiring recommendations to streamline recruitment."
              },
              {
                emoji: "📈",
                title: "Performance Analytics & Department Insights",
                desc: "Monitor employee productivity, department health, workforce trends, and performance metrics through real-time analytics."
              },
              {
                emoji: "🔐",
                title: "Secure Employee Management & Enterprise Workflows",
                desc: "Manage employees, attendance, leave, payroll, and recruitment securely with role-based access control and enterprise-grade workflows."
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "12px",
                  background: theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(37, 99, 235, 0.04)",
                  border: "1px solid " + (theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(37, 99, 235, 0.08)"),
                  borderRadius: "12px",
                  padding: "10px 14px",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(5px)",
                  WebkitBackdropFilter: "blur(5px)"
                }}
                className="branding-highlight-card"
              >
                <span style={{ 
                  fontSize: "16px", 
                  padding: "8px", 
                  borderRadius: "10px", 
                  background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(37,99,235,0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>{item.emoji}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h4 style={{ 
                    fontSize: "13px", 
                    fontWeight: "800", 
                    margin: 0, 
                    color: theme === "dark" ? "#ffffff" : "#1e293b" 
                  }}>{item.title}</h4>
                  <p style={{ 
                    fontSize: "11px", 
                    margin: 0, 
                    lineHeight: "1.4", 
                    color: theme === "dark" ? "#cbd5e1" : "#475569" 
                  }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Image */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%", maxHeight: "30%", zIndex: 2 }}>
          <img 
            src="/login_hrms_illustration.png" 
            alt="HRMS Illustration" 
            style={{ maxHeight: "100%", maxWidth: "80%", objectFit: "contain", borderRadius: "12px", boxShadow: theme === "dark" ? "0 10px 35px rgba(0,0,0,0.5)" : "0 10px 35px rgba(100,116,139,0.1)" }} 
          />
        </div>
      </div>

      {/* RIGHT SIDE: GLASSMORPHISM CARD */}
      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative"
      }} className="login-form-right">
        {/* Sliding Pill Theme Switcher */}
        <div 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "72px",
            height: "36px",
            borderRadius: "18px",
            background: theme === "dark" ? "#1e293b" : "#e2e8f0",
            border: "2px solid " + (theme === "dark" ? "#334155" : "#cbd5e1"),
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "2px",
            userSelect: "none",
            transition: "all 0.3s ease",
            zIndex: 100
          }}
        >
          <div style={{
            position: "absolute",
            left: theme === "dark" ? "38px" : "2px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: theme === "dark" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "linear-gradient(135deg, #fbbf24, #d97706)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }} />
          <span style={{ fontSize: "14px", position: "absolute", left: "9px", pointerEvents: "none" }}>☀️</span>
          <span style={{ fontSize: "14px", position: "absolute", right: "9px", pointerEvents: "none" }}>🌙</span>
        </div>

        {/* Card wrapper */}
        <div style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          borderRadius: "var(--radius-lg)",
          background: theme === "dark" ? "rgba(30, 41, 59, 0.6)" : "#ffffff",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: theme === "dark" ? "0 20px 50px rgba(0, 0, 0, 0.3)" : "0 20px 50px rgba(100, 116, 139, 0.06)",
          animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <div style={{
            fontSize: "44px",
            marginBottom: "15px",
            background: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.03)",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
          }}>🏢</div>
          
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: theme === "dark" ? "#ffffff" : "#1e293b", margin: "0 0 6px 0" }}>🏢 NextGen HRMS Account</h1>
          <p style={{ fontSize: "14px", color: theme === "dark" ? "#94a3b8" : "#64748b", margin: "0 0 25px 0" }}>Unified Human Resource Management</p>

          {/* Role Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "10px", 
            marginBottom: "25px", 
            borderBottom: theme === "dark" ? "1.5px solid rgba(255,255,255,0.08)" : "1.5px solid #e2e8f0", 
            paddingBottom: "8px" 
          }}>
            {[
              { id: "hr", label: "HR Manager" },
              { id: "employee", label: "Employee" },
              { id: "candidate", label: "Candidate" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setRole(tab.id);
                  setError("");
                  setSuccess("");
                  setStep(1);
                  setOtp("");
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  background: "transparent",
                  color: role === tab.id ? (theme === "dark" ? "#60a5fa" : "var(--accent-primary)") : (theme === "dark" ? "#94a3b8" : "#64748b"),
                  fontWeight: role === tab.id ? "800" : "500",
                  fontSize: "14px",
                  cursor: "pointer",
                  borderBottom: role === tab.id ? (theme === "dark" ? "3px solid #60a5fa" : "3px solid var(--accent-primary)") : "none",
                  transition: "all 0.3s ease",
                  borderRadius: 0
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="error-shake" style={{
              background: "rgba(239, 68, 68, 0.12)",
              color: "#f87171",
              border: "1.5px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textAlign: "left"
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-pop" style={{
              background: "rgba(16, 185, 129, 0.12)",
              color: "#34d399",
              border: "1.5px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textAlign: "left"
            }}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* HR PORTAL FORM */}
          {role === "hr" && (
            <div>
              <form onSubmit={handleHrPasswordLogin}>
                <div className="input-group" style={{ marginBottom: "20px" }}>
                  <input
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>HR Email Address</label>
                </div>

                <div className="input-group" style={{ marginBottom: "25px", position: "relative" }}>
                  <input
                    type={showHrPassword ? "text" : "password"}
                    value={hrPassword}
                    onChange={(e) => setHrPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Password</label>
                  <span
                    onClick={() => setShowHrPassword(!showHrPassword)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "16px",
                      userSelect: "none",
                      color: theme === "dark" ? "#94a3b8" : "#64748b"
                    }}
                  >
                    {showHrPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>

                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <div style={{ marginTop: "20px", fontSize: "14px", color: theme === "dark" ? "#94a3b8" : "#475569" }}>
                Need a separate HR workspace? 
                <span 
                  style={{ color: theme === "dark" ? "#60a5fa" : "var(--accent-primary)", cursor: "pointer", fontWeight: "700", marginLeft: "5px" }} 
                  onClick={() => navigate("/register")}
                >
                  Register HR
                </span>
              </div>
            </div>
          )}

          {/* EMPLOYEE PORTAL FORM */}
          {role === "employee" && (
            <form onSubmit={handleEmployeeLogin}>
              <div className="input-group" style={{ marginBottom: "20px" }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  required
                />
                <label>Username</label>
              </div>

              <div className="input-group" style={{ marginBottom: "25px", position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                />
                <label>Password</label>
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "16px",
                    userSelect: "none",
                    color: theme === "dark" ? "#94a3b8" : "#64748b"
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}

          {/* CANDIDATE PORTAL FORM */}
          {role === "candidate" && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <div className="input-group" style={{ marginBottom: "25px" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      required
                    />
                    <label>Candidate Email Address</label>
                  </div>
                  <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Sending code..." : "Send Verification OTP"}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ marginBottom: "15px", fontSize: "13.5px", color: theme === "dark" ? "#cbd5e1" : "#334155" }}>
                    OTP sent to <strong>{email}</strong>
                  </div>

                  {/* 6 DIGIT OTP BOXES */}
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "25px" }} onPaste={handleOtpPaste}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        maxLength={1}
                        value={(otp[idx] === " " ? "" : otp[idx]) || ""}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        style={{
                          width: "44px",
                          height: "48px",
                          fontSize: "20px",
                          fontWeight: "700",
                          textAlign: "center",
                          borderRadius: "8px",
                          border: "2px solid " + (theme === "dark" ? "rgba(255,255,255,0.15)" : "#cbd5e1"),
                          background: theme === "dark" ? "rgba(15,23,42,0.4)" : "#ffffff",
                          color: theme === "dark" ? "#ffffff" : "#0f172a",
                          padding: "0",
                          lineHeight: "44px",
                        }}
                        className="otp-digit-box"
                      />
                    ))}
                  </div>

                  {countdown > 0 ? (
                    <div style={{ color: theme === "dark" ? "#f59e0b" : "#d97706", fontSize: "12.5px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
                      OTP expires in: {Math.floor(countdown / 60).toString().padStart(2, "0")}:{(countdown % 60).toString().padStart(2, "0")}
                    </div>
                  ) : (
                    <div style={{ color: "#ef4444", fontSize: "12.5px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
                      OTP Expired<br/>
                      <span style={{ fontSize: "12px", fontWeight: "400" }}>Please request a new OTP.</span>
                    </div>
                  )}

                  <button 
                    onClick={handleVerifyOtp} 
                    style={styles.button} 
                    disabled={loading || countdown === 0 || otpDisabled}
                  >
                    {loading ? "Verifying..." : "Verify & Log In"}
                  </button>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontSize: "13px" }}>
                    <button 
                      onClick={handleBackToEmail} 
                      style={{ background: "none", border: "none", color: theme === "dark" ? "#60a5fa" : "var(--accent-primary)", cursor: "pointer", fontWeight: "700" }}
                    >
                      ← Back
                    </button>
                    {resendCountdown > 0 ? (
                      <span style={{ color: theme === "dark" ? "#94a3b8" : "#64748b", fontWeight: "600" }}>Resend OTP in {resendCountdown}s</span>
                    ) : (
                      <button 
                        onClick={handleSendOtp} 
                        style={{ background: "none", border: "none", color: theme === "dark" ? "#60a5fa" : "var(--accent-primary)", cursor: "pointer", fontWeight: "700" }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-banner-left {
            display: none !important;
          }
          .login-form-right {
            flex: 1 !important;
            width: 100% !important;
          }
        }
        
        .otp-digit-box:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25) !important;
          transform: translateY(-2px);
        }

        .branding-highlight-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          filter: brightness(1.05);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes successPop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .error-shake {
          animation: shake 0.3s ease-in-out;
        }
        .success-pop {
          animation: successPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

const styles = {
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
    transition: "all 0.3s ease",
    marginTop: "5px"
  }
};
export default Login;
