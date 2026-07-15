import { useEffect, useState } from "react";
import { getPerformances } from "../services/ApiService";
import "./EmployeePerformance.css";

function EmployeePerformance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const emp = JSON.parse(
        localStorage.getItem("currentUser")
      );

      if (!emp) return;

      const res = await getPerformances();

      const result = (res.data || []).filter(
        (p) =>
          Number(p.employeeId) ===
          Number(emp.id)
      );

      setData(result);
    } catch (err) {
      console.log(err);
    }
  };

  const getStars = (rating) => {
    return "⭐".repeat(Number(rating));
  };

  return (
    <div className="performance-container">

      <div className="performance-header">
        <h1>⭐ My Performance</h1>
        <p>Track your ratings and achievements</p>
      </div>

      {data.length === 0 ? (
        <div className="no-performance">
          <h2>No Performance Records Found</h2>
        </div>
      ) : (
        data.map((p) => (
          <div
            key={p.id}
            className="performance-card"
          >
            <div className="employee-info">
              👤 {p.employeeName}
            </div>

            <div className="rating-section">

              <div className="rating-box">
                <h4>Performance Rating</h4>

                <div className="stars">
                  {getStars(p.rating)}
                </div>

                <h2>{p.rating}/5</h2>
              </div>

            </div>

            <div className="remarks-box">
              <h4>📝 Manager Remarks</h4>
              <p>{p.remarks}</p>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default EmployeePerformance;