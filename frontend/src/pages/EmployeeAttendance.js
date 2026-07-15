import { useEffect, useState } from "react";
import { deleteAttendance, getAttendance } from "../services/ApiService";

function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState(null);

  const loadAttendance = async (id) => {
    try {
      const res = await getAttendance();

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const filtered = data.filter(
        (a) => String(a.employeeId) === String(id)
      );

      setAttendance(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentUser"));
    setUser(data);

    if (data?.id) {
      loadAttendance(data.id);

      const interval = setInterval(() => {
        loadAttendance(data.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id);

      if (user?.id) {
        loadAttendance(user.id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const presentCount = attendance.filter(a => a.status?.toUpperCase() === "PRESENT").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  if (!user) return <h2>Please Login</h2>;

  return (
    <div className="animate-fade-in">
      <h1>My Attendance</h1>

      {/* Attendance Rate Card */}
      <div className="stat-card glass-card animate-fade-in" style={{ padding: "20px", borderRadius: "16px", marginBottom: "25px", maxWidth: "450px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", margin: 0 }}>OVERALL ATTENDANCE RATE</h3>
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

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.employeeId}</td>
                <td>{a.employeeName}</td>
                <td>{a.checkIn}</td>
                <td>{a.checkOut || "-"}</td>

                {/* 🔥 FIX: Late → ABSENT (Late) */}
                <td>
                  <span className={`badge-custom ${a.status?.toLowerCase() === "present" ? "badge-success" : "badge-danger"}`}>
                    {a.status?.toLowerCase() === "late"
                      ? "ABSENT (Late)"
                      : a.status}
                  </span>
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(a.id)}
                    style={{ padding: "6px 12px", fontSize: "13px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeAttendance;