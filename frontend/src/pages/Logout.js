import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // ❌ DO NOT CLEAR HRMS DATA
    // (employees, leaves remain)

    navigate("/login");
  }, []);

  return null;
}

export default Logout;