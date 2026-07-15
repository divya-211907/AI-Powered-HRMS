import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute() {
  const { currentUser, role } = useContext(AuthContext);
  const location = useLocation();

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (currentUser?.firstLogin && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;