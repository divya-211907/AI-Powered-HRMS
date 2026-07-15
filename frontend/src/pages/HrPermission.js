import { useEffect, useState } from "react";
import { getPermissions, approvePermission, rejectPermission } from "../services/ApiService";

function HrPermission() {

  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getPermissions();
    setList(res.data || []);
  };

  const approve = async (id) => {
    await approvePermission(id);
    load();
  };

  const reject = async (id) => {
    await rejectPermission(id);
    load();
  };

  const getStatusBadge = (status) => {
    if (status === "APPROVED") return "badge-success";
    if (status === "REJECTED") return "badge-danger";
    return "badge-warning";
  };

  return (
    <div className="animate-fade-in">
      <h2>HR Permission Panel</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {list.length > 0 ? (
              list.map((p) => (
                <tr key={p.id}>
                  <td>{p.employeeId}</td>
                  <td>{p.date}</td>
                  <td>{p.reason}</td>
                  <td>
                    <span className={`badge-custom ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => approve(p.id)}
                      disabled={p.status === "APPROVED"}
                    >
                      Approve
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => reject(p.id)}
                      disabled={p.status === "REJECTED"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>No Permission Requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HrPermission;