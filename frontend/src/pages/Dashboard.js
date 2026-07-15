import { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { approveLeave, rejectLeave, saveDashboardInsight, getHrInterviews, getWellnessSentinel, getDepartmentHealthScores } from "../services/ApiService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const {
    employees = [],
    attendance = [],
    leaves = [],
    payrolls = [],
    departments = [],
    recruitments = [],
    performances = [],
    refreshAll
  } = useContext(HrmsContext);

  const { currentUser, lastLoginTime } = useContext(AuthContext);
  const hrName = currentUser?.name || "HR Manager";
  const employeeId = currentUser?.employeeId || "EMP-HR-1";
  const role = currentUser?.role || "HR";
  const department = currentUser?.department || "Human Resources";
  const theme = localStorage.getItem("theme") || "light";

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "👋 Good Morning";
    if (hrs < 17) return "👋 Good Afternoon";
    return "👋 Good Evening";
  };

  const [interviews, setInterviews] = useState([]);
  const [activeInterviewTab, setActiveInterviewTab] = useState("today");

  const [wellnessData, setWellnessData] = useState([]);
  const [loadingWellness, setLoadingWellness] = useState(false);
  const [analysisTime, setAnalysisTime] = useState("");
  const [deptHealthList, setDeptHealthList] = useState([]);

  const loadHealthScores = async () => {
    try {
      const res = await getDepartmentHealthScores();
      if (res.data) {
        setDeptHealthList(res.data);
      }
    } catch (err) {
      console.error("Error loading department health scores:", err);
    }
  };

  const fetchWellnessData = async () => {
    setLoadingWellness(true);
    try {
      const res = await getWellnessSentinel();
      setWellnessData(res.data || res || []);
    } catch (err) {
      console.error("Error loading wellness data:", err);
    } finally {
      setLoadingWellness(false);
    }
  };

  useEffect(() => {
    fetchWellnessData();
    loadHealthScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getHrInterviews()
      .then(res => setInterviews(res.data || []))
      .catch(err => console.error("Error loading HR interviews:", err));
  }, [recruitments]);

  useEffect(() => {
    const options = { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
    setAnalysisTime(new Date().toLocaleDateString("en-US", options));
    loadHealthScores();
  }, [employees, attendance, leaves, recruitments, payrolls, performances]);

  // Data computations
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const newCandidates = recruitments.filter((r) => r.status === "APPLIED");

  const handleApproveLeave = async (id) => {
    try {
      await approveLeave(id);
      refreshAll();
    } catch (err) {
      console.log("Error approving leave:", err);
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      await rejectLeave(id);
      refreshAll();
    } catch (err) {
      console.log("Error rejecting leave:", err);
    }
  };

  // Dynamic AI Workforce Summary calculations
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todayLogs = attendance.filter(a => isToday(a.date));
  const presentCountToday = todayLogs.filter(a => a.status === "Present" || a.status?.toUpperCase() === "PRESENT").length;
  
  const onLeaveTodayCount = leaves.filter(l => 
    l.status?.toUpperCase() === "APPROVED" && 
    isToday(l.fromDate)
  ).length;

  const absentCountToday = Math.max(0, employees.length - presentCountToday - onLeaveTodayCount);
  const attendanceRateToday = employees.length > 0 ? (presentCountToday / employees.length) * 100 : 100;
  const attendanceRate = attendanceRateToday;

  const newCandidatesCount = recruitments.filter(r => r.status === "APPLIED" || r.status?.toUpperCase() === "NEW" || r.status?.toUpperCase() === "APPLIED").length;
  const shortlistedCandidatesCount = recruitments.filter(r => r.status === "SHORTLISTED" || r.status?.toUpperCase() === "SHORTLISTED").length;
  const interviewScheduledCount = recruitments.filter(r => r.status === "Interview Scheduled" || r.status?.toUpperCase() === "INTERVIEW SCHEDULED" || r.status?.toUpperCase() === "INTERVIEW_SCHEDULED").length;
  
  const pendingLeavesCount = leaves.filter(l => l.status === "PENDING" || l.status?.toUpperCase() === "PENDING").length;
  const approvedLeavesCount = leaves.filter(l => l.status === "APPROVED" || l.status?.toUpperCase() === "APPROVED").length;
  
  const performancesCount = performances.length;
  const avgPerformance = performancesCount > 0 ? performances.reduce((sum, p) => sum + (p.rating || 0), 0) / performancesCount : 0;

  const getWorkforceHealthSummary = () => {
    if (employees.length === 0) {
      return "No employees registered in the database.";
    }
    return `Today's workforce health is strong with ${presentCountToday} employees present, ${onLeaveTodayCount} employees on approved leave, and ${absentCountToday} absences recorded.`;
  };

  const getRecruitmentSummary = () => {
    if (newCandidatesCount === 0 && shortlistedCandidatesCount === 0 && interviewScheduledCount === 0) {
      return "No candidate applications are currently awaiting review.";
    }
    return `Recruitment activity is active with ${newCandidatesCount} new applications, ${shortlistedCandidatesCount} shortlisted candidates, and ${interviewScheduledCount} interviews scheduled.`;
  };

  const getLeaveSummary = () => {
    if (pendingLeavesCount === 0) {
      return "No pending leave requests require HR attention.";
    }
    return `There are ${pendingLeavesCount} pending leave requests requiring review, and ${approvedLeavesCount} total approved leave requests.`;
  };

  const getPerformanceSummary = () => {
    if (performancesCount === 0) {
      return "Performance review data is not yet available.";
    }
    return `Employee productivity rating is evaluated at ${avgPerformance.toFixed(1)} / 5.0 across ${performancesCount} performance reviews.`;
  };

  const isHighLeaveRate = employees.length > 0 && ((onLeaveTodayCount / employees.length) > 0.1 || pendingLeavesCount > 5);
  const isLowAttendance = todayLogs.length > 0 && attendanceRateToday < 95;
  const isHighRecruitment = newCandidatesCount > 5 || shortlistedCandidatesCount > 2;

  const getDynamicInsights = () => {
    const insights = [];
    if (isLowAttendance) {
      insights.push({
        type: "danger",
        emoji: "⚠️",
        msg: `Attendance has dropped below expected levels today (${attendanceRateToday.toFixed(1)}%).`
      });
    }
    if (isHighLeaveRate) {
      insights.push({
        type: "warning",
        emoji: "⚠️",
        msg: "Leave requests are higher than usual and may require workforce balancing."
      });
    }
    if (isHighRecruitment) {
      insights.push({
        type: "success",
        emoji: "🚀",
        msg: "Recruitment pipeline is highly active with multiple candidates progressing."
      });
    }
    if (insights.length === 0) {
      insights.push({
        type: "info",
        emoji: "✨",
        msg: "Operational efficiency and workforce telemetry trends are currently stable."
      });
    }
    return insights;
  };

  const upcomingInterviews = recruitments.filter(r => r.status === "Interview Scheduled" || r.status?.toUpperCase() === "INTERVIEW SCHEDULED");

  const newHiresCount = recruitments.filter(r => 
    r.status?.toUpperCase() === "SELECTED" || 
    r.status?.toUpperCase() === "HIRED" || 
    r.status?.toUpperCase() === "OFFER ACCEPTED"
  ).length;

  const totalCandidates = recruitments.length;
  const activeApplications = recruitments.filter(r => r.status !== "Rejected" && r.status !== "Selected" && r.status !== "Hired" && r.status?.toUpperCase() !== "REJECTED" && r.status?.toUpperCase() !== "SELECTED" && r.status?.toUpperCase() !== "HIRED").length;
  const potentialDuplicates = recruitments.filter(r => r.duplicateCandidateId !== null && r.duplicateCandidateId !== undefined && r.duplicateCandidateId !== "").length;
  const aiRecommended = recruitments.filter(r => r.overallScore >= 80 || r.matchScore >= 80 || r.hiringRecommendation === "Strongly Recommended").length;

  const stats = [
    { title: "Total Employees", count: employees.length, desc: "Active Workforce", trend: "+3 this week", color: "#3b82f6", gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))", icon: "👥" },
    { title: "Total Candidates", count: totalCandidates, desc: "Total Resume Profiles", trend: `${activeApplications} Active`, color: "#06b6d4", gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.1))", icon: "🎯" },
    { title: "Potential Duplicates", count: potentialDuplicates, desc: "Duplicate Warnings", trend: potentialDuplicates > 0 ? "⚠️ Review Needed" : "✓ None", color: "#ef4444", gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))", icon: "⚠️" },
    { title: "AI Recommended", count: aiRecommended, desc: "Highly Suitables", trend: `${aiRecommended} Candidates`, color: "#10b981", gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))", icon: "✨" },
    { title: "Pending Leaves", count: pendingLeavesCount, desc: "Awaiting Action", trend: "Review before Friday", color: "#ef4444", gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))", icon: "📋" },
    { title: "Today's Attendance", count: `${attendanceRate.toFixed(0)}%`, desc: "Operational Telemetry", trend: "95% Target", color: "#10b981", gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))", icon: "🕒" }
  ];

  // Recharts payroll trend dataset
  const payrollTrend = payrolls.map((p, idx) => ({
    name: p.employeeName?.split(" ")[0] || `Emp ${idx+1}`,
    Salary: p.netSalary || 0
  }));

  // Recharts ratings analytics dataset
  const ratingsData = performances.map((perf) => ({
    name: perf.employeeName?.split(" ")[0] || "Review",
    Score: perf.rating || 0
  }));

  // Dynamic Department Health Scores
  const deptColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"];
  const deptHealthData = deptHealthList.map((d, index) => ({
    name: d.departmentName,
    score: d.healthScore,
    status: d.status,
    statusColor: d.statusColor,
    insight: d.insight,
    color: d.healthScore >= 90 ? "#10b981" : d.healthScore >= 75 ? "#f59e0b" : "#ef4444"
  }));

  const todayStr = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const todayInterviews = interviews.filter(i => i.interviewDate === todayStr && i.status !== "COMPLETED");
  const upcomingInterviewsList = interviews.filter(i => i.interviewDate !== todayStr && i.status === "UPCOMING");
  const completedInterviewsList = interviews.filter(i => i.status === "COMPLETED");

  // Funnel Data calculations
  const funnelData = [
    { name: "Received", value: recruitments.length, color: "#3b82f6" },
    { name: "Under Review", value: recruitments.filter(r => r.status === "APPLIED" || r.status?.toUpperCase() === "APPLIED" || r.status?.toUpperCase() === "UNDER REVIEW").length, color: "#06b6d4" },
    { name: "Shortlisted", value: shortlistedCandidatesCount, color: "#8b5cf6" },
    { name: "Interview Scheduled", value: upcomingInterviews.length, color: "#f59e0b" },
    { name: "Selected", value: recruitments.filter(r => r.status === "SELECTED" || r.status?.toUpperCase() === "SELECTED" || r.status === "Selected").length, color: "#10b981" }
  ];

  // Dynamic Notifications List
  const notifications = [
    ...newCandidates.slice(0, 2).map((c, i) => ({
      id: `c-${i}`,
      type: "candidate",
      title: "New Candidate Application",
      msg: `${c.candidateName} applied for ${c.position || "Developer"}. Match score is ${c.aiScore || 85}%.`,
      time: "10m ago",
      read: false
    })),
    ...pendingLeaves.slice(0, 2).map((l, i) => ({
      id: `l-${i}`,
      type: "leave",
      title: "Leave Request Awaiting Review",
      msg: `${l.employeeName} requested ${l.leaveType || "Casual Leave"} from ${l.fromDate}.`,
      time: "1h ago",
      read: false
    })),
    ...(attendanceRate < 95 ? [{
      id: "a-1",
      type: "attendance",
      title: "Attendance Anomaly Alert",
      msg: `Workforce attendance dropped below 95% threshold to ${attendanceRate.toFixed(1)}%.`,
      time: "2h ago",
      read: true
    }] : []),
    ...upcomingInterviews.slice(0, 1).map((int, i) => ({
      id: `int-${i}`,
      type: "interview",
      title: "Interview Scheduled Notification",
      msg: `Interview with ${int.candidateName} is scheduled.`,
      time: "1d ago",
      read: true
    }))
  ].slice(0, 5);

  const getAIRecommendations = () => {
    const recs = [];
    if (pendingLeavesCount > 0) {
      recs.push({
        type: "leaves",
        msg: `Review and resolve the ${pendingLeavesCount} pending leave requests before Friday to maintain project schedules.`,
        action: "Review Leaves"
      });
    }
    if (shortlistedCandidatesCount > 0) {
      recs.push({
        type: "recruitment",
        msg: `Schedule interview panels for the ${shortlistedCandidatesCount} shortlisted candidates waiting in the queue.`,
        action: "Schedule Interviews"
      });
    }
    const topPerformer = performances.find(p => p.rating >= 4.5);
    if (topPerformer) {
      recs.push({
        type: "performance",
        msg: `Recognize and reward ${topPerformer.employeeName} for achieving a top rating of ${topPerformer.rating} this appraisal cycle.`,
        action: "View Performance"
      });
    }
    const lowPerformer = performances.find(p => p.rating < 3.0);
    if (lowPerformer) {
      recs.push({
        type: "training",
        msg: `Consider professional skill training recommendations for ${lowPerformer.employeeName} to boost productivity scores.`,
        action: "Analyze Performance"
      });
    }
    if (recs.length === 0) {
      recs.push({
        type: "performance",
        msg: "Workforce output metrics are currently balanced. Plan ahead for next quarter appraisal schedules.",
        action: "Audit Appraisals"
      });
    }
    return recs;
  };

  useEffect(() => {
    if (employees.length > 0) {
      const summaryText = getWorkforceHealthSummary() + " " + getRecruitmentSummary();
      const alertsText = getDynamicInsights().map(i => i.msg).join(" | ");
      const recommendationsText = `Resolve ${pendingLeavesCount} pending leaves and process pending payroll logs.`;

      saveDashboardInsight({
        dailySummary: summaryText,
        alerts: alertsText,
        recommendations: recommendationsText
      }).catch(err => console.error("Error saving Dashboard AI Insight:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.length, departments.length, pendingLeavesCount, attendance.length, recruitments.length]);

  return (
    <div className="dashboard-root animate-fade-in">
      {/* 🚀 Welcome Hero Section */}
      <div className="hero-card">
        <div className="hero-content">
          <h1>{getGreeting()}, {hrName}</h1>
          <p>Welcome back to your HR Command Center.</p>
          <div className="hero-badges">
            <span className="hero-badge">🆔 {employeeId}</span>
            <span className="hero-badge">💼 {role}</span>
            <span className="hero-badge">🏢 {department}</span>
            <span className="hero-badge">🕒 Last Login: {lastLoginTime}</span>
          </div>
        </div>
        <div className="hero-glow"></div>
      </div>

      {/* 🧠 AI Workforce Summary Section */}
      <div className="ai-workforce-summary glass-card">
        <div className="summary-header">
          <div className="header-brand">
            <span className="brand-logo">🤖</span>
            <div>
              <h3>AI Workforce Summary</h3>
              <p>Dynamic assessment compiled from current database telemetry</p>
              {analysisTime && (
                <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "bold", display: "block", marginTop: "4px" }}>
                  🕒 AI Analysis generated on: {analysisTime}
                </span>
              )}
            </div>
          </div>
          <button className="ai-refresh-btn" onClick={() => refreshAll()}>
            <span>🔄</span> Re-Analyze
          </button>
        </div>
        
        <div className="summary-split-grid">
          <div className="summary-analysis-block">
            <div className="insights-bubble">
              <span className="bubble-icon">✨</span>
              <p>{getWorkforceHealthSummary()}</p>
            </div>
            <div className="insights-bubble">
              <span className="bubble-icon">🎯</span>
              <p>{getRecruitmentSummary()}</p>
            </div>
            <div className="insights-bubble">
              <span className="bubble-icon">🔑</span>
              <p>{getLeaveSummary()}</p>
            </div>
            <div className="insights-bubble">
              <span className="bubble-icon">📈</span>
              <p>{getPerformanceSummary()}</p>
            </div>
          </div>

          <div className="summary-alerts-block">
            <h4 className="block-title">⚠️ Real-Time Operational Alerts</h4>
            <div className="alerts-vertical-list">
              {getDynamicInsights().map((insight, idx) => (
                <div key={idx} className={`summary-alert-card ${insight.type}`}>
                  <span className="alert-emoji">{insight.emoji}</span>
                  <span>{insight.msg}</span>
                </div>
              ))}
              {employees.length > payrolls.length && (
                <div className="summary-alert-card info">
                  <span className="alert-emoji">💰</span>
                  <span>Payroll processing is pending for {employees.length - payrolls.length} employees.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🛡️ AI Attrition Risk & Wellness Sentinel */}
      <div className="ai-wellness-sentinel glass-card" style={{
        marginTop: "25px",
        marginBottom: "25px",
        padding: "24px",
        borderRadius: "var(--radius-lg)",
        background: theme === "dark" ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
        border: "1px solid " + (theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"),
        boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>🛡️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: theme === "dark" ? "#ffffff" : "#1e293b" }}>
                AI Attrition Risk & Wellness Sentinel
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                Burnout index calculated dynamically from overtime, leaves, and attendance telemetry
              </p>
            </div>
          </div>
          <button 
            onClick={fetchWellnessData} 
            disabled={loadingWellness}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.1)" : "#cbd5e1"),
              color: theme === "dark" ? "#cbd5e1" : "#475569",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            {loadingWellness ? "Analyzing..." : "🔄 Re-Analyze"}
          </button>
        </div>

        {loadingWellness ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: "13px" }}>
            <div className="spinner" style={{ border: "3px solid rgba(0,0,0,0.1)", width: "24px", height: "24px", borderRadius: "50%", borderLeftColor: "#3b82f6", animation: "spin 1s linear infinite", margin: "0 auto 10px auto" }}></div>
            Analyzing organization wellness indicators & telemetry...
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : wellnessData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-secondary)", fontSize: "13px" }}>
            No wellness data available. Add employees to start evaluation.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {wellnessData.map((data, idx) => {
              const riskColor = data.riskLevel === "HIGH" ? "#ef4444" : data.riskLevel === "MODERATE" ? "#f59e0b" : "#10b981";
              const riskBg = data.riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.1)" : data.riskLevel === "MODERATE" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)";
              return (
                <div 
                  key={idx} 
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                    border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.05)" : "#e2e8f0"),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "15px",
                    transition: "all 0.2s"
                  }}
                  className="wellness-card"
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: theme === "dark" ? "#ffffff" : "#1e293b" }}>
                          {data.employeeName}
                        </h4>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>
                          {data.department}
                        </p>
                      </div>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "9px",
                        fontWeight: "800",
                        color: riskColor,
                        background: riskBg,
                        textTransform: "uppercase"
                      }}>
                        {data.riskLevel} RISK
                      </span>
                    </div>

                    {/* Burnout Score Bar */}
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Burnout Index</span>
                        <strong style={{ color: riskColor }}>{data.burnoutIndex}%</strong>
                      </div>
                      <div style={{ height: "6px", width: "100%", background: theme === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${data.burnoutIndex}%`, background: riskColor, borderRadius: "3px", transition: "width 0.5s ease" }} />
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {data.riskFactors && data.riskFactors.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "5px" }}>
                        {data.riskFactors.map((factor, fIdx) => (
                          <span key={fIdx} style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "500",
                            background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                            color: theme === "dark" ? "#cbd5e1" : "#475569",
                            border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0")
                          }}>
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendation Bubble */}
                  <div style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
                    borderLeft: `3.5px solid ${riskColor}`,
                    fontSize: "11.5px",
                    color: theme === "dark" ? "#cbd5e1" : "#475569",
                    lineHeight: "1.4"
                  }}>
                    <strong style={{ display: "block", fontSize: "10px", color: riskColor, textTransform: "uppercase", marginBottom: "4px", fontWeight: "700" }}>
                      💡 Intervention Recommendation:
                    </strong>
                    {data.recommendedIntervention}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 Summary Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ background: stat.gradient, border: `1.5px solid ${stat.color}22` }}>
            <div className="stat-header">
              <span className="stat-icon" style={{ fontSize: "20px" }}>{stat.icon}</span>
              <span className="stat-trend" style={{ color: stat.color }}>{stat.trend}</span>
            </div>
            <div className="stat-body">
              <h2>{stat.count}</h2>
              <h3>{stat.title}</h3>
              <p>{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Main Split Columns */}
      <div className="dashboard-grid-main">
        {/* LEFT COLUMN: ANALYTICS & TABLES */}
        <div className="dashboard-column-left">
          
          {/* Recruitment Analytics */}
          <div className="dashboard-section glass-card">
            <div className="section-header">
              <h3>🎯 Recruitment Pipeline & Funnel Analysis</h3>
              <p>Workforce hiring pipelines and candidate selection status</p>
            </div>
            <div className="recruitment-funnel-container">
              {/* Visual Funnel Bar indicators */}
              <div className="funnel-bars-wrapper">
                {funnelData.map((item, idx) => {
                  const maxVal = Math.max(...funnelData.map(f => f.value)) || 1;
                  const widthPercent = (item.value / maxVal) * 100;
                  return (
                    <div key={idx} className="funnel-row">
                      <span className="funnel-stage-name">{item.name}</span>
                      <div className="funnel-bar-track">
                        <div 
                          className="funnel-bar-fill" 
                          style={{ 
                            width: `${widthPercent}%`, 
                            background: item.color,
                            boxShadow: `0 2px 8px ${item.color}44`
                          }} 
                        />
                      </div>
                      <span className="funnel-stage-val">{item.value} Candidates</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HR Interviews Section */}
          <div className="dashboard-section glass-card" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3>📅 Interview Schedule Center</h3>
                <p>Monitor daily workforce hiring schedules</p>
              </div>
              <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "3px", borderRadius: "8px" }}>
                {["today", "upcoming", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveInterviewTab(tab)}
                    style={{
                      padding: "6px 12px",
                      background: activeInterviewTab === tab ? "var(--bg-app)" : "transparent",
                      color: activeInterviewTab === tab ? "var(--text-primary)" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all 0.2s"
                    }}
                  >
                    {tab} ({
                      tab === "today" ? todayInterviews.length :
                      tab === "upcoming" ? upcomingInterviewsList.length :
                      completedInterviewsList.length
                    })
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "15px" }}>
              {(() => {
                const list = 
                  activeInterviewTab === "today" ? todayInterviews :
                  activeInterviewTab === "upcoming" ? upcomingInterviewsList :
                  completedInterviewsList;

                if (list.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-secondary)", fontStyle: "italic", fontSize: "13px" }}>
                      No {activeInterviewTab} interviews scheduled.
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {list.map((item, idx) => {
                      const candidate = recruitments.find(r => r.id === item.candidateId);
                      return (
                        <div 
                          key={idx} 
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 15px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "10px",
                            flexWrap: "wrap",
                            gap: "10px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: activeInterviewTab === "completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                              color: activeInterviewTab === "completed" ? "#10b981" : "#3b82f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: "14px"
                            }}>
                              {(candidate?.candidateName || "C").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "700" }}>{candidate?.candidateName || "Candidate"}</h4>
                              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>Role: {candidate?.position || "Not Specified"}</p>
                              {item.meetingLink && (
                                <p style={{ margin: "2px 0 0 0", fontSize: "11px" }}>
                                  <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", fontWeight: "600" }}>
                                    Join Interview Link
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "12px", textAlign: "right" }}>
                            <span style={{ fontWeight: "700" }}>{item.interviewTime}</span>
                            <span style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "2px" }}>{item.interviewDate} ({item.interviewType})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Attendance & Leave Analytics */}
          <div className="dashboard-grid-inner-two">
            {/* Payroll Spend Area chart */}
            <div className="dashboard-section glass-card">
              <div className="section-header">
                <h3>💰 Payroll Spend Analysis</h3>
                <p>Net salary spend comparison across payroll logs</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={payrollTrend}>
                    <defs>
                      <linearGradient id="colorSalaryDashboard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }} />
                    <Area type="monotone" dataKey="Salary" stroke="var(--accent-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalaryDashboard)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Ratings Bar chart */}
            <div className="dashboard-section glass-card">
              <div className="section-header">
                <h3>⭐ Performance Overview</h3>
                <p>Ratings logged in peer performance reviews</p>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ratingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 5]} />
                    <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
                    <Bar dataKey="Score" fill="var(--accent-secondary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Leave Management & Recent Employees */}
          <div className="dashboard-grid-inner-two">
            {/* Leaves queue */}
            <div className="dashboard-section glass-card">
              <div className="section-header">
                <h3>🌴 Leave Approval Queue</h3>
                <p>Absence logs requiring reviews</p>
              </div>
              <div className="leaves-list">
                {pendingLeaves.length > 0 ? (
                  pendingLeaves.map((leave) => (
                    <div key={leave.id} className="leave-queue-card">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div className="leave-avatar">
                          {leave.employeeName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{leave.employeeName}</h4>
                          <p>{leave.fromDate} to {leave.toDate}</p>
                        </div>
                      </div>
                      <div className="queue-actions">
                        <button className="approve-small-btn" onClick={() => handleApproveLeave(leave.id)}>Approve</button>
                        <button className="reject-small-btn" onClick={() => handleRejectLeave(leave.id)}>Reject</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-panel">
                    <span>🎉</span>
                    <p>All leaves requests are resolved.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Department Health Score Cards */}
            <div className="dashboard-section glass-card">
              <div className="section-header">
                <h3>🏢 Department Health Scores</h3>
                <p>Calculated based on attendance, performance, and leaves</p>
              </div>
              <div className="dept-health-wrapper" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
                {deptHealthData.length === 0 ? (
                  <div style={{ padding: "10px 0", color: "var(--text-secondary)", fontSize: "13px" }}>
                    Insufficient data to calculate department health score.
                  </div>
                ) : (
                  deptHealthData.map((dept, idx) => (
                    <div key={idx} className="dept-health-item" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700" }}>
                        <span>{dept.name} {dept.statusColor}</span>
                        <span style={{ color: dept.color }}>
                          {dept.score}% ({dept.status})
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                        <div 
                          style={{ 
                            width: `${dept.score}%`, 
                            height: "100%", 
                            background: dept.color,
                            borderRadius: "4px",
                            transition: "width 0.5s ease-in-out"
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        {dept.insight}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECS, NOTIFICATIONS, QUICK ACTIONS */}
        <div className="dashboard-column-right">
          
          {/* Quick Actions Panel */}
          <div className="dashboard-section glass-card">
            <div className="section-header">
              <h3>⚡ Quick Actions</h3>
              <p>Direct workforce operations triggers</p>
            </div>
            <div className="actions-list">
              <button className="action-item-btn" onClick={() => navigate("/employees")}>
                <span>👨‍💼</span>
                <div>
                  <h4>Add Employee</h4>
                  <p>Register new staff directory profile</p>
                </div>
              </button>
              <button className="action-item-btn" onClick={() => navigate("/recruitment")}>
                <span>📢</span>
                <div>
                  <h4>Post Job</h4>
                  <p>Publish active openings to pipeline</p>
                </div>
              </button>
              <button className="action-item-btn" onClick={() => navigate("/leave")}>
                <span>📋</span>
                <div>
                  <h4>Review Leave Requests</h4>
                  <p>Approve absence log submissions</p>
                </div>
              </button>
              <button className="action-item-btn" onClick={() => navigate("/recruitment")}>
                <span>📄</span>
                <div>
                  <h4>View Applications</h4>
                  <p>Check candidate profile queues</p>
                </div>
              </button>
              <button className="action-item-btn" onClick={() => navigate("/payroll")}>
                <span>💰</span>
                <div>
                  <h4>Manage Payroll</h4>
                  <p>Calculate salaries & verify sheets</p>
                </div>
              </button>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="dashboard-section glass-card">
            <div className="section-header">
              <h3>💡 AI Recommendations</h3>
              <p>Optimization triggers tailored to current telemetry</p>
            </div>
            <div className="ai-recs-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {getAIRecommendations().map((rec, idx) => (
                <div key={idx} className="ai-rec-item" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "12.5px", margin: 0, color: "var(--text-primary)", lineHeight: "1.4" }}>{rec.msg}</p>
                  <button 
                    className="ai-action-btn"
                    onClick={() => {
                      if (rec.type === "leaves") navigate("/leave");
                      else if (rec.type === "recruitment") navigate("/recruitment");
                      else if (rec.type === "performance" || rec.type === "training" || rec.type === "general") navigate("/performance");
                      else navigate("/dashboard");
                    }}
                    style={{ alignSelf: "flex-end", padding: "5px 10px", fontSize: "11px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}
                  >
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Center */}
          <div className="dashboard-section glass-card">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>🔔 Notification Center</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notif-badge-bubble">{notifications.filter(n => !n.read).length} Unread</span>
              )}
            </div>
            <div className="notif-list-vertical" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    style={{ 
                      padding: "12px", 
                      border: "1px solid var(--border-color)", 
                      borderRadius: "8px", 
                      background: notif.read ? "transparent" : "var(--bg-app)",
                      opacity: notif.read ? 0.75 : 1,
                      position: "relative"
                    }}
                  >
                    {!notif.read && <span style={{ position: "absolute", top: "12px", right: "12px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }} />}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "800", margin: 0 }}>
                        {notif.type === "candidate" && "🔔 New Candidate"}
                        {notif.type === "leave" && "🔔 Leave Request"}
                        {notif.type === "attendance" && "⚠️ Attendance Alert"}
                        {notif.type === "interview" && "📅 Interview Schedule"}
                      </h4>
                      <small style={{ fontSize: "10.5px", color: "var(--text-secondary)" }}>{notif.time}</small>
                    </div>
                    <p style={{ fontSize: "12px", margin: 0, color: "var(--text-primary)", lineHeight: "1.4" }}>{notif.msg}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  No recent notifications.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Styling Blocks */}
      <style>{`
        .dashboard-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding-bottom: 50px;
        }

        /* 🚀 Hero Banner */
        .hero-card {
          position: relative;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          border-radius: var(--radius-lg);
          padding: 30px 40px;
          color: white;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(124, 58, 237, 0.25);
          animation: fadeUp .5s ease;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .hero-content h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }

        .hero-content p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 12.5px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
          z-index: 1;
        }

        /* 🧠 AI Workforce Summary styling */
        .ai-workforce-summary {
          background: var(--bg-panel);
          border: var(--card-border);
          border-radius: var(--radius-lg);
          padding: 25px;
          box-shadow: var(--shadow-md);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          font-size: 26px;
        }

        .header-brand h3 {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 2px;
        }

        .header-brand p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-refresh-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);
          transition: transform 0.15s;
        }

        .ai-refresh-btn:hover {
          transform: translateY(-1px);
        }

        .summary-split-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 25px;
        }

        @media (max-width: 900px) {
          .summary-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .summary-analysis-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insights-bubble {
          display: flex;
          gap: 12px;
          background: var(--bg-app);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          align-items: center;
        }

        .bubble-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .insights-bubble p {
          font-size: 13px;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .summary-alerts-block {
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .block-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .alerts-vertical-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-alert-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .summary-alert-card.danger {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .summary-alert-card.warning {
          background: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.15);
          color: #d97706;
        }

        .summary-alert-card.success {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .summary-alert-card.info {
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        /* 📊 Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
        }

        .stat-card {
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 140px;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-trend {
          font-size: 11px;
          font-weight: 800;
        }

        .stat-body h2 {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 2px;
          letter-spacing: -0.03em;
        }

        .stat-body h3 {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .stat-body p {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Main split columns */
        .dashboard-grid-main {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 25px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .dashboard-grid-main {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-column-left,
        .dashboard-column-right {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .dashboard-section {
          padding: 22px;
          border-radius: var(--radius-lg);
          background: var(--bg-panel);
          border: var(--card-border);
          box-shadow: var(--shadow-md);
        }

        .section-header {
          margin-bottom: 18px;
        }

        .section-header h3 {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 4px;
        }

        .section-header p {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        .dashboard-grid-inner-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .dashboard-grid-inner-two {
            grid-template-columns: 1fr;
          }
        }

        /* Funnel Progress indicator */
        .recruitment-funnel-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .funnel-bars-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .funnel-row {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 12px;
          font-weight: 600;
        }

        .funnel-stage-name {
          width: 130px;
          text-align: right;
          color: var(--text-secondary);
        }

        .funnel-bar-track {
          flex: 1;
          height: 12px;
          background: var(--border-color);
          border-radius: 6px;
          overflow: hidden;
        }

        .funnel-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .funnel-stage-val {
          width: 100px;
          color: var(--text-primary);
        }

        /* Leaves approval item */
        .leaves-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          max-height: 250px;
        }

        .leave-queue-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .leave-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12.5px;
        }

        .leave-queue-card h4 {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 2px;
        }

        .leave-queue-card p {
          font-size: 11px;
          color: var(--text-secondary);
          margin: 0;
        }

        .queue-actions {
          display: flex;
          gap: 8px;
        }

        .approve-small-btn {
          background: var(--accent-success);
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .reject-small-btn {
          background: var(--accent-danger);
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-panel {
          text-align: center;
          padding: 20px;
          color: var(--text-secondary);
        }

        .empty-panel span {
          font-size: 28px;
          display: block;
          margin-bottom: 6px;
        }

        /* Quick Actions list styling */
        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-item-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .action-item-btn:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary);
          background: var(--bg-panel);
          box-shadow: var(--shadow-sm);
        }

        .action-item-btn span {
          font-size: 18px;
          flex-shrink: 0;
        }

        .action-item-btn h4 {
          font-size: 12.5px;
          font-weight: 700;
          margin: 0 0 2px;
          color: var(--text-primary);
        }

        .action-item-btn p {
          font-size: 10.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Notifications unread badge styling */
        .notif-badge-bubble {
          font-size: 10.5px;
          font-weight: 800;
          color: white;
          background: #ef4444;
          padding: 3px 8px;
          border-radius: 12px;
        }

        /* 🗓️ Grid Section */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .dashboard-grid.two-columns {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 900px) {
          .dashboard-grid, .dashboard-grid.two-columns {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-section {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .section-header p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .chart-wrapper {
          padding-top: 10px;
        }

        /* Recent employees */
        .recent-employees-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: 250px;
        }

        .emp-row-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-app);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-secondary), #c084fc);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
        }

        .emp-row-card h4 {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .emp-row-card p {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Announcements */
        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .announcement-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .ann-date {
          background: rgba(124, 58, 237, 0.1);
          color: var(--accent-secondary);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
          min-width: 60px;
          flex-shrink: 0;
        }

        .announcement-item h4 {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .announcement-item p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* AI Insights Panel Styling */
        .ai-insights-panel {
          grid-column: span 2;
          padding: 30px;
          margin-bottom: 30px;
          border-radius: var(--radius-lg);
          background: var(--bg-panel);
          border: var(--card-border);
          box-shadow: var(--shadow-md);
        }

        .ai-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .ai-header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ai-sparkle {
          font-size: 28px;
        }

        .ai-header-left h3 {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .ai-header-left p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .ai-refresh-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);
          transition: transform 0.15s;
        }

        .ai-refresh-btn:hover {
          transform: translateY(-1px);
        }

        .ai-insights-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 30px;
        }

        @media (max-width: 1024px) {
          .ai-insights-grid {
            grid-template-columns: 1fr;
          }
        }

        .ai-executive-summary {
          background: rgba(37, 99, 235, 0.03);
          border-left: 4px solid var(--accent-primary);
          padding: 15px 20px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 25px;
        }

        .ai-alerts-section {
          margin-bottom: 25px;
        }

        .ai-alerts-section h4 {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }

        .ai-alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 15px;
        }

        .ai-alert-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .ai-alert-card.danger {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .ai-alert-card.danger h5 {
          color: #ef4444;
        }

        .ai-alert-card.warning {
          background: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .ai-alert-card.warning h5 {
          color: #f59e0b;
        }

        .ai-alert-card.info {
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .ai-alert-card.info h5 {
          color: #3b82f6;
        }

        .ai-alert-card.success {
          background: rgba(34, 197, 94, 0.05);
          border-color: rgba(34, 197, 94, 0.2);
        }

        .ai-alert-card.success h5 {
          color: #22c55e;
        }

        .alert-badge-icon {
          font-size: 20px;
        }

        .ai-alert-card h5 {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .ai-alert-card p {
          font-size: 11px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-recs-section h4 {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }

        .ai-recs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-rec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(0,0,0,0.01);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          gap: 15px;
        }

        .ai-rec-text {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .rec-bullet {
          color: var(--accent-secondary);
          font-weight: bold;
        }

        .ai-rec-item p {
          font-size: 12.5px;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.5;
        }

        .ai-action-btn {
          padding: 6px 12px;
          background: var(--stat-card-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, border-color 0.2s;
        }

        .ai-action-btn:hover {
          background: var(--border-color);
          border-color: var(--text-secondary);
        }

        .ai-insights-right h4 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .ai-insights-right .chart-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .chart-container-box {
          background: var(--stat-card-bg);
          border: var(--card-border);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .chart-legend-labels {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
        }

        .legend-label-item {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .legend-dot.primary {
          background: var(--accent-primary);
        }

        .legend-dot.secondary {
          background: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}

export default Dashboard;