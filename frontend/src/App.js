import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { HrmsContext } from "./context/HrmsContext";

// AUTH
import Register from "./pages/Register";
import Login from "./pages/Login";

// HR PAGES
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import HrPermission from "./pages/HrPermission";
import Recruitment from "./pages/Recruitment";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Attendance from "./pages/Attendance";
import Department from "./pages/Departments";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Logout from "./pages/Logout";

// EMPLOYEE PAGES
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeePermission from "./pages/EmployeePermission";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeePayroll from "./pages/EmployeePayroll";
import EmployeePerformance from "./pages/EmployeePerformance";

// CANDIDATE
import CandidateRegister from "./pages/CandidateRegister";
import CandidateDashboard from "./pages/CandidateDashboard";

// LAYOUT
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AiAssistant from "./components/AiAssistant";

function Layout({ children }) {
  const { isSidebarCollapsed } = useContext(HrmsContext);
  const role = localStorage.getItem("role");

  return (
    <div className="main-layout">
      <Sidebar />

      <div
        className={`main-content-wrapper ${
          isSidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        <Navbar />
        <div style={{ padding: "25px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </div>
        {(role === "EMPLOYEE" || role === "CANDIDATE") && <AiAssistant />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>

          {/* HR */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/leave" element={<Layout><Leave /></Layout>} />

          {/* ✅ FIXED PERMISSION ROUTE */}
          <Route path="/hr-permission" element={<Layout><HrPermission /></Layout>} />

          <Route path="/departments" element={<Layout><Department /></Layout>} />
          <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
          <Route path="/payroll" element={<Layout><Payroll /></Layout>} />
          <Route path="/performance" element={<Layout><Performance /></Layout>} />
          <Route path="/recruitment" element={<Layout><Recruitment /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />

          {/* COMMON */}
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/change-password" element={<Layout><ChangePassword /></Layout>} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/candidate-register" element={<CandidateRegister />} />
          <Route path="/candidate-dashboard" element={<Layout><CandidateDashboard /></Layout>} />

          {/* EMPLOYEE */}
          <Route path="/employee-dashboard" element={<Layout><EmployeeDashboard /></Layout>} />
          <Route path="/employee-leave" element={<Layout><EmployeeLeave /></Layout>} />
          <Route path="/employee-permission" element={<Layout><EmployeePermission /></Layout>} />
          <Route path="/employee-attendance" element={<Layout><EmployeeAttendance /></Layout>} />
          <Route path="/employee-payroll" element={<Layout><EmployeePayroll /></Layout>} />
          <Route path="/employee-performance" element={<Layout><EmployeePerformance /></Layout>} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;