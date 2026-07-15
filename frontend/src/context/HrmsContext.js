import { createContext, useEffect, useState } from "react";
import {
  getEmployees,
  getLeaves,
  getPayrolls,
  getDepartments,
  getAttendance,
  getRecruitments,
  getPerformances
} from "../services/ApiService";

export const HrmsContext = createContext();

export const HrmsProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [performances, setPerformances] = useState([]);
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const loadAll = async () => {
    try {
      const emp = await getEmployees();
      const leave = await getLeaves();
      const pay = await getPayrolls();
      const dep = await getDepartments();
      const att = await getAttendance();
      const rec = await getRecruitments();
      const perf = await getPerformances();

      setEmployees(emp.data || []);
      setLeaves(leave.data || []);
      setPayrolls(pay.data || []);
      setDepartments(dep.data || []);
      setAttendance(att.data || []);
      setRecruitments(rec.data || []);
      setPerformances(perf.data || []);
    } catch (err) {
      console.log("Context Load Error:", err);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => {
      loadAll();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // AI Assistant Open State
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <HrmsContext.Provider
      value={{
        employees,
        setEmployees,
        leaves,
        setLeaves,
        payrolls,
        setPayrolls,
        departments,
        setDepartments,
        attendance,
        setAttendance,
        recruitments,
        setRecruitments,
        performances,
        setPerformances,
        theme,
        toggleTheme,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isAiOpen,
        setIsAiOpen,
        refreshAll: loadAll
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
};