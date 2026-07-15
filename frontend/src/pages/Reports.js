import { useContext, useState, useEffect } from "react";
import { HrmsContext } from "../context/HrmsContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getAttendanceInsights,
  getCandidateInsights,
  getPerformanceInsights,
  getDepartmentInsights,
  getDashboardInsights
} from "../services/ApiService";

function Reports() {
  const {
    employees,
    attendance,
    leaves,
    payrolls,
    departments,
    recruitments,
    performances,
  } = useContext(HrmsContext);

  const safeEmployees = employees || [];
  const safeAttendance = attendance || [];
  const safeLeaves = leaves || [];
  const safePayrolls = payrolls || [];
  const safeDepartments = departments || [];
  const safeRecruitments = recruitments || [];
  const safePerformances = performances || [];

  // AI Report Generator States
  const [query, setQuery] = useState("");
  const [reportTitle, setReportTitle] = useState("Complete HRMS Overview");
  const [filteredData, setFilteredData] = useState([]);
  const [reportType, setReportType] = useState("summary"); 
  const [aiSummary, setAiSummary] = useState("");

  // Historical AI Insights States
  const [activeAiTab, setActiveAiTab] = useState("attendance");
  const [historicalAttendance, setHistoricalAttendance] = useState([]);
  const [historicalCandidate, setHistoricalCandidate] = useState([]);
  const [historicalPerformance, setHistoricalPerformance] = useState([]);
  const [historicalDepartment, setHistoricalDepartment] = useState([]);
  const [historicalDashboard, setHistoricalDashboard] = useState([]);

  useEffect(() => {
    loadHistoricalAiInsights();
  }, []);

  const loadHistoricalAiInsights = async () => {
    try {
      const [att, cand, perf, dept, dash] = await Promise.all([
        getAttendanceInsights(),
        getCandidateInsights(),
        getPerformanceInsights(),
        getDepartmentInsights(),
        getDashboardInsights()
      ]);
      setHistoricalAttendance(att.data || []);
      setHistoricalCandidate(cand.data || []);
      setHistoricalPerformance(perf.data || []);
      setHistoricalDepartment(dept.data || []);
      setHistoricalDashboard(dash.data || []);
    } catch (err) {
      console.error("Error loading historical AI insights:", err);
    }
  };

  const handleGenerateReport = () => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setReportTitle("Complete HRMS Overview");
      setFilteredData([]);
      setReportType("summary");
      setAiSummary("");
      return;
    }

    let type = "summary";
    let title = "HRMS Report";
    let data = [];
    let summaryText = "";

    if (q.includes("attendance")) {
      type = "attendance";
      title = "AI Attendance Report";
      data = safeAttendance;

      if (q.includes("june") || q.includes("jun") || q.includes("-06-")) {
        title += " - June";
        data = safeAttendance.filter(a => a.date?.includes("-06-") || a.date?.includes("/06/") || new Date(a.date).getMonth() === 5);
      }
      
      const lateCount = data.filter(a => a.status?.toLowerCase() === "late" || a.status?.toLowerCase()?.includes("late")).length;
      summaryText = `This AI-generated Attendance report contains ${data.length} records. Punctuality audit indicates ${data.length - lateCount} present check-ins and ${lateCount} late arrivals.`;

    } else if (q.includes("payroll") || q.includes("salary") || q.includes("cost")) {
      type = "payroll";
      title = "AI Payroll Report";
      data = safePayrolls;

      if (q.includes("it") || q.includes("engineering") || q.includes("tech")) {
        title += " - IT Department";
        data = safePayrolls.filter(p => p.employee?.department?.departmentName === "Engineering" || p.employeeName?.toLowerCase().includes("engineer") || p.employee?.name?.toLowerCase().includes("it"));
      } else if (q.includes("hr") || q.includes("human")) {
        title += " - HR Department";
        data = safePayrolls.filter(p => p.employee?.department?.departmentName === "Human Resources");
      }

      const totalSpend = data.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
      summaryText = `This AI-generated Payroll report contains ${data.length} records. The total monthly net salary spend is ₹${totalSpend.toLocaleString("en-IN")}, with an average net payout of ₹${data.length > 0 ? Math.round(totalSpend / data.length).toLocaleString("en-IN") : 0} per employee.`;

    } else if (q.includes("recruitment") || q.includes("candidate") || q.includes("hiring")) {
      type = "recruitment";
      title = "AI Recruitment Summary";
      data = safeRecruitments;

      const shortlisted = data.filter(r => (r.aiScore || 0) >= 80).length;
      summaryText = `This AI-generated Recruitment report summarizes ${data.length} job applications. There are currently ${shortlisted} shortlisted candidates with matching scores of 80% or higher.`;

    } else if (q.includes("leave") || q.includes("off")) {
      type = "leaves";
      title = "AI Leave Summary";
      data = safeLeaves;

      const pending = data.filter(l => l.status === "PENDING").length;
      summaryText = `This AI-generated Leave report documents ${data.length} total leave requests. There are currently ${pending} pending requests requiring HR attention.`;
    } else {
      type = "summary";
      title = "AI Custom Query Report";
      summaryText = `Generated a custom report based on search: "${query}". Displays high-level organizational parameters.`;
    }

    setReportType(type);
    setReportTitle(title);
    setFilteredData(data);
    setAiSummary(summaryText);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 20);

    if (filteredData.length > 0) {
      let headers = [["ID", "Name", "Details"]];
      let body = [];

      if (reportType === "attendance") {
        headers = [["ID", "Employee", "Date", "Check In", "Check Out", "Status"]];
        body = filteredData.map(a => [a.id, a.employeeName || a.employee?.name, a.date, a.checkIn, a.checkOut || "-", a.status]);
      } else if (reportType === "payroll") {
        headers = [["ID", "Employee", "Basic", "Bonus", "Deductions", "Net Pay"]];
        body = filteredData.map(p => [p.id, p.employeeName || p.employee?.name, p.basicSalary, p.bonus, p.deductions, p.netSalary]);
      } else if (reportType === "recruitment") {
        headers = [["ID", "Candidate", "Position", "Skills", "AI Score", "Status"]];
        body = filteredData.map(r => [r.id, r.candidateName, r.position, r.skills, `${r.aiScore}%`, r.status]);
      } else if (reportType === "leaves") {
        headers = [["ID", "Employee", "Reason", "From", "To", "Status"]];
        body = filteredData.map(l => [l.id, l.employeeName, l.reason, l.fromDate, l.toDate, l.status]);
      }

      autoTable(doc, {
        startY: 30,
        head: headers,
        body: body,
      });
    } else {
      autoTable(doc, {
        startY: 30,
        head: [["Module", "Count"]],
        body: [
          ["Employees", safeEmployees.length],
          ["Attendance", safeAttendance.length],
          ["Leaves", safeLeaves.length],
          ["Payroll", safePayrolls.length],
          ["Departments", safeDepartments.length],
          ["Recruitments", safeRecruitments.length],
          ["Performance Reviews", safePerformances.length],
        ],
      });
    }

    doc.save(`${reportTitle.replace(/\s+/g, "_")}.pdf`);
  };

  const downloadExcel = () => {
    let data = [];
    if (filteredData.length > 0) {
      if (reportType === "attendance") {
        data = filteredData.map(a => ({ ID: a.id, Employee: a.employeeName || a.employee?.name, Date: a.date, "Check In": a.checkIn, "Check Out": a.checkOut || "-", Status: a.status }));
      } else if (reportType === "payroll") {
        data = filteredData.map(p => ({ ID: p.id, Employee: p.employeeName || p.employee?.name, Basic: p.basicSalary, Bonus: p.bonus, Deductions: p.deductions, Net: p.netSalary }));
      } else if (reportType === "recruitment") {
        data = filteredData.map(r => ({ ID: r.id, Candidate: r.candidateName, Position: r.position, Skills: r.skills, MatchScore: `${r.aiScore}%`, Status: r.status }));
      } else if (reportType === "leaves") {
        data = filteredData.map(l => ({ ID: l.id, Employee: l.employeeName, Reason: l.reason, From: l.fromDate, To: l.toDate, Status: l.status }));
      }
    } else {
      data = [
        { Module: "Employees", Count: safeEmployees.length },
        { Module: "Attendance", Count: safeAttendance.length },
        { Module: "Leaves", Count: safeLeaves.length },
        { Module: "Payroll", Count: safePayrolls.length },
        { Module: "Departments", Count: safeDepartments.length },
        { Module: "Recruitments", Count: safeRecruitments.length },
        { Module: "Performance Reviews", Count: safePerformances.length },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HRMS Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(fileData, `${reportTitle.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div className="reports-container animate-fade-in">
      <h1>📊 HRMS Reports Dashboard</h1>

      {/* AI Natural Language Query Panel */}
      <div className="glass-card" style={{ padding: "25px", marginBottom: "25px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          🧠 AI Natural Language Report Generator
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
          Type a report request in plain English (e.g., <em>"Generate attendance report for June"</em>, <em>"Generate payroll report for IT department"</em>, or <em>"Generate recruitment summary"</em>).
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            placeholder="Type report query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }}
          />
          <button 
            onClick={handleGenerateReport}
            style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)" }}
          >
            ⚡ Generate Report
          </button>
        </div>
      </div>

      {/* AI Generated Report Preview */}
      {aiSummary && (
        <div className="glass-card animate-fade-in" style={{ padding: "25px", marginBottom: "25px", border: "1.5px solid var(--accent-primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-primary)" }}>📄 AI Preview: {reportTitle}</h4>
            <span style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>AI Generated</span>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5", background: "var(--bg-app)", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid var(--accent-primary)", margin: 0 }}>
            {aiSummary}
          </p>

          {filteredData.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: "20px" }}>
              <table>
                <thead>
                  {reportType === "attendance" && (
                    <tr>
                      <th>ID</th>
                      <th>Employee Name</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  )}
                  {reportType === "payroll" && (
                    <tr>
                      <th>ID</th>
                      <th>Employee Name</th>
                      <th>Basic Salary</th>
                      <th>Bonus</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  )}
                  {reportType === "recruitment" && (
                    <tr>
                      <th>ID</th>
                      <th>Candidate Name</th>
                      <th>Position</th>
                      <th>Skills</th>
                      <th>AI Score</th>
                      <th>Status</th>
                    </tr>
                  )}
                  {reportType === "leaves" && (
                    <tr>
                      <th>ID</th>
                      <th>Employee Name</th>
                      <th>Reason</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Status</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.employeeName || item.candidateName || item.employee?.name}</td>
                      {reportType === "attendance" && (
                        <>
                          <td>{item.date}</td>
                          <td>{item.checkIn}</td>
                          <td>{item.checkOut || "-"}</td>
                          <td>{item.status}</td>
                        </>
                      )}
                      {reportType === "payroll" && (
                        <>
                          <td>₹{item.basicSalary}</td>
                          <td>₹{item.bonus}</td>
                          <td>₹{item.deductions}</td>
                          <td>₹{item.netSalary}</td>
                        </>
                      )}
                      {reportType === "recruitment" && (
                        <>
                          <td>{item.position}</td>
                          <td>{item.skills}</td>
                          <td>{item.aiScore}%</td>
                          <td>{item.status}</td>
                        </>
                      )}
                      {reportType === "leaves" && (
                        <>
                          <td>{item.reason}</td>
                          <td>{item.fromDate}</td>
                          <td>{item.toDate}</td>
                          <td>{item.status}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={downloadPDF}
          className="btn-danger"
          style={{ background: "linear-gradient(135deg, var(--accent-danger), #dc2626)" }}
        >
          Download PDF Report
        </button>

        <button
          onClick={downloadExcel}
          className="btn-success"
          style={{ background: "linear-gradient(135deg, var(--accent-success), #059669)" }}
        >
          Download Excel Report
        </button>
      </div>


      {/* Historical AI Telemetry Insights */}
      <div className="glass-card animate-fade-in" style={{ padding: "25px", marginBottom: "30px", marginTop: "20px" }}>
        <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "15px" }}>
          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>🧠 Historical AI Telemetry Insights</h4>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>Audit log of historical telemetry insights and evaluations generated by the AI modules.</p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap" }}>
          {["attendance", "candidate", "performance", "department", "dashboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveAiTab(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: activeAiTab === tab ? "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))" : "rgba(255, 255, 255, 0.05)",
                color: activeAiTab === tab ? "#fff" : "var(--text-secondary)",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ background: "var(--bg-app)", borderRadius: "8px", padding: "15px", minHeight: "100px" }}>
          {activeAiTab === "attendance" && (
            <div>
              {historicalAttendance.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No historical attendance insights logged yet.</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historicalAttendance.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                        <span>Week Range: {item.weekRange || "N/A"}</span>
                        <span style={{ color: "var(--accent-success)" }}>Score: {item.presentRate}%</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.analysisResult}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeAiTab === "candidate" && (
            <div>
              {historicalCandidate.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No historical candidate insights logged yet.</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historicalCandidate.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                        <span>Candidate: {item.candidateName}</span>
                        <span style={{ color: "var(--accent-success)" }}>Fit Score: {item.matchScore}%</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.evaluationText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeAiTab === "performance" && (
            <div>
              {historicalPerformance.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No historical performance insights logged yet.</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historicalPerformance.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                        <span>Reviewee ID: {item.employeeId}</span>
                        <span style={{ color: "var(--accent-success)" }}>Quality Level: {item.qualityRating}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.analysisResult}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeAiTab === "department" && (
            <div>
              {historicalDepartment.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No historical department insights logged yet.</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historicalDepartment.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                        <span>Dept: {item.departmentName}</span>
                        <span style={{ color: "var(--accent-success)" }}>Health: {item.healthScore}%</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.aiRecommendations}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeAiTab === "dashboard" && (
            <div>
              {historicalDashboard.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No historical dashboard overview logs.</span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historicalDashboard.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                        Overview Log: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.summaryText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      <div className="cards">
        <div className="card">
          <h3>Total Employees</h3>
          <h1>{safeEmployees.length}</h1>
        </div>

        <div className="card">
          <h3>Attendance Records</h3>
          <h1>{safeAttendance.length}</h1>
        </div>

        <div className="card">
          <h3>Leave Requests</h3>
          <h1>{safeLeaves.length}</h1>
        </div>

        <div className="card">
          <h3>Payroll Records</h3>
          <h1>{safePayrolls.length}</h1>
        </div>

        <div className="card">
          <h3>Departments</h3>
          <h1>{safeDepartments.length}</h1>
        </div>

        <div className="card">
          <h3>Recruitments</h3>
          <h1>{safeRecruitments.length}</h1>
        </div>

        <div className="card">
          <h3>Performance Reviews</h3>
          <h1>{safePerformances.length}</h1>
        </div>
      </div>

      <style>{`
        .reports-container {
          min-height: 100vh;
          padding: 20px 0;
          background: var(--bg-app);
          transition: background-color 0.3s ease;
        }

        h1 {
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 30px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .card {
          background: var(--bg-panel);
          border: var(--card-border);
          border-radius: var(--radius-lg);
          padding: 25px;
          text-align: center;
          box-shadow: var(--shadow-md);
          transition: all 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .card h3 {
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .card h1 {
          color: var(--accent-primary);
          margin: 0;
          font-size: 40px;
        }
      `}</style>
    </div>
  );
}

export default Reports;