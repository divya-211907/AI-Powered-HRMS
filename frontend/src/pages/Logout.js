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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default Logout;