import { useEffect, useState } from "react";
import { 
  getAttendance,
  employeeCheckIn,
  employeeCheckOut,
  getLeaves
} from "../services/ApiService";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {

  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentUser"));

    setUser(data);

    if (data) {
      loadLeaves(data.id);
      loadAttendance(data.id);   // ✅ FIXED
    }
  }, []);

  // ================= LEAVES =================
  const loadLeaves = async (id) => {
    const res = await getLeaves();

    const filtered = res.data.filter(
      (l) => String(l.employeeId) === String(id)
    );

    setLeaves(filtered);
  };

  // ================= ATTENDANCE (FIXED SYNC) =================
  const loadAttendance = async (id) => {
    const res = await getAttendance();

    const filtered = res.data.filter(
      (a) => String(a.employee?.id || a.employeeId) === String(id)
    );

    setAttendance(filtered);
  };

  const today = new Date().toISOString().split("T")[0];

  // ================= CHECK IN =================
  const handleCheckIn = async () => {
    if (!user) return;

    const exists = attendance.find((a) => a.date === today);

    if (exists) {
      alert("Already Checked In");
      return;
    }

    await employeeCheckIn(user.id);

    alert("Check In Successful");

    loadAttendance(user.id);   // ✅ FIXED
  };

  // ================= CHECK OUT =================
  const handleCheckOut = async () => {
    if (!user) return;

    const record = attendance.find((a) => a.date === today);

    if (!record) {
      alert("Please Check In First");
      return;
    }

    if (record.checkOut) {
      alert("Already Checked Out");
      return;
    }

    await employeeCheckOut(record.id);

    alert("Check Out Successful");

    loadAttendance(user.id);   // ✅ FIXED
  };

  const presentCount = attendance.filter(a => a.status?.toUpperCase() === "PRESENT").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  if (!user) return <h2>Please Login Again</h2>;

  return (
    <div className="dashboard-container">

      <div className="welcome-card">
        <div className="avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>Welcome, {user.name}</h1>
          <p>Employee Dashboard</p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "25px" }}>
        
        {/* Attendance Rate Card */}
        <div className="stat-card glass-card animate-fade-in" style={{ padding: "20px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", margin: 0 }}>OVERALL ATTENDANCE</h3>
            <span 
              style={{
                fontSize: "11px", 
                fontWeight: "700", 
                padding: "4px 10px", 
                borderRadius: "20px",
                background: attendanceRate === 0 ? "rgba(239, 68, 68, 0.1)"
                  : attendanceRate < 50 ? "rgba(239, 68, 68, 0.1)"
                  : attendanceRate <= 75 ? "rgba(245, 158, 11, 0.1)"
                  : attendanceRate <= 90 ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(16, 185, 129, 0.1)",
                color: attendanceRate === 0 ? "#EF4444"
                  : attendanceRate < 50 ? "#EF4444"
                  : attendanceRate <= 75 ? "#F59E0B"
                  : attendanceRate <= 90 ? "#3B82F6"
                  : "#10B981"
              }}
            >
              {attendanceRate}%
            </span>
          </div>

          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "10px" }}>
            {attendanceRate}%
          </div>

          {/* Animated Progress Bar */}
          <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
            <div 
              style={{ 
                height: "100%", 
                width: `${attendanceRate}%`, 
                background: attendanceRate === 0 ? "#EF4444"
                  : attendanceRate < 50 ? "#EF4444"
                  : attendanceRate <= 75 ? "#F59E0B"
                  : attendanceRate <= 90 ? "#3B82F6"
                  : "#10B981",
                borderRadius: "4px",
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease"
              }}
            />
          </div>
        </div>

        {/* Leave Requests Card */}
        <div className="stat-card glass-card animate-fade-in" style={{ padding: "20px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "15px", marginTop: 0 }}>LEAVE BALANCE</h3>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "10px" }}>
            {leaves.filter(l => l.status === "Approved").length} / {leaves.length} Approved
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
            {leaves.filter(l => l.status === "Pending").length} pending requests under review
          </p>
        </div>

      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "25px" }}>
        <button onClick={handleCheckIn} className="btn-success">
          Check In
        </button>

        <button 
          onClick={handleCheckOut} 
          style={{ 
            background: "linear-gradient(135deg, var(--accent-warning), #d97706)", 
            color: "white",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
          }}
        >
          Check Out
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="leave-card">
        <h2>Attendance History</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.length > 0 ? (
                attendance.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td>{a.checkIn}</td>
                    <td>{a.checkOut || "-"}</td>
                    <td>
                      <span className={`badge-custom ${a.status === "PRESENT" ? "badge-success" : "badge-warning"}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No Records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default EmployeeDashboard;