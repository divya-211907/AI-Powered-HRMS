import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendGenericOtp,
  verifyGenericOtp,
  registerHr,
  checkHrEmail
} from "../services/ApiService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP workflow states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpDisabled, setOtpDisabled] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);
  const [theme, setTheme] = useState("dark");

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

  const getPasswordStrength = () => {
    if (password.length < 6 || password.length > 10)
      return {
        text: "Weak (Length must be 6-10)",
        color: "#ef4444",
      };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (hasUpper && hasLower && hasNumber)
      return {
        text: "Strong",
        color: "#10b981",
      };

    return {
      text: "Medium (Needs uppercase, lowercase, & number)",
      color: "#f59e0b",
    };
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    if (!name || !companyName || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(email)) {
      setError("Please enter a valid email format");
      return;
    }

    if (getPasswordStrength().text !== "Strong") {
      setError("Please use a strong password (6-10 characters, at least 1 uppercase, 1 lowercase, and 1 number).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1. Check if email already exists
      const existsRes = await checkHrEmail(email);
      if (existsRes.data === true) {
        setError("HR account already exists with this email address. Redirecting to login page.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // 2. Send OTP
      await sendGenericOtp(email);
      setOtpSent(true);
      setCountdown(120); // 2 minutes
      setResendCountdown(30); // 30 seconds
      setOtpDisabled(false);
      setSuccess("✅ OTP Sent successfully! Please check your email.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // 1. Verify OTP
      await verifyGenericOtp(email, otp);

      // 2. Create HR Account
      await registerHr({
        name,
        companyName,
        email,
        password
      });

      setSuccess("✅ OTP Verified Successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
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

  const strength = getPasswordStrength();

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
      }} className="register-banner-left">
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

      {/* RIGHT SIDE: REGISTRATION FORM */}
      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        height: "100%",
        boxSizing: "border-box",
        position: "relative"
      }} className="register-form-right">
        {/* Sliding Pill Theme Switcher */}
        <div 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "64px",
            height: "32px",
            borderRadius: "16px",
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
            left: theme === "dark" ? "34px" : "2px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: theme === "dark" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "linear-gradient(135deg, #fbbf24, #d97706)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }} />
          <span style={{ fontSize: "12px", position: "absolute", left: "7px", pointerEvents: "none" }}>☀️</span>
          <span style={{ fontSize: "12px", position: "absolute", right: "7px", pointerEvents: "none" }}>🌙</span>
        </div>

        {/* Card wrapper */}
        <div style={{
          width: "100%",
          maxWidth: "500px",
          padding: "25px 30px",
          borderRadius: "var(--radius-lg)",
          background: theme === "dark" ? "rgba(30, 41, 59, 0.6)" : "#ffffff",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: theme === "dark" ? "0 15px 35px rgba(0, 0, 0, 0.3)" : "0 15px 35px rgba(100, 116, 139, 0.06)",
          boxSizing: "border-box",
          animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <div style={{
            fontSize: "32px",
            marginBottom: "10px",
            background: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.03)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>🏢</div>

          <h1 style={{ fontSize: "22px", fontWeight: "900", color: theme === "dark" ? "#ffffff" : "#1e293b", margin: "0 0 4px 0" }}>HR Registration</h1>
          <p style={{ fontSize: "13px", color: theme === "dark" ? "#94a3b8" : "#64748b", margin: "0 0 20px 0" }}>Create your professional private HR workspace</p>

          {error && (
            <div className="error-shake" style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "600",
              textAlign: "left",
              marginBottom: "15px"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-pop" style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "600",
              textAlign: "left",
              marginBottom: "15px"
            }}>
              {success}
            </div>
          )}

          {!otpSent ? (
            <>
              {/* Row 1: Full Name | Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }} className="register-two-col">
                <div className="input-group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Full Name</label>
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Email Address</label>
                </div>
              </div>

              {/* Row 2: Company Name (Full Width) */}
              <div className="input-group" style={{ marginBottom: "12px" }}>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder=" "
                  required
                />
                <label>Company Name</label>
              </div>

              {/* Row 3: Password | Confirm Password */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }} className="register-two-col">
                <div className="input-group" style={{ position: "relative" }}>
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
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "14px",
                      userSelect: "none",
                      color: theme === "dark" ? "#cbd5e1" : "#64748b"
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Confirm Password</label>
                </div>
              </div>

              {/* Password strength bar */}
              {password && (
                <div style={{ marginBottom: "12px", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: "700", marginBottom: "4px" }}>
                    <span style={{ color: theme === "dark" ? "#cbd5e1" : "#475569" }}>Password Strength:</span>
                    <span style={{ color: strength.color }}>{strength.text}</span>
                  </div>
                  <div style={{ width: "100%", height: "3px", background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ 
                      width: strength.text === "Strong" ? "100%" : strength.text === "Medium" ? "60%" : "30%", 
                      height: "100%", 
                      background: strength.color,
                      transition: "all 0.3s ease" 
                    }} />
                  </div>
                </div>
              )}

              <button
                className="register-btn"
                onClick={handleSendOtp}
                disabled={loading}
                style={{ marginTop: "6px" }}
              >
                {loading ? "Sending OTP..." : "Send OTP & Register"}
              </button>
            </>
          ) : (
            <>
              {/* Row 4: OTP Verification */}
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 4px 0", color: theme === "dark" ? "#ffffff" : "#1e293b" }}>Verification Code Required</h3>
                <p style={{ color: theme === "dark" ? "#cbd5e1" : "#475569", fontSize: "12px", margin: 0 }}>
                  Enter code sent to <strong>{email}</strong>.
                </p>
              </div>

              {/* 6-DIGIT OTP FIELDS */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "15px" }} onPaste={handleOtpPaste}>
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
                      width: "40px",
                      height: "44px",
                      fontSize: "18px",
                      fontWeight: "700",
                      textAlign: "center",
                      borderRadius: "8px",
                      border: "2px solid " + (theme === "dark" ? "rgba(255,255,255,0.15)" : "#cbd5e1"),
                      background: theme === "dark" ? "rgba(15,23,42,0.4)" : "#ffffff",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      padding: "0",
                      lineHeight: "40px",
                      outline: "none",
                      transition: "all 0.2s"
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
                  ⌛ OTP Expired<br/>
                  <span style={{ fontSize: "11px", fontWeight: "400" }}>Please request a new OTP.</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", fontSize: "12px" }}>
                <span style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                  Status: Active
                </span>
                {resendCountdown > 0 ? (
                  <span style={{ color: theme === "dark" ? "#94a3b8" : "#64748b", fontWeight: "600" }}>Resend OTP in {resendCountdown}s</span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    style={{ background: "none", border: "none", color: theme === "dark" ? "#60a5fa" : "var(--accent-primary)", fontWeight: "700", cursor: "pointer" }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                className="register-btn"
                onClick={handleVerifyAndRegister}
                disabled={loading || countdown === 0 || otpDisabled}
                style={{ marginTop: "6px" }}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </>
          )}

          <div style={{ marginTop: "20px", fontSize: "13.5px", color: theme === "dark" ? "#94a3b8" : "#475569" }}>
            Already have an account?
            <span 
              onClick={() => navigate("/login")}
              style={{ color: theme === "dark" ? "#60a5fa" : "var(--accent-primary)", fontWeight: "700", cursor: "pointer", marginLeft: "5px" }}
            >
              Login
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .register-banner-left {
            display: none !important;
          }
          .register-form-right {
            flex: 1 !important;
            width: 100% !important;
          }
        }
        @media (max-width: 500px) {
          .register-two-col {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }
        
        .otp-digit-box:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25) !important;
          transform: translateY(-2px);
        }

        .register-btn {
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-md);
          border: none;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          transition: all 0.3s ease;
        }

        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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

export default Register;
