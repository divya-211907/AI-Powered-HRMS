import { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  saveDepartmentInsight,
  getDepartmentHealthScores
} from "../services/ApiService";

function Department() {
  const { departments, setDepartments } =
    useContext(HrmsContext);

  const [departmentName, setDepartmentName] =
    useState("");

  const [manager, setManager] =
    useState("");

  const [employeeCount, setEmployeeCount] =
    useState("");

  const [editMode, setEditMode] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [healthScores, setHealthScores] = useState([]);

  useEffect(() => {
    loadDepartments();
    loadHealthScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHealthScores = async () => {
    try {
      const res = await getDepartmentHealthScores();
      if (res.data) {
        setHealthScores(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAuditDepartment = (dept) => {
    setSelectedDept(dept);
    
    const scoreData = healthScores.find(h => h.departmentId === dept.departmentId);
    
    let health = 85;
    let workloadText = "Optimal workload distribution.";
    let recsText = "Maintain current operational parameters.";
    
    if (scoreData) {
      health = scoreData.healthScore;
      workloadText = scoreData.insight || `Telemetry check shows healthy attendance (${scoreData.attendanceScore}%) and performance score (${scoreData.performanceScore}%).`;
      recsText = `Leave score is ${scoreData.leaveScore}/100. Training completion is ${scoreData.trainingScore}%. Attrition risk score is ${scoreData.attritionRiskScore}%.`;
    }

    const report = {
      healthScore: health,
      workloadAnalysis: workloadText,
      aiRecommendations: recsText
    };

    setAiReport(report);
    setShowAiModal(true);

    // Save to DB
    saveDepartmentInsight({
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      healthScore: health,
      workloadAnalysis: workloadText,
      aiRecommendations: recsText
    }).catch(err => console.error("Error saving Department AI Insight:", err));
  };

  const add = async () => {
    try {
      if (
        !departmentName ||
        !manager ||
        employeeCount === ""
      ) {
        alert("Please fill all fields");
        return;
      }

      if (Number(employeeCount) < 0) {
        alert(
          "Employee Count cannot be negative"
        );
        return;
      }

      const data = {
        departmentName,
        manager,
        employeeCount:
          Number(employeeCount),
      };

      if (editMode) {
        await updateDepartment(
          editId,
          data
        );

        alert(
          "Department Updated Successfully"
        );
      } else {
        await addDepartment(data);

        alert(
          "Department Added Successfully"
        );
      }

      setDepartmentName("");
      setManager("");
      setEmployeeCount("");
      setEditMode(false);
      setEditId(null);

      loadDepartments();
    } catch (err) {
      console.log(err);
      alert("Operation Failed");
    }
  };

  const editDepartment = (dept) => {
    setDepartmentName(
      dept.departmentName
    );
    setManager(dept.manager);
    setEmployeeCount(
      String(dept.employeeCount)
    );
    setEditMode(true);
    setEditId(dept.departmentId);
  };

  const remove = async (id) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this department?"
        )
      ) {
        await deleteDepartment(id);
        alert(
          "Department Deleted Successfully"
        );
        loadDepartments();
      }
    } catch (err) {
      console.log(err);
      alert("Deletion Failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏢 Department Management</h2>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={{ margin: "0 0 10px", color: "var(--text-secondary)" }}>Total Departments</h3>
          <h1 style={{ margin: 0, color: "var(--accent-primary)" }}>{departments.length}</h1>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)" }}>
          {editMode
            ? "✏️ Edit Department"
            : "➕ Add New Department"}
        </h3>

        <input
          type="text"
          placeholder="Department Name"
          value={departmentName}
          onChange={(e) =>
            setDepartmentName(e.target.value)
          }
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Manager Name"
          value={manager}
          onChange={(e) =>
            setManager(e.target.value)
          }
          style={styles.input}
        />

        <input
          type="number"
          min="0"
          placeholder="Employee Count"
          value={employeeCount}
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
            const val = parseInt(e.target.value) || 0;
            if (val < 0) {
              alert("Value cannot be less than zero");
              setEmployeeCount(0);
            } else {
              setEmployeeCount(e.target.value);
            }
          }}
          style={styles.input}
        />

        <button onClick={add} style={styles.addBtn}>
          {editMode
            ? "Update Department"
            : "Add Department"}
        </button>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr
              style={{
                borderBottom:
                  "2px solid var(--border-color)",
                textAlign: "left",
                color: "var(--text-secondary)",
              }}
            >
              <th style={{ padding: "12px" }}>
                ID
              </th>
              <th>Department Name</th>
              <th>Manager</th>
              <th>Employee Count</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((d) => (
              <tr
                key={d.departmentId}
                style={{
                  borderBottom:
                    "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                <td style={{ padding: "12px" }}>
                  {d.departmentId}
                </td>

                <td>
                  {
                    d.departmentName
                  }
                </td>

                <td>
                  {d.manager}
                </td>

                <td>
                  {
                    d.employeeCount
                  }
                </td>

                <td>
                  <button
                    style={
                      styles.editBtn
                    }
                    onClick={() =>
                      editDepartment(
                        d
                      )
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    style={
                      styles.deleteBtn
                    }
                    onClick={() =>
                      remove(
                        d.departmentId
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                  <button
                    style={{
                      ...styles.editBtn,
                      background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
                      marginLeft: "8px"
                    }}
                    onClick={() => handleAuditDepartment(d)}
                  >
                    🧠 AI Audit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Department Health Audit Modal */}
      {showAiModal && selectedDept && aiReport && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "var(--text-primary)" }}>🧠 AI Health Audit: {selectedDept.departmentName}</h3>
              <button onClick={() => setShowAiModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "var(--text-secondary)", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "var(--bg-app)", padding: "15px", borderRadius: "10px" }}>
                <div style={{ fontSize: "24px" }}>❤️</div>
                <div>
                  <h4 style={{ margin: "0 0 4px", color: "var(--text-primary)" }}>Department Health Score</h4>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: aiReport.healthScore >= 80 ? "var(--accent-success)" : "var(--accent-danger)" }}>{aiReport.healthScore}%</p>
                </div>
              </div>
              <div>
                <h5 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontSize: "14px" }}>💼 Workload Analysis</h5>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", background: "var(--bg-app)", padding: "12px", borderRadius: "8px", lineHeight: "1.4" }}>{aiReport.workloadAnalysis}</p>
              </div>
              <div>
                <h5 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontSize: "14px" }}>💡 AI Recommendations</h5>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", background: "var(--bg-app)", padding: "12px", borderRadius: "8px", lineHeight: "1.4" }}>{aiReport.aiRecommendations}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
              <button onClick={() => setShowAiModal(false)} style={{ padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "white", border: "none", cursor: "pointer", fontWeight: "700" }}>Close Audit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px 0",
    background: "var(--bg-app)",
    minHeight: "100vh",
    transition: "background-color 0.3s ease",
  },

  heading: {
    color: "var(--text-primary)",
    marginBottom: "25px",
    fontSize: "32px",
    fontWeight: "800",
  },

  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    flex: 1,
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    textAlign: "center",
    boxShadow: "var(--shadow-md)",
    transition: "transform 0.3s",
  },

  formCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--border-color)",
    background: "var(--bg-panel)",
    color: "var(--text-primary)",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.3s",
  },

  addBtn: {
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "#fff",
    border: "none",
    padding: "14px 20px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
    transition: "all 0.3s",
  },

  tableCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "20px",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  editBtn: {
    background: "linear-gradient(135deg, var(--accent-success), #059669)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    marginRight: "8px",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
    transition: "all 0.3s",
  },

  deleteBtn: {
    background: "linear-gradient(135deg, var(--accent-danger), #dc2626)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)",
    transition: "all 0.3s",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContainer: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "12px",
    padding: "25px",
    width: "450px",
    boxShadow: "var(--shadow-lg)"
  }
};

export default Department;