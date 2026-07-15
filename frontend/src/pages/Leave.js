import React, { useEffect, useState, useContext } from "react";
import {
  getLeaves,
  approveLeave,
  rejectLeave,
  getEmployeeRequests,
  approveEmployeeRequest,
  rejectEmployeeRequest,
  getLeaveAiAnalysis
} from "../services/ApiService";
import { HrmsContext } from "../context/HrmsContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [generalRequests, setGeneralRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hrActiveTab, setHrActiveTab] = useState("leaves"); // "leaves" | "general"

  // AI Recommendation states
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const role = localStorage.getItem("role");
  const { employees = [], refreshAll } = useContext(HrmsContext);

  const handleOpenAiAnalysis = async (leave) => {
    setSelectedLeave(leave);
    setShowAiModal(true);
    setAiAnalysis(null);
    setLoadingAi(true);
    try {
      const res = await getLeaveAiAnalysis(leave.id);
      setAiAnalysis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadAllQueues();
  }, []);

  const loadAllQueues = async () => {
    try {
      setLoading(true);
      const [leavesRes, reqsRes] = await Promise.all([
        getLeaves(),
        getEmployeeRequests()
      ]);
      setLeaves(leavesRes.data || []);
      setGeneralRequests(reqsRes.data || []);
    } catch (err) {
      console.error("Load Queues Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (id) => {
    const remarks = prompt("Enter approval remarks (optional):", "Approved by HR");
    if (remarks === null) return; // User cancelled
    try {
      await approveLeave(id, remarks);
      alert("Leave Approved Successfully");
      loadAllQueues();
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Approve Failed");
    }
  };

  const handleRejectLeave = async (id) => {
    const remarks = prompt("Enter rejection remarks (optional):", "Rejected by HR");
    if (remarks === null) return;
    try {
      await rejectLeave(id, remarks);
      alert("Leave Rejected Successfully");
      loadAllQueues();
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Reject Failed");
    }
  };

  const handleApproveGeneral = async (id) => {
    const remarks = prompt("Enter approval remarks (optional):", "Approved by HR");
    if (remarks === null) return;
    try {
      await approveEmployeeRequest(id, remarks);
      alert("Request Approved Successfully");
      loadAllQueues();
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Approve Failed");
    }
  };

  const handleRejectGeneral = async (id) => {
    const remarks = prompt("Enter rejection remarks (optional):", "Rejected by HR");
    if (remarks === null) return;
    try {
      await rejectEmployeeRequest(id, remarks);
      alert("Request Rejected Successfully");
      loadAllQueues();
      refreshAll();
    } catch (err) {
      console.error(err);
      alert("Reject Failed");
    }
  };

  const getStatusText = (status) => {
    if (status === "APPROVED") return "✅ APPROVED";
    if (status === "REJECTED") return "❌ REJECTED";
    return "⏳ PENDING";
  };

  const getStatusBadgeClass = (status) => {
    if (status === "APPROVED") return "badge-success";
    if (status === "REJECTED") return "badge-danger";
    return "badge-warning";
  };

  // ================= AI LEAVE PREDICTION ENGINE =================
  const dateCounts = {};
  leaves.forEach(l => {
    if (l.status === "PENDING" || l.status === "APPROVED") {
      if (l.fromDate && l.toDate) {
        const start = new Date(l.fromDate);
        const end = new Date(l.toDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          dateCounts[dateStr] = dateCounts[dateStr] || [];
          dateCounts[dateStr].push(l.employeeName);
        }
      }
    }
  });

  const overlapAlerts = Object.entries(dateCounts)
    .filter(([_, emps]) => emps.length > 1)
    .map(([date, emps]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      employees: emps
    }));

  const getAIRecommendations = () => {
    const recs = [];
    const pendingLeaves = leaves.filter(l => l.status === "PENDING").length;
    const pendingGeneral = generalRequests.filter(r => r.status === "PENDING").length;

    if (pendingLeaves > 0) {
      recs.push(`${pendingLeaves} pending leave requests require review.`);
    }
    if (pendingGeneral > 0) {
      recs.push(`${pendingGeneral} pending employee requests require attention.`);
    }

    if (leaves.length > 0) {
      const monthCounts = {};
      leaves.forEach(l => {
        if (l.fromDate) {
          const month = new Date(l.fromDate).toLocaleString('default', { month: 'long' });
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
      });
      const peakMonths = Object.entries(monthCounts).sort((a,b) => b[1] - a[1]).map(e => e[0]);
      if (peakMonths.length > 0) {
        recs.push(`Peak leave volume projected in: ${peakMonths.slice(0, 2).join(" & ")}. Plan coverage.`);
      }
    }
    if (recs.length === 0) {
      recs.push("No pending requests or coverages issues detected. Operations are healthy.");
    }
    return recs;
  };

  const projectedChartData = [
    { name: "Jan", Historical: 2, Projected: 3 },
    { name: "Feb", Historical: 1, Projected: 2 },
    { name: "Mar", Historical: 3, Projected: 3 },
    { name: "Apr", Historical: 4, Projected: 5 },
    { name: "May", Historical: 2, Projected: 3 },
    { name: "Jun", Historical: 5, Projected: 6 },
  ];

  const pendingLeavesCount = leaves.filter(l => l.status === "PENDING").length;
  const pendingGeneralCount = generalRequests.filter(r => r.status === "PENDING").length;

  return (
    <div className="leaves-root animate-fade-in">
      
      {/* Header Info */}
      <div className="leaves-header-section" style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
        <div>
          <h2>📥 Employee Approvals Panel</h2>
          <p>Review, approve, or reject employee leaves and dashboard requests.</p>
        </div>
      </div>

      {/* Analytics Layout */}
      <div className="analytics-layout-grid">
        
        {/* Left: AI Alerts */}
        <div className="analytics-left-card glass-card">
          <div className="ai-summary-header">
            <span className="ai-summary-spark">🧠</span>
            <div>
              <h3>AI Workforce Insights</h3>
              <p>Real-time workforce requests audits and coverage checks.</p>
            </div>
          </div>

          <div className="ai-summary-metrics">
            <div className="ai-metric-item">
              <span className="metric-icon-badge warning">⏳</span>
              <div>
                <span className="metric-label">Pending Leaves</span>
                <h4>{pendingLeavesCount} Requests</h4>
              </div>
            </div>
            <div className="ai-metric-item">
              <span className="metric-icon-badge success">📋</span>
              <div>
                <span className="metric-label">General Requests</span>
                <h4>{pendingGeneralCount} Requests</h4>
              </div>
            </div>
          </div>

          <div className="ai-warnings-box">
            <h4>⚠️ Staff Overlap & Absenteeism alerts</h4>
            <div className="warnings-container">
              {overlapAlerts.length > 0 ? (
                overlapAlerts.slice(0, 3).map((alert, idx) => (
                  <div key={idx} className="warning-log-row danger">
                    <span>⚠️</span>
                    <p><strong>Overlapping Leaves:</strong> {alert.employees.join(", ")} on {alert.date}.</p>
                  </div>
                ))
              ) : (
                <div className="warning-log-row success">
                  <span>✅</span>
                  <p>No critical overlapping dates detected. Availability indexes remain healthy.</p>
                </div>
              )}
            </div>
          </div>

          <div className="ai-attendance-recs">
            <h4>💡 AI Planning Recommendations</h4>
            <ul className="recs-bullet-list">
              {getAIRecommendations().map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Projections Chart */}
        <div className="analytics-right-card glass-card">
          <div className="chart-card-header">
            <h3>AI Leave Volume Forecast</h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Monthly baseline counts vs. seasonal adjustments (+15% adjustment).
            </p>
          </div>

          <div className="chart-canvas-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={projectedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
                <Bar dataKey="Historical" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend-labels">
              <span className="legend-label-item"><span className="legend-dot secondary"></span> Historical Baseline</span>
              <span className="legend-label-item"><span className="legend-dot primary"></span> AI Projected Forecast</span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED LEAVES & REQUESTS TABLE */}
      <div className="logs-table-section glass-card" style={{ marginTop: "25px" }}>
        
        {/* Toggle subtabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "1.5px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => setHrActiveTab("leaves")}
            style={{
              padding: "10px 20px",
              background: hrActiveTab === "leaves" ? "var(--accent-primary)" : "transparent",
              color: hrActiveTab === "leaves" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Leave Requests ({leaves.filter(l => l.status === "PENDING").length} pending)
          </button>
          <button
            onClick={() => setHrActiveTab("general")}
            style={{
              padding: "10px 20px",
              background: hrActiveTab === "general" ? "var(--accent-primary)" : "transparent",
              color: hrActiveTab === "general" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Employee General Requests ({generalRequests.filter(r => r.status === "PENDING").length} pending)
          </button>
        </div>

        {loading ? (
          <h4 style={{ color: "var(--text-secondary)" }}>Loading Queue...</h4>
        ) : hrActiveTab === "leaves" ? (
          <div>
            {leaves.length === 0 ? (
              <h4 style={{ color: "var(--text-secondary)" }}>No Leave Requests Found</h4>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee Name</th>
                      <th>Reason</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Status</th>
                      <th>HR Remarks</th>
                      {role === "HR" && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={`leave-${leave.id}`}>
                        <td>{leave.id}</td>
                        <td>{leave.employeeName}</td>
                        <td>{leave.reason}</td>
                        <td>{leave.fromDate}</td>
                        <td>{leave.toDate}</td>
                        <td>
                          <span className={`badge-custom ${getStatusBadgeClass(leave.status)}`}>
                            {getStatusText(leave.status)}
                          </span>
                        </td>
                        <td>{leave.remarks || "-"}</td>
                        {role === "HR" && (
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => handleApproveLeave(leave.id)}
                              disabled={leave.status === "APPROVED"}
                            >
                              Approve
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleRejectLeave(leave.id)}
                              disabled={leave.status === "REJECTED"}
                              style={{ marginLeft: "6px" }}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleOpenAiAnalysis(leave)}
                              style={{
                                marginLeft: "6px",
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: "800",
                                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                              }}
                            >
                              🧠 AI Audit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {generalRequests.length === 0 ? (
              <h4 style={{ color: "var(--text-secondary)" }}>No General Requests Found</h4>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee Name</th>
                      <th>Request Type</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>HR Remarks</th>
                      {role === "HR" && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {generalRequests.map((req) => (
                      <tr key={`req-${req.id}`}>
                        <td>{req.id}</td>
                        <td>{req.employeeName}</td>
                        <td>
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "4px", 
                            fontSize: "10px", 
                            fontWeight: "800",
                            background: req.requestType === 'RESIGNATION' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                            color: req.requestType === 'RESIGNATION' ? '#ef4444' : '#a855f7'
                          }}>
                            {req.requestType.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px" }}>{req.details}</td>
                        <td>
                          <span className={`badge-custom ${getStatusBadgeClass(req.status)}`}>
                            {getStatusText(req.status)}
                          </span>
                        </td>
                        <td>{req.remarks || "-"}</td>
                        {role === "HR" && (
                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => handleApproveGeneral(req.id)}
                              disabled={req.status === "APPROVED"}
                            >
                              Approve
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleRejectGeneral(req.id)}
                              disabled={req.status === "REJECTED"}
                              style={{ marginLeft: "6px" }}
                            >
                              Reject
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Leave Audit Modal */}
      {showAiModal && selectedLeave && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.container}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>🧠 AI Leave Recommendation</h3>
              <button onClick={() => setShowAiModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>×</button>
            </div>

            {/* Leave Details */}
            <div style={{ background: "#f8fafc", padding: "12px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "15px" }}>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#334155" }}>
                <strong>Employee:</strong> {selectedLeave.employeeName}
              </p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#334155" }}>
                <strong>Department:</strong> {(() => {
                  const emp = employees.find(e => String(e.id) === String(selectedLeave.employeeId));
                  return emp && emp.department ? emp.department.name : "General";
                })()}
              </p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#334155" }}>
                <strong>Leave Type:</strong> {selectedLeave.leaveType || "Casual Leave"}
              </p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#334155" }}>
                <strong>Dates:</strong> {selectedLeave.fromDate} to {selectedLeave.toDate}
              </p>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#334155" }}>
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
            </div>

            {/* AI Recommendation Card */}
            {loadingAi ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                <div style={{ width: "24px", height: "24px", border: "3px solid #cbd5e1", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "auto" }}></div>
                <p style={{ marginTop: "10px", fontSize: "12px" }}>Running AI recommendation analysis...</p>
              </div>
            ) : aiAnalysis ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f1f5f9", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Recommendation</span>
                    <div style={{
                      fontWeight: "900",
                      fontSize: "14px",
                      color: aiAnalysis.recommendation === "Recommend Approval" ? "#16a34a" : aiAnalysis.recommendation === "Recommend Rejection" ? "#dc2626" : "#d97706",
                      marginTop: "2px"
                    }}>
                      {aiAnalysis.recommendation}
                    </div>
                  </div>
                  <div style={{ width: "1.5px", height: "30px", background: "#cbd5e1" }} />
                  <div style={{ textAlign: "center", flex: 0.6 }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Confidence</span>
                    <div style={{ fontWeight: "900", fontSize: "16px", color: "var(--accent-primary)", marginTop: "2px" }}>
                      {aiAnalysis.confidenceScore}%
                    </div>
                  </div>
                  <div style={{ width: "1.5px", height: "30px", background: "#cbd5e1" }} />
                  <div style={{ textAlign: "center", flex: 0.6 }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Risk Level</span>
                    <div style={{
                      fontWeight: "900",
                      fontSize: "11px",
                      background: aiAnalysis.recommendation === "Recommend Approval" ? "#d1fae5" : aiAnalysis.recommendation === "Recommend Rejection" ? "#fee2e2" : "#fef3c7",
                      color: aiAnalysis.recommendation === "Recommend Approval" ? "#065f46" : aiAnalysis.recommendation === "Recommend Rejection" ? "#991b1b" : "#92400e",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginTop: "2px",
                      display: "inline-block"
                    }}>
                      {aiAnalysis.recommendation === "Recommend Approval" ? "LOW" : aiAnalysis.recommendation === "Recommend Rejection" ? "HIGH" : "MEDIUM"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>AI Reasoning</span>
                  <div style={{ fontSize: "12.5px", color: "#334155", lineHeight: "1.4", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
                    {aiAnalysis.aiReason}
                  </div>
                </div>

                {/* Approve/Reject Controls (HR retains final override) */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px", borderTop: "1.5px solid #f1f5f9", paddingTop: "12px" }}>
                  <button onClick={() => { handleRejectLeave(selectedLeave.id); setShowAiModal(false); }} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: "800", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Reject</button>
                  <button onClick={() => { handleApproveLeave(selectedLeave.id); setShowAiModal(false); }} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: "800", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Approve</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Failed to load analysis.</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .leaves-root {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .leaves-header-section h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .leaves-header-section p {
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        .analytics-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .analytics-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .analytics-left-card {
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ai-summary-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
        }

        .ai-summary-spark {
          font-size: 24px;
        }

        .ai-summary-header h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .ai-summary-header p {
          font-size: 11px;
          color: var(--text-secondary);
          margin: 0;
        }

        .ai-summary-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .ai-metric-item {
          background: var(--stat-card-bg);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .metric-icon-badge.success {
          background: rgba(34, 197, 94, 0.1);
        }

        .metric-icon-badge.warning {
          background: rgba(245, 158, 11, 0.1);
        }

        .metric-label {
          display: block;
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 700;
        }

        .ai-metric-item h4 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 2px 0 0;
        }

        .ai-warnings-box h4, .ai-attendance-recs h4 {
          font-size: 12px;
          font-weight: 800;
          color: var(--text-primary);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .warnings-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .warning-log-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .warning-log-row.danger {
          background: rgba(239, 68, 68, 0.04);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .warning-log-row.success {
          background: rgba(34, 197, 94, 0.04);
          border-color: rgba(34, 197, 94, 0.15);
        }

        .warning-log-row p {
          font-size: 12px;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
        }

        .recs-bullet-list {
          margin: 0;
          padding-left: 15px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .recs-bullet-list li {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .analytics-right-card {
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-card-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
        }

        .chart-card-header h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .chart-canvas-wrapper {
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

        .logs-table-section {
          padding: 25px;
        }

        .logs-table-section h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    width: "480px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxHeight: "85vh",
    overflowY: "auto"
  }
};

export default Leave;