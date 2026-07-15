import { useEffect, useState } from "react";
import { getPayrolls } from "../services/ApiService";

function EmployeePayroll() {

  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {

    const emp = JSON.parse(
      localStorage.getItem("employee")
    );

    const res = await getPayrolls();

    const data = res.data.filter(
      p => p.employeeId === emp.id
    );

    setPayrolls(data);
  };

  return (
    <div>
      <h2>My Payroll</h2>

      {payrolls.map(p => (
        <div key={p.id}>
          Salary : ₹{p.netSalary}
        </div>
      ))}
    </div>
  );
}

export default EmployeePayroll;