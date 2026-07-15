
import { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import {
  getPerformances,
  addPerformance,
  updatePerformance,
  deletePerformance,
} from "../services/ApiService";

function Performance() {
  const {
    performances,
    setPerformances,
    employees,
  } = useContext(HrmsContext);

  const safePerformances = performances || [];

  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: "",
    employeeId: "",
    employeeName: "",
    rating: "5",
    remarks: "",
  });

  useEffect(() => {
    loadPerformances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPerformances = async () => {
    try {
      const res = await getPerformances();
      setPerformances(res.data || []);
    } catch (err) {
      console.error(err);
      setPerformances([]);
    }
  };

  const generatePerformanceId = () => {
    if (safePerformances.length === 0) return 1;

    return (
      Math.max(
        ...safePerformances.map((p) =>
          Number(p.id || 0)
        )
      ) + 1
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...form,
      [name]: value,
    };

    if (name === "employeeId") {
      const emp = employees?.find(
        (e) => String(e.id) === String(value)
      );

      updated.employeeName = emp?.name || "";
    }

    setForm(updated);
  };

 const savePerformance = async () => {
  try {
    if (!form.employeeId) {
      alert("Please Select Employee");
      return;
    }

    // ✅ Check duplicate employee review
    const alreadyExists = safePerformances.some(
      (p) =>
        String(p.employeeId) === String(form.employeeId) &&
        String(p.id) !== String(form.id)
    );

    if (alreadyExists) {
      alert(
        "Performance review already exists for this employee."
      );
      return;
    }

    const payload = {
      ...form,
      id: editing
        ? form.id
        : generatePerformanceId(),
    };

    if (editing) {
      await updatePerformance(form.id, payload);
      alert("Performance Updated Successfully");
    } else {
      await addPerformance(payload);
      alert("Performance Added Successfully");
    }

    await loadPerformances();
    resetForm();

  } catch (error) {
    console.log(error);
    alert("Operation Failed");
  }
};

  const editPerformance = (item) => {
    setForm(item);
    setEditing(true);
  };

  const removePerformance = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    await deletePerformance(id);
    loadPerformances();
  };

  const resetForm = () => {
    setForm({
      id: "",
      employeeId: "",
      employeeName: "",
      rating: "5",
      remarks: "",
    });

    setEditing(false);
  };

  const getRatingText = (rating) => {
    switch (Number(rating)) {
      case 5:
        return "Excellent";
      case 4:
        return "Very Good";
      case 3:
        return "Good";
      case 2:
        return "Average";
      default:
        return "Poor";
    }
  };

  const filteredData = safePerformances.filter(
    (p) =>
      p.employeeName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      String(p.employeeId).includes(search)
  );

  const avgRating =
    safePerformances.length > 0
      ? (
          safePerformances.reduce(
            (sum, p) =>
              sum + Number(p.rating || 0),
            0
          ) / safePerformances.length
        ).toFixed(1)
      : 0;

  const topPerformers = safePerformances.filter(
    (p) => Number(p.rating) === 5
  ).length;

  return (
    <div className="container">
      <h1>⭐ Performance Management</h1>

      <div className="stats">
        <div className="stat-card">
          <h2>{safePerformances.length}</h2>
          <p>Total Reviews</p>
        </div>

        <div className="stat-card">
          <h2>{avgRating}</h2>
          <p>Average Rating</p>
        </div>

        <div className="stat-card">
          <h2>{topPerformers}</h2>
          <p>Top Performers</p>
        </div>
      </div>

      <div className="card">
        <h2>
          {editing
            ? "Update Review"
            : "Add Review"}
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
          readOnly
          placeholder="Employee Name"
        />

        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
        >
          <option value="5">
            ⭐⭐⭐⭐⭐ Excellent
          </option>

          <option value="4">
            ⭐⭐⭐⭐ Very Good
          </option>

          <option value="3">
            ⭐⭐⭐ Good
          </option>

          <option value="2">
            ⭐⭐ Average
          </option>

          <option value="1">
            ⭐ Poor
          </option>
        </select>

        <textarea
          rows="4"
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
        />

        <div className="btn-group">
          <button
            className="save-btn"
            onClick={savePerformance}
          >
            {editing
              ? "Update Review"
              : "Add Review"}
          </button>

          <button
            className="clear-btn"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </div>

      <input
        className="search"
        placeholder="🔍 Search Employee Reviews..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No Reviews Found
                </td>
              </tr>
            ) : (
              filteredData.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.employeeId}</td>
                  <td>{p.employeeName}</td>

                  <td>
                    <span className="rating-badge">
                      ⭐️ {p.rating}/5 -{" "}
                      {getRatingText(
                        p.rating
                      )}
                    </span>
                  </td>

                  <td>{p.remarks}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() =>
                        editPerformance(p)
                      }
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        removePerformance(
                          p.id
                        )
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

      <style>{`
        .container {
          padding: 20px 0;
          background: var(--bg-app);
          min-height: 100vh;
          transition: background-color 0.3s ease;
        }

        h1 {
          color: var(--text-primary);
          margin-bottom: 25px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: var(--bg-panel);
          border: var(--card-border);
          padding: 20px;
          border-radius: var(--radius-lg);
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .stat-card h3 {
          color: var(--accent-primary);
        }

        .stat-card p {
          color: var(--text-secondary);
          margin-top: 5px;
          font-weight: 600;
        }

        .card {
          background: var(--bg-panel);
          border: var(--card-border);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-bottom: 20px;
        }

        .card h2 {
          color: var(--text-primary);
          margin-bottom: 15px;
        }

        input, select, textarea {
          width: 100%;
          padding: 14px;
          margin: 8px 0;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          background: var(--bg-panel);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 15px;
          transition: all 0.3s;
        }

        input:focus, select:focus, textarea:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          outline: none;
        }

        .btn-group {
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
          background: linear-gradient(135deg, var(--accent-danger), #dc2626);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .clear-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
        }

        .search {
          margin-bottom: 20px;
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          background: var(--bg-panel);
          color: var(--text-primary);
        }

        .search:focus {
          border-color: var(--accent-primary);
          outline: none;
        }

        .rating-badge {
          background: var(--badge-employee-bg);
          color: var(--badge-employee-text);
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          display: inline-block;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default Performance;