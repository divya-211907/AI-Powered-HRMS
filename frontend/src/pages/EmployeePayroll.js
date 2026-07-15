import { useEffect, useState } from "react";
import { getPayrolls } from "../services/ApiService";
import "./EmployeePayroll.css";

function EmployeePayroll() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const emp = JSON.parse(
        localStorage.getItem("currentUser")
      );

      if (!emp) return;

      const res = await getPayrolls();

      const myPayrolls = (res.data || []).filter(
        (p) =>
          Number(p.employeeId) === Number(emp.id)
      );

      setPayrolls(myPayrolls);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="payroll-container">

      <div className="payroll-header">
        <h1>💰 My Payroll</h1>
        <p>View your salary details and earnings</p>
      </div>

      {payrolls.length === 0 ? (
        <div className="no-data">
          <h2>No Payroll Records Found</h2>
        </div>
      ) : (
        payrolls.map((p) => (
          <div key={p.id} className="payroll-card">

            <div className="employee-name">
              👤 {p.employeeName}
            </div>

            <div className="salary-grid">

              <div className="salary-box">
                <h4>Basic Salary</h4>
                <p>₹ {p.basicSalary}</p>
              </div>

              <div className="salary-box bonus">
                <h4>Bonus</h4>
                <p>₹ {p.bonus}</p>
              </div>

              <div className="salary-box deduction">
                <h4>Deductions</h4>
                <p>₹ {p.deductions}</p>
              </div>

            </div>

            <div className="net-salary">
              💵 Net Salary : ₹ {p.netSalary}
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default EmployeePayroll;