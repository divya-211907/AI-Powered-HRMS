import { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import {
  getPayrolls,
  addPayroll,
  updatePayroll,
  deletePayroll,
  getIncrementRecommendations,
  modifyIncrementPercentage,
  approveIncrement,
  rejectIncrement,
} from "../services/ApiService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function Payroll() {
  const {
    payrolls,
    setPayrolls,
    employees,
    attendance = []
  } = useContext(HrmsContext);

  const safePayroll = payrolls || [];
  const [editing, setEditing] = useState(false);

  const [activeSection, setActiveSection] = useState("logs"); // "logs" or "increments"
  const [recommendations, setRecommendations] = useState([]);
  const [modifyingId, setModifyingId] = useState(null);
  const [customPct, setCustomPct] = useState("");
  const [customRemarks, setCustomRemarks] = useState("");

  const [form, setForm] = useState({
    id: "",
    employeeId: "",
    employeeName: "",
    basicSalary: "",
    bonus: "",
    deductions: "",
    netSalary: "",
  });

  useEffect(() => {
    loadPayroll();
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecommendations = async () => {
    try {
      const res = await getIncrementRecommendations();
      setRecommendations(res.data || []);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveIncrement(id);
      alert("Increment Approved Successfully!");
      await loadRecommendations();
      await loadPayroll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to approve increment");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectIncrement(id);
      alert("Increment Rejected.");
      await loadRecommendations();
    } catch (err) {
      console.error(err);
      alert("Failed to reject increment");
    }
  };

  const handleModify = async (id) => {
    if (customPct === "" || isNaN(customPct) || Number(customPct) < 0) {
      alert("Please enter a valid non-negative increment percentage.");
      return;
    }
    try {
      await modifyIncrementPercentage(id, Number(customPct), customRemarks);
      alert("Suggested increment details updated!");
      setModifyingId(null);
      setCustomPct("");
      setCustomRemarks("");
      await loadRecommendations();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to modify recommendation");
    }
  };

  const loadPayroll = async () => {
    try {
      const res = await getPayrolls();
      setPayrolls(res.data || []);
    } catch (err) {
      console.error(err);
      setPayrolls([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = {
      ...form,
      [name]: value,
    };

    if (name === "employeeId") {
      const employee = employees?.find(
        (emp) => String(emp.id) === String(value)
      );

      if (employee) {
        updatedForm.employeeName = employee.name || "";
        updatedForm.basicSalary = employee.salary || employee.basicSalary || 0;
      } else {
        updatedForm.employeeName = "";
        updatedForm.basicSalary = "";
      }
    }

    const basic = Number(updatedForm.basicSalary || 0);
    const bonus = Number(updatedForm.bonus || 0);
    const deductions = Number(updatedForm.deductions || 0);
    updatedForm.netSalary = Math.max(0, basic + bonus - deductions);
    setForm(updatedForm);
  };

  const savePayroll = async () => {
    try {
      if (!form.employeeId) {
        alert("Please select employee");
        return;
      }

      const alreadyExists = safePayroll.find(
        (p) =>
          String(p.employeeId) === String(form.employeeId) &&
          String(p.id) !== String(form.id)
      );

      if (alreadyExists) {
        alert("Payroll Already Exists For This Employee");
        return;
      }

      const payload = {
        employee: {
          id: Number(form.employeeId)
        },
        basicSalary: Number(form.basicSalary),
        bonus: Number(form.bonus || 0),
        deductions: Number(form.deductions || 0)
      };

      if (editing) {
        await updatePayroll(form.id, payload);
        alert("Payroll Updated Successfully");
      } else {
        await addPayroll(payload);
        alert("Payroll Added Successfully");
      }

      await loadPayroll();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Operation Failed");
    }
  };

  const editPayroll = (item) => {
    setForm({
      id: item.id,
      employeeId: item.employee?.id || "",
      employeeName: item.employee?.name || "",
      basicSalary: item.basicSalary,
      bonus: item.bonus,
      deductions: item.deductions,
      netSalary: item.netSalary,
    });
    setEditing(true);
  };

  const removePayroll = async (id) => {
    try {
      await deletePayroll(id);
      await loadPayroll();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      employeeId: "",
      employeeName: "",
      basicSalary: "",
      bonus: "",
      deductions: "",
      netSalary: "",
    });
    setEditing(false);
  };

  // ================= AI PAYROLL ANALYTICS ENGINE =================
  const totalNetSpend = safePayroll.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
  const totalBasic = safePayroll.reduce((sum, p) => sum + Number(p.basicSalary || 0), 0);
  const avgBasicSalary = safePayroll.length > 0 ? Math.round(totalBasic / safePayroll.length) : 0;

  // Cross-module Overtime spend check
  const totalOtHours = (attendance || []).reduce((sum, a) => sum + Number(a.otHours || 0), 0);
  const overtimeSpend = totalOtHours * 500;

  // Anomalies detection
  const payrollAnomalies = [];
  safePayroll.forEach(p => {
    const basic = Number(p.basicSalary || 0);
    const bonus = Number(p.bonus || 0);
    const deductions = Number(p.deductions || 0);
    const empName = p.employee?.name || `Emp ID ${p.employee?.id}`;

    if (basic > 0) {
      if (bonus > basic * 0.2) {
        payrollAnomalies.push({
          type: "High Bonus Flag",
          message: `${empName}'s bonus (₹${bonus}) is greater than 20% of basic.`
        });
      }
      if (deductions > basic * 0.15) {
        payrollAnomalies.push({
          type: "High Deductions Flag",
          message: `${empName}'s deductions (₹${deductions}) exceed 15% of basic.`
        });
      }
    }
  });

  // Salary segments
  const lowTier = safePayroll.filter(p => Number(p.basicSalary) < 30000).length;
  const midTier = safePayroll.filter(p => Number(p.basicSalary) >= 30000 && Number(p.basicSalary) < 60000).length;
  const highTier = safePayroll.filter(p => Number(p.basicSalary) >= 60000).length;

  const distributionData = [
    { segment: "< 30K (Low)", count: lowTier },
    { segment: "30K - 60K (Mid)", count: midTier },
    { segment: "> 60K (High)", count: highTier }
  ];

  const getAIRecommendations = () => {
    const recs = [];
    if (overtimeSpend > 5000) {
      recs.push(`Overtime spend is high (₹${overtimeSpend}). Review additional shift allocations for high OT members.`);
    }
    if (payrollAnomalies.length > 0) {
      recs.push(`Detected ${payrollAnomalies.length} payroll anomalies. Audit bonus schedules and deductions.`);
    }
    if (avgBasicSalary > 50000) {
      recs.push("Average basic salary index is high. Consider hiring junior roles to balance standard staff cost averages.");
    }
    if (recs.length === 0) {
      recs.push("Workforce cost margins are within standard limits. Cost optimization actions are currently not required.");
    }
    return recs;
  };

  return (
    <div className="payroll-container animate-fade-in">
      <div className="payroll-header-section">
        <h2>Payroll Analytics Dashboard</h2>
        <p>Monitor salary distribution trends, audit OT expenses, and analyze organizational workforce costs.</p>
      </div>

      {/* 📁 Page Navigation Tabs */}
      <div className="payroll-section-tabs">
        <button
          className={`payroll-tab-btn ${activeSection === "logs" ? "active" : ""}`}
          onClick={() => setActiveSection("logs")}
        >
          📄 Payroll Logs
        </button>
        <button
          className={`payroll-tab-btn ${activeSection === "increments" ? "active" : ""}`}
          onClick={() => setActiveSection("increments")}
        >
          🤖 AI Increment Recommendations
        </button>
      </div>

      {activeSection === "logs" ? (
        <>
          {/* AI Payroll Insights Grid */}
      <div className="analytics-layout-grid" style={{ marginBottom: "25px", marginTop: "20px" }}>
        
        {/* Left: AI Payroll Summary Card */}
        <div className="analytics-left-card glass-card">
          <div className="ai-summary-header">
            <span className="ai-summary-spark">🧠</span>
            <div>
              <h3>AI Payroll Intelligence</h3>
              <p>Automated salary segment audits, cost warning matrices, and summaries.</p>
            </div>
          </div>

          <div className="ai-summary-metrics">
            <div className="ai-metric-item">
              <span className="metric-icon-badge success">💰</span>
              <div>
                <span className="metric-label">Total Spend</span>
                <h4>₹{totalNetSpend.toLocaleString("en-IN")}</h4>
              </div>
            </div>

            <div className="ai-metric-item">
              <span className="metric-icon-badge warning">⏰</span>
              <div>
                <span className="metric-label">Overtime Spend</span>
                <h4>₹{overtimeSpend.toLocaleString("en-IN")}</h4>
              </div>
            </div>
          </div>

          {/* Payroll Anomalies alerts */}
          <div className="ai-warnings-box">
            <h4>⚠️ Unusual payroll changes</h4>
            <div className="warnings-container">
              {payrollAnomalies.length > 0 ? (
                payrollAnomalies.map((anom, idx) => (
                  <div key={idx} className="warning-log-row danger">
                    <span>⚠️</span>
                    <p><strong>{anom.type}:</strong> {anom.message}</p>
                  </div>
                ))
              ) : (
                <div className="warning-log-row success">
                  <span>✅</span>
                  <p>All employee bonuses & deductions conform with standard policies.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cost recommendations */}
          <div className="ai-attendance-recs">
            <h4>💡 Cost Optimization Recommendations</h4>
            <ul className="recs-bullet-list">
              {getAIRecommendations().map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Salary Distribution Chart */}
        <div className="analytics-right-card glass-card">
          <div className="chart-card-header">
            <h3>Salary Distribution Audit</h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Total employees grouped by basic salary segments.
            </p>
          </div>

          <div className="chart-canvas-wrapper" style={{ padding: "15px" }}>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="segment" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }} />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="payroll-card">
        <h2>
          {editing
            ? "Update Payroll"
            : "Add Payroll"}
        </h2>

        <select
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
        >
          <option value="">
            Select Employee
          </option>

          {(employees || []).map((emp) => (
            <option
              key={emp.id}
              value={emp.id}
            >
              {emp.id} - {emp.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={form.employeeName}
          placeholder="Employee Name"
          readOnly
        />

        <input
          type="number"
          value={form.basicSalary}
          placeholder="Basic Salary"
          readOnly
        />

        <input
          type="number"
          name="bonus"
          min="0"
          step="1"
          value={form.bonus}
          placeholder="Bonus"
          onKeyDown={(e) => {
            if (e.key === "-") {
              e.preventDefault();
              alert("Value cannot be less than zero");
            } else if (e.key === "e" || e.key === "E") {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const pasteData = e.clipboardData.getData("text");
            if (pasteData.includes("-") || pasteData.includes("e") || pasteData.includes("E")) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) {
              alert("Value cannot be less than zero");
              handleChange({ target: { name: e.target.name, value: 0 } });
            } else {
              handleChange(e);
            }
          }}
        />
        <input
          type="number"
          name="deductions"
          min="0"
          value={form.deductions}
          placeholder="Deductions"
          onKeyDown={(e) => {
            if (e.key === "-") {
              e.preventDefault();
              alert("Value cannot be less than zero");
            } else if (e.key === "e" || e.key === "E") {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const pasteData = e.clipboardData.getData("text");
            if (pasteData.includes("-") || pasteData.includes("e") || pasteData.includes("E")) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) {
              alert("Value cannot be less than zero");
              handleChange({ target: { name: e.target.name, value: 0 } });
            } else {
              handleChange(e);
            }
          }}
        />

        <input
          type="number"
          value={form.netSalary}
          placeholder="Net Salary"
          readOnly
        />

        <div className="button-group">
          <button
            className="save-btn"
            onClick={savePayroll}
          >
            {editing
              ? "Update Payroll"
              : "Add Payroll"}
          </button>

          <button
            className="clear-btn"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </div>

      <h3>
        Total Payroll Records :
        {" "}
        {safePayroll.length}
      </h3>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Basic Salary</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {safePayroll.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No Payroll Records Found
                </td>
              </tr>
            ) : (
              safePayroll.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.employee?.id}</td>
                  <td>{item.employee?.name}</td>
                  <td>
                    <span className="salary-badge">
                      ₹{item.basicSalary}
                    </span>
                  </td>
                  <td>
                    <span className="badge-custom badge-success">
                      ₹{item.bonus}
                    </span>
                  </td>
                  <td>
                    <span className="badge-custom badge-danger">
                      ₹{item.deductions}
                    </span>
                  </td>
                  <td>
                    <span className="salary-badge">
                      ₹{item.netSalary}
                    </span>
                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() =>
                        editPayroll(item)
                      }
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        removePayroll(item.id)
                      }
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      ) : (
        <div className="recommendations-container">
          <div className="payroll-header-section" style={{ marginTop: "15px" }}>
            <h3>AI Salary Revision Assistant</h3>
            <p>Automated telemetry evaluations for active employee base. Revise salaries based on productivity and check-in consistency.</p>
          </div>

          {recommendations.length === 0 ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No recommendations available. Please ensure active employees are registered under your account.
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((rec) => (
                <div key={rec.id} className={`recommendation-card ${rec.status?.toLowerCase()}`}>
                  <div className="rec-card-header">
                    <div className="rec-emp-info">
                      <h4>{rec.employeeName}</h4>
                      <p>Experience: {rec.experience}</p>
                    </div>
                    <span className={`rec-status-badge ${rec.status?.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </div>

                  <div className="rec-card-body">
                    <div className="rec-metrics-panel">
                      <div className="rec-metric-col">
                        <span>Attendance</span>
                        <strong>{rec.attendanceRate}%</strong>
                      </div>
                      <div className="rec-metric-col">
                        <span>Rating</span>
                        <strong>{rec.performanceRating}/5</strong>
                      </div>
                      <div className="rec-metric-col">
                        <span>Overtime</span>
                        <strong>{rec.overtimeHours} Hrs</strong>
                      </div>
                    </div>

                    <div className="rec-salary-panel">
                      <div className="rec-salary-col">
                        <span>Current Salary</span>
                        <strong>₹{Number(rec.currentSalary).toLocaleString("en-IN")}</strong>
                      </div>
                      <div className="rec-salary-col highlight">
                        <span>New Estimated ({rec.suggestedIncrement}%)</span>
                        <strong>₹{Number(rec.newEstimatedSalary).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    <p className="rec-reason">
                      <strong>AI Assessment:</strong> {rec.reason}
                    </p>
                  </div>

                  {rec.status === "PENDING" && (
                    <div className="rec-footer" style={{ width: "100%" }}>
                      {modifyingId === rec.id ? (
                        <div className="rec-modify-box" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700 }}>Adjust Salary Recommendation</span>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Increment %</label>
                              <input
                                type="number"
                                placeholder="Percentage"
                                value={customPct}
                                onChange={(e) => setCustomPct(e.target.value)}
                                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0, 0, 0, 0.2)", color: "#fff" }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "11px", color: "var(--text-secondary)" }}>New Salary (₹)</label>
                              <input
                                type="number"
                                placeholder="New Salary"
                                value={customPct !== "" ? Math.round(rec.currentSalary * (1 + Number(customPct) / 100)) : ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if (rec.currentSalary > 0) {
                                    const pct = ((val / rec.currentSalary) - 1) * 100;
                                    setCustomPct(pct.toFixed(1));
                                  }
                                }}
                                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0, 0, 0, 0.2)", color: "#fff" }}
                              />
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Remarks / AI Reason</label>
                            <input
                              type="text"
                              placeholder="Enter revision remarks..."
                              value={customRemarks}
                              onChange={(e) => setCustomRemarks(e.target.value)}
                              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0, 0, 0, 0.2)", color: "#fff" }}
                            />
                          </div>
                          <div className="rec-modify-row" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "5px" }}>
                            <button className="btn-save" onClick={() => handleModify(rec.id)} style={{ padding: "6px 16px", borderRadius: "8px", background: "var(--hrms-success)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Save</button>
                            <button className="btn-cancel" onClick={() => { setModifyingId(null); setCustomPct(""); setCustomRemarks(""); }} style={{ padding: "6px 16px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.1)", border: "none", color: "#fff", cursor: "pointer" }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="rec-actions">
                          <button className="rec-btn approve" onClick={() => handleApprove(rec.id)}>
                            Approve
                          </button>
                          <button className="rec-btn reject" onClick={() => handleReject(rec.id)}>
                            Reject
                          </button>
                          <button className="rec-btn modify" onClick={() => { setModifyingId(rec.id); setCustomPct(rec.suggestedIncrement); setCustomRemarks(rec.reason || ""); }}>
                            Modify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .payroll-container {
          padding: 20px 0;
          min-height: 100vh;
          background: var(--bg-app);
          transition: background-color 0.3s ease;
        }

        .payroll-header-section h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .payroll-header-section p {
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
          padding: 15px;
        }

        .payroll-card {
          background: var(--bg-panel);
          border: var(--card-border);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-bottom: 20px;
        }

        .payroll-card h2 {
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        input, select {
          width: 100%;
          padding: 14px;
          margin: 8px 0;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          background: var(--bg-panel);
          color: var(--text-primary);
          font-size: 15px;
          transition: all 0.3s;
        }

        input:focus, select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          outline: none;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 15px;
        }

        .save-btn {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
        }

        .clear-btn {
          background: linear-gradient(135deg, var(--accent-success), #059669);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .clear-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
        }

        /* Badge styles override */
        .salary-badge {
          background: var(--badge-salary-bg);
          color: var(--badge-salary-text);
          padding: 6px 12px;
          border-radius: 30px;
          font-weight: 700;
          display: inline-block;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default Payroll;
