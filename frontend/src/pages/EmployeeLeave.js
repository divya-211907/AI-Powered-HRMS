import { useState, useEffect } from "react";
import { 
  addLeave, 
  getMyLeaves,
  updateLeave,
  deleteLeave,
  applyEmployeeRequest, 
  getMyRequests,
  updateEmployeeRequest,
  deleteEmployeeRequest
} from "../services/ApiService";

function EmployeeLeave() {
  const [emp, setEmp] = useState(null);
  const [activeTab, setActiveTab] = useState("leave"); // "leave" | "attendance_correction" | "profile_update" | "document_upload" | "resignation" | "asset_request"
  
  // Lists
  const [myLeaves, setMyLeaves] = useState([]);
  const [myGeneralRequests, setMyGeneralRequests] = useState([]);

  // Editing States
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null); // "leave" | general requestType (e.g. "RESIGNATION")

  // Form States
  const [leaveReason, setLeaveReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");

  const [attDate, setAttDate] = useState("");
  const [attCheckIn, setAttCheckIn] = useState("");
  const [attCheckOut, setAttCheckOut] = useState("");
  const [attReason, setAttReason] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMobile, setProfileMobile] = useState("");

  const [docName, setDocName] = useState("");
  const [docFileText, setDocFileText] = useState("");

  const [resignDate, setResignDate] = useState("");
  const [resignReason, setResignReason] = useState("");

  const [assetName, setAssetName] = useState("");
  const [assetReason, setAssetReason] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentUser"));
    if (data) {
      setEmp(data);
      setProfileName(data.name || "");
      setProfileEmail(data.email || "");
      loadAllRequests(data.id);
    }
  }, []);

  const loadAllRequests = async (employeeId) => {
    try {
      const [leavesRes, reqsRes] = await Promise.all([
        getMyLeaves(employeeId),
        getMyRequests(employeeId)
      ]);
      setMyLeaves(leavesRes.data || []);
      setMyGeneralRequests(reqsRes.data || []);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleApplyLeave = async () => {
    if (!leaveReason || !fromDate || !toDate) {
      alert("Please fill all leave fields");
      return;
    }
    if (toDate < fromDate) {
      alert("To Date cannot be before From Date");
      return;
    }
    try {
      if (editingId && editingType === "leave") {
        await updateLeave(editingId, {
          fromDate,
          toDate,
          leaveType,
          reason: leaveReason
        });
        alert("Leave Updated Successfully");
      } else {
        await addLeave({
          employeeId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          reason: leaveReason,
          fromDate,
          toDate,
          leaveType
        });
        alert("Leave Applied Successfully");
      }
      handleCancelEdit();
      loadAllRequests(emp.id);
    } catch (err) {
      console.error(err);
      alert("Failed to save leave");
    }
  };

  const handleApplyGeneral = async (type, details) => {
    try {
      if (editingId && editingType === type) {
        await updateEmployeeRequest(editingId, {
          details
        });
        alert(`${type.replace("_", " ")} request updated successfully!`);
        handleCancelEdit();
      } else {
        await applyEmployeeRequest({
          employeeId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          requestType: type,
          details
        });
        alert(`${type.replace("_", " ")} request submitted successfully!`);
      }
      loadAllRequests(emp.id);
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  const handleStartEdit = (item, type) => {
    setEditingId(item.id);
    setEditingType(type);
    
    if (type === "leave") {
      setFromDate(item.fromDate || "");
      setToDate(item.toDate || "");
      setLeaveType(item.leaveType || "Casual Leave");
      setLeaveReason(item.reason || "");
      setActiveTab("leave");
    } else {
      if (item.requestType === "ATTENDANCE_CORRECTION") {
        const parts = item.details.split(" | ");
        const dateVal = parts.find(p => p.startsWith("Correction Date: "))?.replace("Correction Date: ", "") || "";
        const inVal = parts.find(p => p.startsWith("Requested In: "))?.replace("Requested In: ", "") || "";
        const outVal = parts.find(p => p.startsWith("Requested Out: "))?.replace("Requested Out: ", "") || "";
        const reasonVal = parts.find(p => p.startsWith("Reason: "))?.replace("Reason: ", "") || "";
        setAttDate(dateVal);
        setAttCheckIn(inVal);
        setAttCheckOut(outVal);
        setAttReason(reasonVal);
        setActiveTab("attendance_correction");
      } else if (item.requestType === "PROFILE_UPDATE") {
        const parts = item.details.split(" | ");
        const nameVal = parts.find(p => p.startsWith("Requested Name: "))?.replace("Requested Name: ", "") || "";
        const emailVal = parts.find(p => p.startsWith("Requested Email: "))?.replace("Requested Email: ", "") || "";
        const mobileVal = parts.find(p => p.startsWith("Requested Mobile: "))?.replace("Requested Mobile: ", "") || "";
        setProfileName(nameVal);
        setProfileEmail(emailVal);
        setProfileMobile(mobileVal);
        setActiveTab("profile_update");
      } else if (item.requestType === "DOCUMENT_UPLOAD") {
        const parts = item.details.split(" | ");
        const docVal = parts.find(p => p.startsWith("Document Type: "))?.replace("Document Type: ", "") || "";
        const contentVal = parts.find(p => p.startsWith("Details/Content: "))?.replace("Details/Content: ", "") || "";
        setDocName(docVal);
        setDocFileText(contentVal);
        setActiveTab("document_upload");
      } else if (item.requestType === "RESIGNATION") {
        const parts = item.details.split(" | ");
        const dateVal = parts.find(p => p.startsWith("Requested LWD: "))?.replace("Requested LWD: ", "") || "";
        const reasonVal = parts.find(p => p.startsWith("Reason: "))?.replace("Reason: ", "") || "";
        setResignDate(dateVal);
        setResignReason(reasonVal);
        setActiveTab("resignation");
      } else if (item.requestType === "ASSET_REQUEST") {
        const parts = item.details.split(" | ");
        const assetVal = parts.find(p => p.startsWith("Asset: "))?.replace("Asset: ", "") || "";
        const reasonVal = parts.find(p => p.startsWith("Reason: "))?.replace("Reason: ", "") || "";
        setAssetName(assetVal);
        setAssetReason(reasonVal);
        setActiveTab("asset_request");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    
    setLeaveReason("");
    setFromDate("");
    setToDate("");
    setLeaveType("Casual Leave");
    
    setAttDate("");
    setAttCheckIn("");
    setAttCheckOut("");
    setAttReason("");
    
    const data = JSON.parse(localStorage.getItem("currentUser"));
    if (data) {
      setProfileName(data.name || "");
      setProfileEmail(data.email || "");
    }
    setProfileMobile("");
    
    setDocName("");
    setDocFileText("");
    
    setResignDate("");
    setResignReason("");
    
    setAssetName("");
    setAssetReason("");
  };

  const handleDeleteLeave = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await deleteLeave(id);
        alert("Leave request deleted successfully.");
        loadAllRequests(emp.id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete leave request.");
      }
    }
  };

  const handleDeleteGeneral = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteEmployeeRequest(id);
        alert("Request deleted successfully.");
        loadAllRequests(emp.id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete request.");
      }
    }
  };

  const submitAttendanceCorrection = () => {
    if (!attDate || !attCheckIn || !attCheckOut || !attReason) {
      alert("Please fill all attendance correction fields");
      return;
    }
    const details = `Correction Date: ${attDate} | Requested In: ${attCheckIn} | Requested Out: ${attCheckOut} | Reason: ${attReason}`;
    handleApplyGeneral("ATTENDANCE_CORRECTION", details).then(() => {
      setAttDate("");
      setAttCheckIn("");
      setAttCheckOut("");
      setAttReason("");
    });
  };

  const submitProfileUpdate = () => {
    if (!profileName || !profileEmail || !profileMobile) {
      alert("Please fill all profile update fields");
      return;
    }
    const details = `Requested Name: ${profileName} | Requested Email: ${profileEmail} | Requested Mobile: ${profileMobile}`;
    handleApplyGeneral("PROFILE_UPDATE", details);
  };

  const submitDocUpload = () => {
    if (!docName || !docFileText) {
      alert("Please enter document name and mock content");
      return;
    }
    const details = `Document Type: ${docName} | Details/Content: ${docFileText}`;
    handleApplyGeneral("DOCUMENT_UPLOAD", details).then(() => {
      setDocName("");
      setDocFileText("");
    });
  };

  const submitResignation = () => {
    if (!resignDate || !resignReason) {
      alert("Please fill all resignation fields");
      return;
    }
    const details = `Requested LWD: ${resignDate} | Reason: ${resignReason}`;
    handleApplyGeneral("RESIGNATION", details).then(() => {
      setResignDate("");
      setResignReason("");
    });
  };

  const submitAssetRequest = () => {
    if (!assetName || !assetReason) {
      alert("Please fill all asset request fields");
      return;
    }
    const details = `Asset: ${assetName} | Reason: ${assetReason}`;
    handleApplyGeneral("ASSET_REQUEST", details).then(() => {
      setAssetName("");
      setAssetReason("");
    });
  };

  if (!emp) return <h2>Loading Profile...</h2>;

  return (
    <div style={styles.container}>
      {/* Header Info */}
      <div style={styles.welcomeCard}>
        <h2 style={{ margin: "0 0 5px", color: "var(--text-primary)" }}>👋 Welcome, {emp.name}</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
          Employee ID: <strong>{emp.id}</strong> | Email: <strong>{emp.email}</strong>
        </p>
      </div>

      <div style={styles.workspaceGrid} className="workspace-grid">
        {/* Left Side: Submission Panel */}
        <div style={styles.panelCard}>
          <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)" }}>📝 Request Center</h3>
          
          {/* Subtabs Nav */}
          <div style={styles.tabNav}>
            {[
              { id: "leave", label: "Leave" },
              { id: "attendance_correction", label: "Attendance Correction" },
              { id: "profile_update", label: "Profile Update" },
              { id: "document_upload", label: "Upload Documents" },
              { id: "resignation", label: "Resignation" },
              { id: "asset_request", label: "Asset Request" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabBtn,
                  background: activeTab === tab.id ? "var(--accent-primary)" : "var(--bg-app)",
                  color: activeTab === tab.id ? "white" : "var(--text-secondary)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          {activeTab === "leave" && (
            <div style={styles.formGroup}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }} className="responsive-two-col">
                <div>
                  <label style={styles.label}>From Date</label>
                  <input type="date" min={today} value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>To Date</label>
                  <input type="date" min={fromDate || today} value={toDate} onChange={(e) => setToDate(e.target.value)} style={styles.input} />
                </div>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={styles.label}>Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={styles.input}>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              <label style={styles.label}>Leave Reason</label>
              <textarea placeholder="Enter reason..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} style={styles.textarea} rows={4} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleApplyLeave} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "leave" ? "Update Leave" : "Apply Leave"}
                </button>
                {editingId && editingType === "leave" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "attendance_correction" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Correction Date</label>
              <input type="date" min={today} value={attDate} onChange={(e) => setAttDate(e.target.value)} style={styles.input} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }} className="responsive-two-col">
                <div>
                  <label style={styles.label}>Correct Check-In</label>
                  <input type="time" value={attCheckIn} onChange={(e) => setAttCheckIn(e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Correct Check-Out</label>
                  <input type="time" value={attCheckOut} onChange={(e) => setAttCheckOut(e.target.value)} style={styles.input} />
                </div>
              </div>
              <label style={styles.label}>Reason</label>
              <textarea placeholder="Reason for correction..." value={attReason} onChange={(e) => setAttReason(e.target.value)} style={styles.textarea} rows={3} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={submitAttendanceCorrection} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "ATTENDANCE_CORRECTION" ? "Update Correction" : "Submit Correction"}
                </button>
                {editingId && editingType === "ATTENDANCE_CORRECTION" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile_update" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} style={styles.input} />
              <label style={styles.label}>Email Address</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} style={styles.input} />
              <label style={styles.label}>Mobile Number</label>
              <input type="text" placeholder="Enter Mobile" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} style={styles.input} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={submitProfileUpdate} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "PROFILE_UPDATE" ? "Update Profile" : "Submit Profile Update"}
                </button>
                {editingId && editingType === "PROFILE_UPDATE" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "document_upload" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Document Type (e.g. Aadhaar, Passport)</label>
              <input type="text" placeholder="Aadhaar Card" value={docName} onChange={(e) => setDocName(e.target.value)} style={styles.input} />
              <label style={styles.label}>Document Content/Description</label>
              <textarea placeholder="Enter document number or details..." value={docFileText} onChange={(e) => setDocFileText(e.target.value)} style={styles.textarea} rows={4} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={submitDocUpload} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "DOCUMENT_UPLOAD" ? "Update Document" : "Upload Document"}
                </button>
                {editingId && editingType === "DOCUMENT_UPLOAD" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "resignation" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Requested Last Working Date</label>
              <input type="date" min={today} value={resignDate} onChange={(e) => setResignDate(e.target.value)} style={styles.input} />
              <label style={styles.label}>Reason for Resignation</label>
              <textarea placeholder="Reason..." value={resignReason} onChange={(e) => setResignReason(e.target.value)} style={styles.textarea} rows={4} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={submitResignation} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "RESIGNATION" ? "Update Resignation" : "Submit Resignation Notice"}
                </button>
                {editingId && editingType === "RESIGNATION" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "asset_request" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Type (e.g., MacBook, Monitor)</label>
              <input type="text" placeholder="MacBook Pro" value={assetName} onChange={(e) => setAssetName(e.target.value)} style={styles.input} />
              <label style={styles.label}>Business Justification</label>
              <textarea placeholder="Reason for request..." value={assetReason} onChange={(e) => setAssetReason(e.target.value)} style={styles.textarea} rows={4} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={submitAssetRequest} style={{ ...styles.submitBtn, flex: 1 }}>
                  {editingId && editingType === "ASSET_REQUEST" ? "Update Asset Request" : "Request Asset"}
                </button>
                {editingId && editingType === "ASSET_REQUEST" && (
                  <button onClick={handleCancelEdit} style={{ ...styles.cancelBtn, flex: 1 }}>Cancel Edit</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline Status Queue */}
        <div style={styles.timelineCard}>
          <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)" }}>📜 My Requests Timeline</h3>
          
          <div className="table-wrapper" style={{ maxHeight: "450px", overflowY: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th>HR Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Render Leaves */}
                {myLeaves.map(l => (
                  <tr key={`leave-${l.id}`}>
                    <td><span style={{ ...styles.typeBadge, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>LEAVE</span></td>
                    <td style={{ fontSize: "12.5px" }}>{l.reason} ({l.fromDate} to {l.toDate})</td>
                    <td style={{ fontSize: "12.5px" }}>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}</td>
                    <td><span className={`badge-custom ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                    <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{l.remarks || "-"}</td>
                    <td>
                      {l.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleStartEdit(l, "leave")} style={styles.actionEditBtn}>Edit</button>
                          <button onClick={() => handleDeleteLeave(l.id)} style={styles.actionDeleteBtn}>Delete</button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Render General Requests */}
                {myGeneralRequests.map(r => (
                  <tr key={`req-${r.id}`}>
                    <td>
                      <span style={{ 
                        ...styles.typeBadge, 
                        background: r.requestType === 'RESIGNATION' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124, 58, 237, 0.15)', 
                        color: r.requestType === 'RESIGNATION' ? '#ef4444' : '#a855f7' 
                      }}>
                        {r.requestType.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px" }}>{r.details}</td>
                    <td style={{ fontSize: "12.5px" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                    <td><span className={`badge-custom ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                    <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{r.remarks || "-"}</td>
                    <td>
                      {r.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleStartEdit(r, r.requestType)} style={styles.actionEditBtn}>Edit</button>
                          <button onClick={() => handleDeleteGeneral(r.id)} style={styles.actionDeleteBtn}>Delete</button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}

                {myLeaves.length === 0 && myGeneralRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No requests submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px 0",
    background: "var(--bg-app)",
    minHeight: "100vh"
  },
  welcomeCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "20px 25px",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    marginBottom: "25px"
  },
  workspaceGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.3fr",
    gap: "25px"
  },
  panelCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)"
  },
  timelineCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)"
  },
  tabNav: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "20px"
  },
  tabBtn: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border-color)",
    background: "var(--bg-panel)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border-color)",
    background: "var(--bg-panel)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    resize: "none"
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "white",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
    marginTop: "5px"
  },
  typeBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    display: "inline-block"
  },
  cancelBtn: {
    padding: "12px",
    borderRadius: "var(--radius-md)",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1.5px solid var(--border-color)",
    color: "var(--text-secondary)",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  actionEditBtn: {
    padding: "4px 8px",
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
    transition: "all 0.2s"
  },
  actionDeleteBtn: {
    padding: "4px 8px",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
    transition: "all 0.2s"
  }
};

export default EmployeeLeave;