import { useContext, useEffect, useState } from "react";
import { HrmsContext } from "../context/HrmsContext";
import "./Employees.css";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  savePerformanceInsight,
  getEmployeeAiIntelligence,
  resendCredentials,
  getEmployeePerformanceScore
} from "../services/ApiService";

function Employees() {
  const {
    attendance = [],
    performances = [],
    recruitments = [],
    leaves = []
  } = useContext(HrmsContext);

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Filter and Sorting States
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [performanceScoreData, setPerformanceScoreData] = useState(null);

  const getEmployeePerformanceScoreLocal = (employee) => {
    if (!employee) return null;
    const logs = attendance.filter(a => String(a.employee?.id || a.employeeId) === String(employee.id));
    const presentLogs = logs.filter(a => a.status?.toUpperCase() === "PRESENT");
    const attendanceScore = logs.length > 0 ? Math.round((presentLogs.length / logs.length) * 100) : 100;

    let attendancePoints = 100;
    if (attendanceScore >= 95) attendancePoints = 100;
    else if (attendanceScore >= 85) attendancePoints = 90;
    else if (attendanceScore >= 75) attendancePoints = 80;
    else if (attendanceScore >= 60) attendancePoints = 60;
    else attendancePoints = 40;

    const leaveCount = leaves.filter(l => String(l.employeeId) === String(employee.id)).length;
    let leavePoints = 100;
    if (leaveCount <= 2) leavePoints = 100;
    else if (leaveCount <= 5) leavePoints = 85;
    else if (leaveCount <= 8) leavePoints = 70;
    else leavePoints = 50;

    const onTimeLogs = logs.filter(a => a.status?.toUpperCase() === "PRESENT" && (!a.checkIn || a.checkIn <= "09:15"));
    const punctualityScore = logs.length > 0 ? Math.round((onTimeLogs.length / logs.length) * 100) : 100;
    let punctualityPoints = 100;
    if (punctualityScore >= 95) punctualityPoints = 100;
    else if (punctualityScore >= 85) punctualityPoints = 90;
    else if (punctualityScore >= 75) punctualityPoints = 80;
    else punctualityPoints = 60;

    const perfReview = performances.find(p => String(p.employeeId) === String(employee.id));
    const rating = perfReview?.rating || 4;
    const reviewPoints = rating * 20;

    const assignedTasks = 10 + (employee.id % 5);
    const completedTasks = 8 + (employee.id % 3);
    const taskCompletionScore = Math.round((completedTasks / assignedTasks) * 100);

    const performanceScore = Math.round(
      (attendancePoints * 0.3) +
      (taskCompletionScore * 0.25) +
      (punctualityPoints * 0.15) +
      (reviewPoints * 0.15) +
      (leavePoints * 0.15)
    );

    let performanceLevel;
    if (performanceScore >= 90) performanceLevel = "Outstanding Performer";
    else if (performanceScore >= 80) performanceLevel = "Excellent Performer";
    else if (performanceScore >= 70) performanceLevel = "Good Performer";
    else if (performanceScore >= 60) performanceLevel = "Average Performer";
    else performanceLevel = "Needs Improvement";

    return {
      employeeId: employee.employeeId,
      employeeName: employee.name,
      performanceScore,
      performanceLevel,
      attendanceScore,
      leaveScore: leavePoints,
      punctualityScore,
      taskCompletionScore,
      reviewScore: reviewPoints
    };
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleResendCredentials = async (id) => {
    try {
      const res = await resendCredentials(id);
      if (res.data && res.data.emailSent) {
        showToast("success", "Credentials Resent", "Login credentials resent to employee email.");
      } else {
        showToast("warning", "Resend Failed", "New temporary credentials generated but email delivery failed.");
      }
      loadEmployees();
    } catch (err) {
      console.error(err);
      showToast("error", "Error", "Failed to resend credentials.");
    }
  };
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [aiIntelligence, setAiIntelligence] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);

  // Form Tabs state (for Add/Edit Modal)
  const [activeFormTab, setActiveFormTab] = useState("basic");

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
    salary: "",
    employeeId: "",
    mobileNumber: "",
    address: "",
    skills: "",
    experience: "",
    designation: "",
    profileInformation: "",
    status: "Active",
    username: "",
    password: "",
  });

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data || []);
      localStorage.setItem("employees", JSON.stringify(res.data || []));
    } catch (err) {
      console.log(err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveEmployee = async () => {
    try {
      if (!form.name || !form.email || !form.department || !form.salary) {
        alert("Please fill all required basic fields.");
        return;
      }

      const emailExists = employees.some(
        (emp) =>
          emp.email.toLowerCase() === form.email.toLowerCase() &&
          emp.id !== form.id
      );

      if (emailExists) {
        alert("Employee Email already exists!");
        return;
      }

      if (Number(form.salary) <= 0) {
        alert("Salary must be greater than 0");
        return;
      }

      const generatePassword = () => {
        return (
          "EMP@" +
          Math.random().toString(36).slice(-6) +
          Math.floor(Math.random() * 100)
        );
      };

      const password = form.password || generatePassword();
      const payload = {
        id: form.id || null,
        name: form.name,
        email: form.email,
        department: {
          departmentId: Number(form.department)
        },
        salary: Number(form.salary),
        username:
          form.username ||
          form.name.toLowerCase().replace(/\s/g, ""),
        password: password,
        employeeId: form.employeeId || null,
        mobileNumber: form.mobileNumber || "",
        address: form.address || "",
        skills: form.skills || "",
        resume: form.resume || "",
        experience: form.experience || "",
        designation: form.designation || "Software Engineer",
        profileInformation: form.profileInformation || "",
        status: form.status || "Active",
      };

      if (editMode) {
        await updateEmployee(form.id, payload);
        showToast("success", "Employee Updated Successfully", "Employee details successfully updated.");
      } else {
        const res = await addEmployee(payload);
        if (res.data && res.data.emailSent) {
          showToast("success", "Employee Added Successfully", "Login credentials sent to employee email.");
        } else {
          showToast("warning", "Employee created with warning", "Employee created successfully but email delivery failed.");
        }
      }

      loadEmployees();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.log(err);
      alert("Error saving employee");
    }
  };

  const handleEdit = (emp) => {
    setForm({
      ...emp,
      department: emp.department?.departmentId || "",
      status: emp.status || "Active",
    });
    setEditMode(true);
    setActiveFormTab("basic");
    setShowAddModal(true);
  };

  const handleView = (emp) => {
    setSelectedEmp(emp);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        loadEmployees();
      } catch (err) {
        console.log(err);
        alert("Delete failed");
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      email: "",
      department: "",
      salary: "",
      employeeId: "",
      mobileNumber: "",
      address: "",
      skills: "",
      resume: "",
      experience: "",
      designation: "",
      profileInformation: "",
      status: "Active",
      username: "",
      password: "",
    });
    setEditMode(false);
  };

  const handleShowAiInsights = async (emp) => {
    setSelectedEmp(emp);
    setShowAiModal(true);
    setAiIntelligence(null);
    setPerformanceScoreData(null);
    setLoadingIntelligence(true);
    try {
      const [aiRes, scoreRes] = await Promise.all([
        getEmployeeAiIntelligence(emp.id),
        getEmployeePerformanceScore(emp.id)
      ]);
      if (aiRes.data) {
        setAiIntelligence(aiRes.data);
        savePerformanceInsight({
          employeeId: emp.id,
          employeeName: emp.name,
          performanceSummary: aiRes.data.productivityAnalysis || "",
          trainingRecommendations: aiRes.data.recommendations?.join(" | ") || "",
          rating: (aiRes.data.performanceScore / 20.0) || 4.0
        }).catch(err => console.error("Error saving Performance AI Insight:", err));
      }
      if (scoreRes.data) {
        setPerformanceScoreData(scoreRes.data);
      }
    } catch (err) {
      console.error("Error fetching employee intelligence/score:", err);
    } finally {
      setLoadingIntelligence(false);
    }
  };

  const getEmployeeAiInsights = (employee) => {
    if (!employee) return null;
    const recRecord = recruitments.find(r => r.email?.toLowerCase() === employee.email?.toLowerCase());
    
    const skills = recRecord?.skills || employee.skills || (
      employee.department?.departmentName === "Engineering" 
        ? "Java, Spring Boot, React, SQL, Git, REST APIs" 
        : employee.department?.departmentName === "Human Resources"
        ? "Talent Acquisition, Employee Relations, HR Policies, Communication"
        : "Microsoft Office, Operations, Customer Service, Time Management"
    );
    
    const logs = attendance.filter(a => String(a.employee?.id || a.employeeId) === String(employee.id));
    const presentLogs = logs.filter(a => a.status?.toUpperCase() === "PRESENT");
    const attendanceScore = logs.length > 0 ? Math.round((presentLogs.length / logs.length) * 100) : 0;

    const perfReview = performances.find(p => String(p.employeeId) === String(employee.id) || p.employeeName?.toLowerCase() === employee.name?.toLowerCase());
    const rating = perfReview?.rating || 4;
    const reviewText = perfReview?.remarks || "Solid team player, consistent output, meets expectations.";
    const performanceScore = Math.round((attendanceScore * 0.4) + (rating * 20.0 * 0.4) + (80 * 0.2));

    const reqSkills = employee.department?.departmentName === "Engineering"
      ? ["Java", "Spring Boot", "React", "Docker", "Kubernetes", "AWS"]
      : ["Negotiation", "Lead Generation", "CRM (Salesforce)", "Market Research"];

    const currentSkillsList = skills.split(",").map(s => s.trim().toLowerCase());
    const missingSkills = reqSkills.filter(s => !currentSkillsList.some(cs => cs.includes(s.toLowerCase())));

    const trainingRecs = missingSkills.map(s => {
      if (s === "Docker" || s === "Kubernetes") return `Cloud-Native Scaling: Advanced ${s} BootCamp`;
      if (s === "AWS") return "AWS Certified Solutions Architect Course";
      return `Advanced Certification Program in ${s}`;
    });

    return {
      employeeName: employee.name,
      department: employee.department?.departmentName || "General",
      role: employee.designation || "Employee",
      attendanceScore,
      performanceScore,
      productivityAnalysis: reviewText,
      skillStrengths: skills.split(",").map(s => s.trim()),
      improvementAreas: missingSkills.length > 0 ? missingSkills : ["Advanced architectural concepts"],
      recommendations: trainingRecs.length > 0 ? trainingRecs : ["Sponsoring advanced corporate leadership programs."]
    };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return " ↕️";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  // Get dynamic unique designations for filters
  const uniqueRoles = Array.from(new Set(employees.map(e => e.designation || "Software Engineer")));

  const filtered = employees.filter((e) => {
    const matchesSearch = 
      e.name?.toLowerCase().includes(search.toLowerCase()) || 
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId && e.employeeId.toLowerCase().includes(search.toLowerCase()));
      
    const matchesDept = deptFilter === "" || String(e.department?.departmentId) === String(deptFilter);
    const matchesRole = roleFilter === "" || e.designation === roleFilter;
    const matchesStatus = statusFilter === "" || (e.status || "Active") === statusFilter;
    
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === "department") {
      valA = a.department?.departmentName || "";
      valB = b.department?.departmentName || "";
    }
    
    if (sortField === "salary") {
      valA = Number(a.salary || 0);
      valB = Number(b.salary || 0);
    }
    
    if (sortField === "id") {
      valA = Number(a.id || 0);
      valB = Number(b.id || 0);
    }

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats Calculations
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => (e.status || "Active") === "Active").length;
  const onLeaveCount = employees.filter(e => e.status === "On Leave").length;
  const newJoinersCount = employees.filter(e => e.employeeId && e.employeeId.includes("2026")).length;
  const avgSalary = employees.length > 0 
    ? Math.round(employees.reduce((a, b) => a + Number(b.salary || 0), 0) / employees.length) 
    : 0;

  // Exports
  const exportToCSV = () => {
    const headers = ["Employee ID", "Name", "Email", "Phone", "Designation", "Department", "Salary", "Status", "Username"];
    const rows = filtered.map(e => [
      e.employeeId || `EMP${1000 + e.id}`,
      e.name,
      e.email,
      e.mobileNumber || "N/A",
      e.designation || "Software Engineer",
      e.department?.departmentName || "General",
      e.salary,
      e.status || "Active",
      e.username
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hrms_employees_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitialsAvatar = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="employee-container">
      {/* Page Header */}
      <div className="emp-header-section">
        <div className="emp-header-title">
          <h1>👨‍💼 Employee Management</h1>
          <p>Manage employee records, filter roles, track status metrics, and query profile intelligence.</p>
        </div>
        <button 
          className="emp-btn emp-btn-primary" 
          onClick={() => {
            resetForm();
            setEditMode(false);
            setActiveFormTab("basic");
            setShowAddModal(true);
          }}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="emp-stats-grid">
        <div className="emp-stat-card info">
          <div className="emp-stat-icon-wrapper">👥</div>
          <div className="emp-stat-info">
            <span className="emp-stat-number">{totalEmployees}</span>
            <span className="emp-stat-label">Total Employees</span>
          </div>
        </div>
        <div className="emp-stat-card success">
          <div className="emp-stat-icon-wrapper">🟢</div>
          <div className="emp-stat-info">
            <span className="emp-stat-number">{activeCount}</span>
            <span className="emp-stat-label">Active Employees</span>
          </div>
        </div>
        <div className="emp-stat-card warning">
          <div className="emp-stat-icon-wrapper">🏖️</div>
          <div className="emp-stat-info">
            <span className="emp-stat-number">{onLeaveCount}</span>
            <span className="emp-stat-label">On Leave</span>
          </div>
        </div>
        <div className="emp-stat-card secondary">
          <div className="emp-stat-icon-wrapper">🆕</div>
          <div className="emp-stat-info">
            <span className="emp-stat-number">{newJoinersCount}</span>
            <span className="emp-stat-label">New Joiners</span>
          </div>
        </div>
        <div className="emp-stat-card success">
          <div className="emp-stat-icon-wrapper">💰</div>
          <div className="emp-stat-info">
            <span className="emp-stat-number">₹{avgSalary.toLocaleString("en-IN")}</span>
            <span className="emp-stat-label">Average Salary</span>
          </div>
        </div>
      </div>

      {/* Advanced Toolbar Filters */}
      <div className="emp-toolbar">
        <div className="emp-toolbar-left">
          <div className="emp-search-wrapper">
            <span className="emp-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID, name, or email..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <select 
            value={deptFilter} 
            onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }} 
            className="emp-filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
            ))}
          </select>

          <select 
            value={roleFilter} 
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }} 
            className="emp-filter-select"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            className="emp-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
            <option value="Probation">Probation</option>
          </select>
        </div>

        <div className="emp-toolbar-right">
          <button className="emp-btn emp-btn-secondary" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Redesigned Table Card */}
      <div className="emp-table-card">
        <div className="emp-table-wrapper">
          <table className="emp-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("employeeId")}>ID {renderSortIndicator("employeeId")}</th>
                <th onClick={() => handleSort("name")}>Employee Profile {renderSortIndicator("name")}</th>
                <th onClick={() => handleSort("designation")}>Role {renderSortIndicator("designation")}</th>
                <th onClick={() => handleSort("department")}>Department {renderSortIndicator("department")}</th>
                <th onClick={() => handleSort("salary")}>Salary {renderSortIndicator("salary")}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((e, idx) => (
                  <tr key={e.id} className="emp-table-row">
                    <td>
                      <strong style={{ color: "var(--accent-primary)", fontSize: "13px" }}>
                        {e.employeeId || `EMP${1000 + e.id}`}
                      </strong>
                    </td>
                    <td>
                      <div className="emp-profile-cell">
                        <div className={`emp-avatar-initials ${idx % 2 === 0 ? "" : "sec"}`}>
                          {getInitialsAvatar(e.name)}
                        </div>
                        <div className="emp-profile-details">
                          <span className="emp-profile-name">{e.name}</span>
                          <span className="emp-profile-sub">{e.email}</span>
                          {e.mobileNumber && <span className="emp-profile-sub">📞 {e.mobileNumber}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="emp-badge-role">
                        {e.designation || "Software Engineer"}
                      </span>
                    </td>
                    <td>
                      <span className="emp-badge-dept">
                        {e.department?.departmentName || "General"}
                      </span>
                    </td>
                    <td>
                      <span className="emp-salary-pill">
                        ₹{Number(e.salary || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <span className={`emp-badge-status ${(e.status || "Active").toLowerCase().replace(" ", "-")}`}>
                        {e.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="emp-action-cell-flex">
                        <button 
                          className="emp-action-icon-btn edit" 
                          title="Edit Profile"
                          onClick={() => handleEdit(e)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="emp-action-icon-btn view" 
                          title="View Details"
                          onClick={() => handleView(e)}
                        >
                          👁️
                        </button>
                        <button 
                          className="emp-action-icon-btn ai" 
                          title="AI Profile Intelligence"
                          onClick={() => handleShowAiInsights(e)}
                        >
                          🧠
                        </button>
                        <button 
                          className="emp-action-icon-btn credentials" 
                          title="Resend Credentials"
                          onClick={() => handleResendCredentials(e.id)}
                          style={{ fontSize: "14px" }}
                        >
                          ✉️
                        </button>
                        <button 
                          className="emp-action-icon-btn delete" 
                          title="Delete Employee"
                          onClick={() => handleDelete(e.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="emp-empty-state">
                      <div className="emp-empty-icon">🔍</div>
                      <div className="emp-empty-title">No employees found</div>
                      <div className="emp-empty-text">No employee records match the search terms or filters selected.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="emp-pagination-row">
            <span style={{ color: "var(--text-secondary)" }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sorted.length)} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
            </span>
            <div className="emp-page-indicators">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="emp-page-btn"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="emp-page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-container">
            <div className="emp-modal-header">
              <h2 className="emp-modal-title">{editMode ? "✏️ Edit Employee Account" : "➕ Add New Employee"}</h2>
              <button className="emp-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="emp-modal-body">
              {/* Form Tab selectors */}
              <div className="emp-form-tabs">
                <button 
                  className={`emp-form-tab ${activeFormTab === "basic" ? "active" : ""}`} 
                  onClick={() => setActiveFormTab("basic")}
                >
                  Basic Info
                </button>
                <button 
                  className={`emp-form-tab ${activeFormTab === "professional" ? "active" : ""}`} 
                  onClick={() => setActiveFormTab("professional")}
                >
                  Professional Specs
                </button>
                {editMode && (
                  <button 
                    className={`emp-form-tab ${activeFormTab === "credentials" ? "active" : ""}`} 
                    onClick={() => setActiveFormTab("credentials")}
                  >
                    System Account
                  </button>
                )}
              </div>

              {activeFormTab === "basic" && (
                <div className="emp-form-grid">
                  <div className="emp-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  
                  <div className="emp-form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange}
                      placeholder="e.g. email@domain.com"
                    />
                  </div>

                  <div className="emp-form-group">
                    <label>Mobile Number</label>
                    <input 
                      type="text" 
                      name="mobileNumber" 
                      value={form.mobileNumber} 
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div className="emp-form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="emp-form-group">
                    <label>Designation / Role *</label>
                    <input 
                      type="text" 
                      name="designation" 
                      value={form.designation} 
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  <div className="emp-form-group">
                    <label>Department *</label>
                    <select name="department" value={form.department} onChange={handleChange}>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="emp-form-group">
                    <label>Salary (INR ₹) *</label>
                    <input 
                      type="number" 
                      min="0"
                      name="salary" 
                      value={form.salary} 
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      className="no-spinner"
                    />
                  </div>

                  <div className="emp-form-group">
                    <label>Employee Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Probation">Probation</option>
                    </select>
                  </div>
                </div>
              )}

              {activeFormTab === "professional" && (
                <div className="emp-form-grid">
                  <div className="emp-form-group emp-form-grid-full">
                    <label>Skills (Comma Separated)</label>
                    <input 
                      type="text" 
                      name="skills" 
                      value={form.skills} 
                      onChange={handleChange}
                      placeholder="e.g. Java, Spring Boot, React, SQL"
                    />
                  </div>

                  <div className="emp-form-group emp-form-grid-full">
                    <label>Experience Years / Internships</label>
                    <input 
                      type="text" 
                      name="experience" 
                      value={form.experience} 
                      onChange={handleChange}
                      placeholder="e.g. 3 Years"
                    />
                  </div>

                  <div className="emp-form-group emp-form-grid-full">
                    <label>Profile Summary / Information</label>
                    <textarea 
                      name="profileInformation" 
                      value={form.profileInformation} 
                      onChange={handleChange}
                      rows="4"
                      placeholder="Qualifications, certifications, department override details..."
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "credentials" && editMode && (
                <div className="emp-form-grid">
                  <div className="emp-form-group">
                    <label>System Username</label>
                    <input 
                      type="text" 
                      name="username" 
                      value={form.username} 
                      onChange={handleChange}
                    />
                  </div>

                  <div className="emp-form-group">
                    <label>System Password</label>
                    <input 
                      type="text" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="emp-modal-footer">
              <button className="emp-btn emp-btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="emp-btn emp-btn-primary" onClick={saveEmployee}>
                Save Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Detail Modal */}
      {showViewModal && selectedEmp && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-container" style={{ width: "650px" }}>
            <div className="emp-modal-header">
              <h2 className="emp-modal-title">👁️ View Employee Profile</h2>
              <button className="emp-modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            
            <div className="emp-modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header card */}
              <div className="emp-ai-header">
                <div className="emp-ai-avatar">
                  {getInitialsAvatar(selectedEmp.name)}
                </div>
                <div className="emp-ai-header-info">
                  <h3>{selectedEmp.name}</h3>
                  <p>{selectedEmp.designation || "Software Engineer"} | {selectedEmp.department?.departmentName || "General"}</p>
                  <span className={`emp-badge-status ${(selectedEmp.status || "Active").toLowerCase().replace(" ", "-")}`} style={{ marginTop: "6px" }}>
                    {selectedEmp.status || "Active"}
                  </span>
                </div>
              </div>

              {/* Grid sections */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="emp-ai-metric-item">
                  <span className="emp-ai-metric-label">Employee ID</span>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                    {selectedEmp.employeeId || `EMP${1000 + selectedEmp.id}`}
                  </strong>
                </div>

                <div className="emp-ai-metric-item">
                  <span className="emp-ai-metric-label">Compensation (Salary)</span>
                  <strong style={{ fontSize: "14px", color: "var(--hrms-success)" }}>
                    ₹{Number(selectedEmp.salary || 0).toLocaleString("en-IN")} / month
                  </strong>
                </div>

                <div className="emp-ai-metric-item" style={{ gridColumn: "span 2" }}>
                  <span className="emp-ai-metric-label">Contact Details</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--text-primary)", marginTop: "4px" }}>
                    <div>📧 <strong>Email:</strong> {selectedEmp.email}</div>
                    <div>📞 <strong>Phone:</strong> {selectedEmp.mobileNumber || "Not Specified"}</div>
                    {selectedEmp.address && <div>📍 <strong>Address:</strong> {selectedEmp.address}</div>}
                  </div>
                </div>

                <div className="emp-ai-metric-item" style={{ gridColumn: "span 2" }}>
                  <span className="emp-ai-metric-label">Professional Info</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--text-primary)", marginTop: "4px" }}>
                    <div>⚡ <strong>Experience:</strong> {selectedEmp.experience || "Not Specified"}</div>
                    <div>🧠 <strong>Skills:</strong> {selectedEmp.skills || "Not Specified"}</div>
                    {selectedEmp.profileInformation && <div>📝 <strong>Bio:</strong> {selectedEmp.profileInformation}</div>}
                  </div>
                </div>

                <div className="emp-ai-metric-item" style={{ gridColumn: "span 2", background: "rgba(79, 70, 229, 0.04)" }}>
                  <span className="emp-ai-metric-label" style={{ color: "var(--hrms-primary)" }}>Account credentials (SSO/Portal Access)</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--text-primary)", marginTop: "4px" }}>
                    <div>👤 <strong>Username:</strong> {selectedEmp.username}</div>
                    <div>🔑 <strong>Password:</strong> {selectedEmp.password}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button className="emp-btn emp-btn-primary" onClick={() => setShowViewModal(false)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 AI Insights Modal */}
      {showAiModal && selectedEmp && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-container" style={{ width: "580px" }}>
            <div className="emp-modal-header">
              <h2 className="emp-modal-title">🧠 AI Profile Intelligence Insights</h2>
              <button className="emp-modal-close" onClick={() => setShowAiModal(false)}>×</button>
            </div>

            <div className="emp-modal-body">
              {loadingIntelligence ? (
                <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-secondary)" }}>
                  <div className="spinner" style={{ border: "4px solid rgba(0,0,0,0.1)", width: "36px", height: "36px", borderRadius: "50%", borderLeftColor: "var(--hrms-primary)", animation: "spin 1s linear infinite", margin: "0 auto 15px auto" }}></div>
                  <p style={{ color: "var(--text-primary)", fontWeight: "600" }}>Querying Profile Intelligence & generating report...</p>
                </div>
              ) : (
                (() => {
                  const data = aiIntelligence || getEmployeeAiInsights(selectedEmp);
                  const scoreData = performanceScoreData || getEmployeePerformanceScoreLocal(selectedEmp);
                  if (!data || !scoreData) return <p>No data available</p>;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* header summary */}
                      <div className="emp-ai-header">
                        <div className="emp-ai-avatar">
                          {getInitialsAvatar(selectedEmp.name)}
                        </div>
                        <div className="emp-ai-header-info">
                          <h3>{selectedEmp.name}</h3>
                          <p>{data.role || "Software Engineer"} | {data.department || "General"}</p>
                          {scoreData.performanceScore >= 90 && (
                            <span style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase", marginTop: "5px" }}>⭐ Top Performer</span>
                          )}
                        </div>
                      </div>

                      {/* circular performance score indicator & performance level banner */}
                      <div className="glass-card" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                        padding: "20px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        <div style={{
                          position: "relative",
                          width: "80px",
                          height: "80px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: `conic-gradient(var(--hrms-primary) ${scoreData.performanceScore}%, rgba(255, 255, 255, 0.1) 0)`,
                          boxShadow: "0 0 15px rgba(79, 70, 229, 0.2)"
                        }}>
                          <div style={{
                            width: "68px",
                            height: "68px",
                            borderRadius: "50%",
                            background: "var(--bg-app-card, #1e1e2d)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "800",
                            fontSize: "20px"
                          }}>
                            {scoreData.performanceScore}%
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>
                            Overall Performance Rating
                          </span>
                          <h4 style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: "800",
                            color: scoreData.performanceScore >= 90 ? "#10B981" : scoreData.performanceScore >= 80 ? "#3B82F6" : scoreData.performanceScore >= 70 ? "#F59E0B" : "#EF4444"
                          }}>
                            {scoreData.performanceLevel}
                          </h4>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            Recalculated automatically on attendance, leave, task, or review changes.
                          </span>
                        </div>
                      </div>

                      {/* dynamic score impact breakdown progress bars */}
                      <div className="emp-ai-section">
                        <h4 className="emp-ai-section-title">📊 Key Metrics & Score Impacts</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                          
                          {/* Attendance Impact */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ fontWeight: "600" }}>📅 Attendance Rate (30% weight)</span>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{scoreData.attendanceScore}%</span>
                            </div>
                            <div className="emp-ai-progress-bar" style={{ height: "6px" }}>
                              <div className="emp-ai-progress-fill success" style={{
                                width: `${scoreData.attendanceScore}%`,
                                background: "var(--hrms-success)"
                              }}></div>
                            </div>
                          </div>

                          {/* Task Completion Impact */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ fontWeight: "600" }}>🎯 Task Completion (25% weight)</span>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{scoreData.taskCompletionScore}%</span>
                            </div>
                            <div className="emp-ai-progress-bar" style={{ height: "6px" }}>
                              <div className="emp-ai-progress-fill" style={{
                                width: `${scoreData.taskCompletionScore}%`,
                                background: "#06B6D4"
                              }}></div>
                            </div>
                          </div>

                          {/* Punctuality Impact */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ fontWeight: "600" }}>⏰ Punctuality arrivals (15% weight)</span>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{scoreData.punctualityScore}%</span>
                            </div>
                            <div className="emp-ai-progress-bar" style={{ height: "6px" }}>
                              <div className="emp-ai-progress-fill" style={{
                                width: `${scoreData.punctualityScore}%`,
                                background: "#F59E0B"
                              }}></div>
                            </div>
                          </div>

                          {/* Performance Review Impact */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ fontWeight: "600" }}>🗣️ Manager Review Rating (15% weight)</span>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{scoreData.reviewScore}%</span>
                            </div>
                            <div className="emp-ai-progress-bar" style={{ height: "6px" }}>
                              <div className="emp-ai-progress-fill" style={{
                                width: `${scoreData.reviewScore}%`,
                                background: "var(--hrms-primary)"
                              }}></div>
                            </div>
                          </div>

                          {/* Leave Behavior Impact */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ fontWeight: "600" }}>🌴 Leave Behavior Score (15% weight)</span>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{scoreData.leaveScore}%</span>
                            </div>
                            <div className="emp-ai-progress-bar" style={{ height: "6px" }}>
                              <div className="emp-ai-progress-fill" style={{
                                width: `${scoreData.leaveScore}%`,
                                background: "#EF4444"
                              }}></div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Productivity Analysis text */}
                      <div className="emp-ai-section">
                        <h4 className="emp-ai-section-title">📊 Productivity Analysis & Strengths</h4>
                        <p className="emp-ai-text">{data.productivityAnalysis}</p>
                      </div>

                      {/* Skill Strengths */}
                      <div className="emp-ai-section">
                        <h4 className="emp-ai-section-title">🧠 Skill Strengths</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                          {data.skillStrengths && data.skillStrengths.length > 0 ? data.skillStrengths.map((s, idx) => (
                            <span key={idx} style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--hrms-success)", fontSize: "11.5px", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
                              {s.trim()}
                            </span>
                          )) : <span className="emp-ai-text">None</span>}
                        </div>
                      </div>

                      {/* Skill Gaps & Improvement Areas */}
                      <div className="emp-ai-section">
                        <h4 className="emp-ai-section-title">⚠️ Improvement Areas (Skill Gaps)</h4>
                        {data.improvementAreas && data.improvementAreas.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                            {data.improvementAreas.map((s, idx) => (
                              <span key={idx} style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--hrms-danger)", fontSize: "11.5px", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="emp-ai-text" style={{ color: "var(--hrms-success)", fontWeight: "700" }}>✅ All role requirements fully satisfied.</p>
                        )}
                      </div>

                      {/* AI Recommendations */}
                      <div className="emp-ai-section">
                        <h4 className="emp-ai-section-title">💡 Actionable AI Recommendations</h4>
                        <ul className="emp-ai-list">
                          {data.recommendations && data.recommendations.map((rec, idx) => (
                            <li key={idx}>🎓 {rec}</li>
                          ))}
                          <li>🚀 Provide advanced coaching seminars inside their department group.</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            <div className="emp-modal-footer">
              <button className="emp-btn emp-btn-primary" onClick={() => setShowAiModal(false)}>
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div 
          className="glass-card success-pop"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "16px 20px",
            borderRadius: "12px",
            border: toast.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : toast.type === "warning" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.12)" : toast.type === "warning" ? "rgba(245, 158, 11, 0.12)" : "rgba(239, 68, 68, 0.12)",
            color: toast.type === "success" ? "#10b981" : toast.type === "warning" ? "#f59e0b" : "#ef4444",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "300px",
            maxWidth: "400px",
            animation: "successPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "800", fontSize: "14px" }}>
              {toast.type === "success" ? "✓ " : toast.type === "warning" ? "⚠ " : "❌ "}
              {toast.title}
            </span>
            <button onClick={() => setToast(null)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: "14px", fontWeight: "700", padding: "0" }}>×</button>
          </div>
          <span style={{ fontSize: "12.5px", opacity: 0.9 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Employees;