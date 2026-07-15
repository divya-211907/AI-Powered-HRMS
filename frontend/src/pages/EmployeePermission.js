import { useEffect, useState } from "react";
import {
  applyPermission,
  getEmployeePermissions,
  deletePermission
} from "../services/ApiService";

function EmployeePermission() {
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: "",
    fromTime: "",
    toTime: "",
    reason: ""
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentUser"));
    setUser(data);

    if (data) {
      loadPermissions(data.id);
    }
  }, []);

  const loadPermissions = async (id) => {
    try {
      const res = await getEmployeePermissions(id);
      setList(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async () => {
    try {
      if (!user) return;

      const payload = {
        employeeId: user.id,
        date: form.date,
        fromTime: form.fromTime,
        toTime: form.toTime,
        reason: form.reason,
        status: "PENDING"
      };

      await applyPermission(payload);

      alert("Permission Applied");

      setForm({
        date: "",
        fromTime: "",
        toTime: "",
        reason: ""
      });

      loadPermissions(user.id);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Error applying permission"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this permission?"
      );

      if (!confirmDelete) return;

      await deletePermission(id);

      alert("Permission Deleted");

      loadPermissions(user.id);
    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  if (!user) return <h2>Please Login</h2>;

  const getStatusBadge = (status) => {
    if (status === "APPROVED") return "badge-success";
    if (status === "REJECTED") return "badge-danger";
    return "badge-warning";
  };

  return (
    <div className="animate-fade-in">
      <h2>Apply Permission</h2>

      {/* Form Card */}
      <div className="glass-card" style={{ marginBottom: "30px", marginTop: "15px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label>Permission Date</label>
            <input
              type="date"
              name="date"
              min={today}
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>From Time</label>
            <input
              type="time"
              name="fromTime"
              value={form.fromTime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>To Time</label>
            <input
              type="time"
              name="toTime"
              value={form.toTime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Reason Description</label>
            <input
              type="text"
              name="reason"
              placeholder="Reason for early exit/short leave"
              value={form.reason}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={submit} style={{ width: "100%" }}>
          Submit Permission Request
        </button>
      </div>

      <h3>My Permissions History</h3>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((p) => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.fromTime}</td>
                  <td>{p.toTime}</td>
                  <td>{p.reason}</td>
                  <td>
                    <span className={`badge-custom ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No permissions requested yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeePermission;