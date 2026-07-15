import React, { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import { saveAttendanceInsight } from "../services/ApiService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

function Attendance() {
  const {
    employees = [],
    attendance = [],
    departments = [],
    leaves = [],
    refreshAll
  } = useContext(HrmsContext);

  const [search, setSearch] = useState("");
  const [activeChartTab, setActiveChartTab] = useState("trend"); // trend | department

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper getters for flat or nested JSON mapping
  const getEmpId = (a) => a.employeeId || a.employee?.id || "-";
  const getEmpName = (a) => a.employeeName || a.employee?.name || `Emp ID ${getEmpId(a)}`;

  // Attendance metrics calculations
  const attendanceLogs = attendance || [];

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todayLogs = attendanceLogs.filter(a => isToday(a.date));

  // Punctuality: Late arrival definition (status is late, or check-in > 09:30:00)
  const lateCheckins = todayLogs.filter(a => {
    const statusLower = a.status?.toLowerCase();
    if (statusLower === "late" || statusLower?.includes("late") || statusLower === "absent") return true;
    if (a.checkIn) {
      const parts = a.checkIn.split(":");
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (hours > 9 || (hours === 9 && minutes > 30)) return true;
    }
    return false;
  });

  // Calculate overall punctuality rate
  const punctualityRate = todayLogs.length > 0 
    ? ((todayLogs.length - lateCheckins.length) / todayLogs.length) * 100 
    : 100;

  // Count late arrivals per employee
  const lateCounts = {};
  lateCheckins.forEach(a => {
    const name = getEmpName(a);
    lateCounts[name] = (lateCounts[name] || 0) + 1;
  });
  const frequentLatecomers = Object.entries(lateCounts)
    .filter(([_, count]) => count >= 1)
    .map(([name, count]) => ({ name, count }));

  // Absenteeism patterns for the current date
  const absenteeismList = employees.map(emp => {
    const checkedInToday = todayLogs.some(a => String(getEmpId(a)) === String(emp.id) && (a.status === "Present" || a.status?.toUpperCase() === "PRESENT"));
    const isOnLeaveToday = leaves.some(l => 
      (String(l.employeeId) === String(emp.id) || String(l.employee?.id) === String(emp.id)) &&
      l.status?.toUpperCase() === "APPROVED" &&
      isToday(l.fromDate)
    );
    return {
      name: emp.name,
      percentage: checkedInToday ? 100 : 0,
      missed: checkedInToday || isOnLeaveToday ? 0 : 1,
      isOnLeave: isOnLeaveToday
    };
  }).filter(e => e.missed > 0);

  // Historical logs count for department-wise attendance rates
  const empLogsCount = {};
  attendanceLogs.forEach(a => {
    const empId = getEmpId(a);
    empLogsCount[empId] = (empLogsCount[empId] || 0) + 1;
  });
  const targetDays = 5;

  // Department-wise attendance rates
  const deptAnalysis = departments.map(d => {
    const deptEmployees = employees.filter(e => e.department?.departmentId === d.departmentId || e.department?.departmentName === d.departmentName);
    let totalLogsExpected = deptEmployees.length * targetDays;
    let actualLogsCount = 0;
    deptEmployees.forEach(e => {
      actualLogsCount += empLogsCount[e.id] || 0;
    });
    const rate = totalLogsExpected > 0 ? Math.round((actualLogsCount / totalLogsExpected) * 100) : 100;
    return {
      name: d.departmentName,
      Rate: rate
    };
  });

  const chartBarData = deptAnalysis.length > 0 ? deptAnalysis : [
    { name: "Engineering", Rate: 94 },
    { name: "HR", Rate: 90 },
    { name: "Sales", Rate: 80 }
  ];

  // Daily Check-in Volume Trend
  const dateLogs = {};
  attendanceLogs.forEach(a => {
    if (a.date) {
      dateLogs[a.date] = (dateLogs[a.date] || 0) + 1;
    }
  });
  const trendChartData = Object.entries(dateLogs)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      "Present Count": count
    }));

  const getAIRecommendations = () => {
    const recs = [];
    if (frequentLatecomers.length > 0) {
      recs.push(`Today's late arrivals flagged for: ${frequentLatecomers.map(l => `${l.name}`).join(", ")}. Coordinate on check-in policy expectations.`);
    }
    if (absenteeismList.length > 0) {
      recs.push(`Unexcused absences flagged today for: ${absenteeismList.map(a => a.name).join(", ")}. Follow up to verify check-in logs.`);
    }
    if (recs.length === 0) {
      recs.push("Today's check-ins align perfectly with target objectives. Suggest rewarding team punctuality.");
    }
    return recs;
  };

  useEffect(() => {
    if (todayLogs.length > 0) {
      const punctuality = todayLogs.length > 0
        ? Math.round(((todayLogs.length - frequentLatecomers.reduce((s, c) => s + c.count, 0)) / todayLogs.length) * 100)
        : 100;
      const warningsText = absenteeismList.map(a => `${a.name} absent today`).join(", ") || "No absenteeism alerts";
      const recommendationsText = getAIRecommendations().join(" | ");

      saveAttendanceInsight({
        punctualityRate: punctuality,
        lateLogsFlagged: frequentLatecomers.reduce((s, c) => s + c.count, 0),
        warnings: warningsText,
        recommendations: recommendationsText
      }).catch(err => console.error("Error saving Attendance AI Insight:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayLogs.length, frequentLatecomers.length]);

  // Search filtering
  const filteredLogs = attendanceLogs.filter(a => 
    getEmpName(a).toLowerCase().includes(search.toLowerCase()) ||
    String(getEmpId(a)).includes(search)
  );

  return (
    <div className="attendance-root animate-fade-in">
      <div className="attendance-header-section">
        <h2>Attendance Analytics Dashboard</h2>
        <p>Monitor organizational punctuality, inspect check-in volume, and detect absenteeism patterns.</p>
      </div>

      {/* AI Attendance Analytics Layout Grid */}
      <div className="analytics-layout-grid">
        
        {/* Left: AI Punctuality Summary Card */}
        <div className="analytics-left-card glass-card">
          <div className="ai-summary-header">
            <span className="ai-summary-spark">🧠</span>
            <div>
              <h3>AI Attendance Intelligence</h3>
              <p>Automated punctuality anomalies and staff presence insights.</p>
            </div>
          </div>

          <div className="ai-summary-metrics">
            <div className="ai-metric-item">
              <span className="metric-icon-badge success">📈</span>
              <div>
                <span className="metric-label">Overall Punctuality</span>
                <h4 style={{ color: punctualityRate < 90 ? "var(--accent-danger)" : "var(--accent-success)" }}>
                  {punctualityRate.toFixed(1)}%
                </h4>
              </div>
            </div>

            <div className="ai-metric-item">
              <span className="metric-icon-badge warning">⏰</span>
              <div>
                <span className="metric-label">Late Logs Flagged</span>
                <h4>{lateCheckins.length} check-ins</h4>
              </div>
            </div>
          </div>

          {/* Warnings List */}
          <div className="ai-warnings-box">
            <h4>⚠️ Punctuality & Absence Warnings</h4>
            <div className="warnings-container">
              {frequentLatecomers.length > 0 && (
                <div className="warning-log-row danger">
                  <span>⏰</span>
                  <p><strong>Late Check-ins Today:</strong> {frequentLatecomers.map(l => l.name).join(", ")}</p>
                </div>
              )}
              
              {absenteeismList.length > 0 && (
                <div className="warning-log-row danger">
                  <span>📅</span>
                  <p><strong>Absent Today:</strong> {absenteeismList.map(a => a.name).join(", ")}</p>
                </div>
              )}

              {frequentLatecomers.length === 0 && absenteeismList.length === 0 && (
                <div className="warning-log-row success">
                  <span>✅</span>
                  <p>All active employees meet the 90% attendance & punctuality thresholds.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="ai-attendance-recs">
            <h4>💡 AI attendance recommendations</h4>
            <ul className="recs-bullet-list">
              {getAIRecommendations().map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Charts Section */}
        <div className="analytics-right-card glass-card">
          <div className="chart-card-header">
            <h3>Visual Telemetry Reports</h3>
            <div className="chart-tabs">
              <button 
                className={`chart-tab-btn ${activeChartTab === "trend" ? "active" : ""}`}
                onClick={() => setActiveChartTab("trend")}
              >
                Daily Check-in Trend
              </button>
              <button 
                className={`chart-tab-btn ${activeChartTab === "department" ? "active" : ""}`}
                onClick={() => setActiveChartTab("department")}
              >
                Department Rates
              </button>
            </div>
          </div>

          <div className="chart-canvas-wrapper">
            {activeChartTab === "trend" ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendChartData.length > 0 ? trendChartData : [{ date: "No data", "Present Count": 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
                  <Line type="monotone" dataKey="Present Count" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
                  <Bar dataKey="Rate" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* SEARCH & DETAILED LOGS TABLE */}
      <div className="logs-table-section glass-card">
        <div className="table-header-box">
          <h3>Detailed Attendance logs</h3>
          <input 
            type="text" 
            placeholder="🔍 Filter logs by Name or Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input-search"
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{getEmpId(a)}</td>
                  <td>{getEmpName(a)}</td>
                  <td>{a.date}</td>
                  <td>{a.checkIn}</td>
                  <td>{a.checkOut || "-"}</td>
                  <td>
                    <span 
                      className="badge-custom"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        display: "inline-block",
                        background: a.status?.toLowerCase() === "present" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: a.status?.toLowerCase() === "present" ? "#22c55e" : "#ef4444"
                      }}
                    >
                      {a.status?.toLowerCase() === "late" ? "ABSENT (Late)" : a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No check-in logs found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .attendance-root {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .attendance-header-section h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .attendance-header-section p {
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
        }

        .chart-card-header h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .chart-tabs {
          display: flex;
          gap: 8px;
          background: var(--bg-app);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .chart-tab-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .chart-tab-btn.active {
          background: var(--bg-panel);
          color: var(--accent-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .chart-canvas-wrapper {
          background: var(--stat-card-bg);
          border: var(--card-border);
          border-radius: var(--radius-md);
          padding: 15px;
        }

        .logs-table-section {
          padding: 25px;
        }

        .table-header-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .table-header-box h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .filter-input-search {
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--stat-card-bg);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          min-width: 280px;
          transition: border-color 0.2s;
        }

        .filter-input-search:focus {
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}

export default Attendance;