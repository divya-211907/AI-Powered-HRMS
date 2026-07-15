import axios from "axios";

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

// Automatically inject HR partition header and Gemini key
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user && user.role === "HR") {
    if (user.id) {
      config.headers["X-HR-Id"] = user.id;
    }
    if (user.email) {
      config.headers["X-HR-Email"] = user.email;
    }
    if (user.name) {
      config.headers["X-HR-Name"] = user.name;
    }
  }
  const apiKey = localStorage.getItem("gemini_api_key");
  if (apiKey) {
    config.headers["X-Gemini-API-Key"] = apiKey;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/* ================= SEED DATA ================= */
const initialDepartments = [
  { departmentId: 1, departmentName: "Engineering", manager: "Siddharth Sen", employeeCount: 2 },
  { departmentId: 2, departmentName: "Human Resources", manager: "Anjali Gupta", employeeCount: 1 },
  { departmentId: 3, departmentName: "Sales", manager: "Vikram Malhotra", employeeCount: 1 }
];

const initialEmployees = [
  { id: 1, name: "Arjun Sharma", email: "arjun.sharma@example.com", username: "arjun", password: "password123", department: { departmentId: 1, departmentName: "Engineering" }, salary: 95000 },
  { id: 2, name: "Priya Patel", email: "priya.patel@example.com", username: "priya", password: "password123", department: { departmentId: 1, departmentName: "Engineering" }, salary: 88000 },
  { id: 3, name: "Rohan Mehta", email: "rohan.mehta@example.com", username: "rohan", password: "password123", department: { departmentId: 2, departmentName: "Human Resources" }, salary: 75000 },
  { id: 4, name: "Neha Nair", email: "neha.nair@example.com", username: "neha", password: "password123", department: { departmentId: 3, departmentName: "Sales" }, salary: 65000 }
];

const initialLeaves = [
  { id: 1, employeeId: 1, employeeName: "Arjun Sharma", reason: "Annual family trip", fromDate: "2026-07-15", toDate: "2026-07-20", status: "APPROVED" },
  { id: 2, employeeId: 2, employeeName: "Priya Patel", reason: "Medical leave", fromDate: "2026-07-05", toDate: "2026-07-06", status: "PENDING" }
];

const initialPayrolls = [
  { id: 1, employeeId: 1, employeeName: "Arjun Sharma", month: "June 2026", basicSalary: 95000, allowances: 5000, deductions: 2500, netSalary: 97500, status: "PAID" },
  { id: 2, employeeId: 2, employeeName: "Priya Patel", month: "June 2026", basicSalary: 88000, allowances: 4000, deductions: 2000, netSalary: 90000, status: "PAID" },
  { id: 3, employeeId: 3, employeeName: "Rohan Mehta", month: "June 2026", basicSalary: 75000, allowances: 3000, deductions: 1500, netSalary: 76500, status: "PAID" }
];

const initialAttendance = [
  { id: 1, employeeId: 1, employeeName: "Arjun Sharma", date: "2026-07-02", checkInTime: "09:05:00", checkOutTime: "18:00:00", status: "PRESENT" },
  { id: 2, employeeId: 2, employeeName: "Priya Patel", date: "2026-07-02", checkInTime: "09:15:00", checkOutTime: "18:05:00", status: "PRESENT" }
];

const initialRecruitments = [
  { id: 1, candidateName: "Karan Johar", email: "karan@example.com", position: "Fullstack Engineer", status: "SHORTLISTED", resumeUrl: "resume_karan.pdf" },
  { id: 2, candidateName: "Simran Kaur", email: "simran@example.com", position: "UI/UX Designer", status: "APPLIED", resumeUrl: "resume_simran.pdf" }
];

const initialPerformances = [
  { id: 1, employeeId: 1, employeeName: "Arjun Sharma", rating: 4.8, review: "Outstanding tech lead. Consistently delivers features ahead of schedule.", evaluatedBy: "HR Manager" },
  { id: 2, employeeId: 2, employeeName: "Priya Patel", rating: 4.2, review: "Solid software developer, team player, works well under pressure.", evaluatedBy: "HR Manager" }
];

const initialPermissions = [
  { id: 1, employeeId: 1, employeeName: "Arjun Sharma", reason: "Short leave for dentist appointment", status: "PENDING" }
];

/* ================= MOCK DATABASE ================= */
const mockDb = {
  get: (key) => JSON.parse(localStorage.getItem(`mock_${key}`)) || [],
  set: (key, val) => localStorage.setItem(`mock_${key}`, JSON.stringify(val)),
  init: () => {
    if (!localStorage.getItem("mock_initialized")) {
      mockDb.set("departments", initialDepartments);
      mockDb.set("employees", initialEmployees);
      mockDb.set("leaves", initialLeaves);
      mockDb.set("payrolls", initialPayrolls);
      mockDb.set("attendance", initialAttendance);
      mockDb.set("recruitments", initialRecruitments);
      mockDb.set("performances", initialPerformances);
      mockDb.set("permissions", initialPermissions);
      localStorage.setItem("mock_initialized", "true");
    }
  }
};

mockDb.init();

// Unified handler for fallbacks
const handleRequest = async (axiosCall, mockFallback) => {
  try {
    return await axiosCall();
  } catch (err) {
    if (err.code === "ERR_NETWORK" || !err.response) {
      console.warn("HRMS Backend Offline. Falling back to local storage mock database.");
      const mockResult = mockFallback();
      return { data: mockResult };
    }
    throw err;
  }
};

/* ================= EMPLOYEE ================= */

export const getEmployees = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/employees`),
    () => mockDb.get("employees")
  );

export const addEmployee = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/employees`, data),
    () => {
      const emps = mockDb.get("employees");
      const nextId = emps.length ? Math.max(...emps.map(e => e.id)) + 1 : 1;
      const newEmp = { ...data, id: nextId };
      const depts = mockDb.get("departments");
      const dept = depts.find(d => d.departmentId === Number(data.department?.departmentId));
      if (dept) {
        newEmp.department = dept;
        dept.employeeCount = (dept.employeeCount || 0) + 1;
        mockDb.set("departments", depts);
      }
      mockDb.set("employees", [...emps, newEmp]);
      return newEmp;
    }
  );

export const updateEmployee = (id, data) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/employees/${id}`, data),
    () => {
      const emps = mockDb.get("employees");
      const updated = emps.map(e => {
        if (e.id === Number(id)) {
          const depts = mockDb.get("departments");
          const dept = depts.find(d => d.departmentId === Number(data.department?.departmentId));
          return { ...e, ...data, department: dept || e.department };
        }
        return e;
      });
      mockDb.set("employees", updated);
      return data;
    }
  );

export const deleteEmployee = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/employees/${id}`),
    () => {
      const emps = mockDb.get("employees");
      const empToDelete = emps.find(e => e.id === Number(id));
      if (empToDelete) {
        const depts = mockDb.get("departments");
        const dept = depts.find(d => d.departmentId === empToDelete.department?.departmentId);
        if (dept && dept.employeeCount > 0) {
          dept.employeeCount -= 1;
          mockDb.set("departments", depts);
        }
      }
      mockDb.set("employees", emps.filter(e => e.id !== Number(id)));
      return { success: true };
    }
  );

export const resendCredentials = (id) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/employees/${id}/resend-credentials`),
    () => {
      const emps = mockDb.get("employees");
      const emp = emps.find(e => e.id === Number(id));
      if (!emp) throw new Error("Employee not found");
      return emp;
    }
  );

export const employeeLogin = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/employees/login`, data),
    () => {
      const emps = mockDb.get("employees");
      const emp = emps.find(e => e.username === data.username && e.password === data.password);
      if (!emp) throw new Error("Employee credentials do not match");
      return emp;
    }
  );

/* ================= LEAVE ================= */

export const getLeaves = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/leave/all`),
    () => mockDb.get("leaves")
  );

export const addLeave = (d) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/leave/apply`, d),
    () => {
      const leaves = mockDb.get("leaves");
      const newLeave = { ...d, id: leaves.length ? Math.max(...leaves.map(l => l.id)) + 1 : 1, status: "PENDING" };
      mockDb.set("leaves", [...leaves, newLeave]);
      return newLeave;
    }
  );

export const updateLeave = (id, d) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/leave/update/${id}`, d),
    () => {
      const leaves = mockDb.get("leaves");
      const updated = leaves.map(l => l.id === Number(id) ? { ...l, ...d } : l);
      mockDb.set("leaves", updated);
      return d;
    }
  );

export const deleteLeave = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/leave/delete/${id}`),
    () => {
      const leaves = mockDb.get("leaves");
      mockDb.set("leaves", leaves.filter(l => l.id !== Number(id)));
      return { success: true };
    }
  );

export const approveLeave = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/leave/approve/${id}`),
    () => {
      const leaves = mockDb.get("leaves");
      const updated = leaves.map(l => l.id === Number(id) ? { ...l, status: "APPROVED" } : l);
      mockDb.set("leaves", updated);
      return { success: true };
    }
  );

export const rejectLeave = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/leave/reject/${id}`),
    () => {
      const leaves = mockDb.get("leaves");
      const updated = leaves.map(l => l.id === Number(id) ? { ...l, status: "REJECTED" } : l);
      mockDb.set("leaves", updated);
      return { success: true };
    }
  );

/* ================= ATTENDANCE ================= */

export const employeeCheckIn = (employeeId) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/attendance/checkin/${employeeId}`),
    () => {
      const atts = mockDb.get("attendance");
      const emps = mockDb.get("employees");
      const emp = emps.find(e => e.id === Number(employeeId));
      const today = new Date().toISOString().split("T")[0];
      const newAtt = {
        id: atts.length ? Math.max(...atts.map(a => a.id)) + 1 : 1,
        employeeId: Number(employeeId),
        employeeName: emp ? emp.name : `Employee ${employeeId}`,
        date: today,
        checkInTime: new Date().toTimeString().split(" ")[0],
        checkOutTime: null,
        status: "PRESENT"
      };
      mockDb.set("attendance", [...atts, newAtt]);
      return newAtt;
    }
  );

export const employeeCheckOut = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/attendance/checkout/${id}`),
    () => {
      const atts = mockDb.get("attendance");
      const updated = atts.map(a => {
        if (a.id === Number(id)) {
          return { ...a, checkOutTime: new Date().toTimeString().split(" ")[0] };
        }
        return a;
      });
      mockDb.set("attendance", updated);
      return { success: true };
    }
  );

export const getAttendance = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/attendance`),
    () => mockDb.get("attendance")
  );

export const deleteAttendance = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/attendance/${id}`),
    () => {
      const atts = mockDb.get("attendance");
      mockDb.set("attendance", atts.filter(a => a.id !== Number(id)));
      return { success: true };
    }
  );

/* ================= PAYROLL ================= */

export const getPayrolls = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/payroll`),
    () => mockDb.get("payrolls")
  );

export const addPayroll = (d) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/payroll`, d),
    () => {
      const pays = mockDb.get("payrolls");
      const newPay = { ...d, id: pays.length ? Math.max(...pays.map(p => p.id)) + 1 : 1 };
      mockDb.set("payrolls", [...pays, newPay]);
      return newPay;
    }
  );

export const updatePayroll = (id, d) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/payroll/${id}`, d),
    () => {
      const pays = mockDb.get("payrolls");
      const updated = pays.map(p => p.id === Number(id) ? { ...p, ...d } : p);
      mockDb.set("payrolls", updated);
      return d;
    }
  );

export const deletePayroll = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/payroll/${id}`),
    () => {
      const pays = mockDb.get("payrolls");
      mockDb.set("payrolls", pays.filter(p => p.id !== Number(id)));
      return { success: true };
    }
  );

/* ================= PERFORMANCE ================= */

export const getPerformances = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/performance`),
    () => mockDb.get("performances")
  );

export const addPerformance = (d) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/performance`, d),
    () => {
      const perfs = mockDb.get("performances");
      const newPerf = { ...d, id: perfs.length ? Math.max(...perfs.map(p => p.id)) + 1 : 1 };
      mockDb.set("performances", [...perfs, newPerf]);
      return newPerf;
    }
  );

export const updatePerformance = (id, d) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/performance/${id}`, d),
    () => {
      const perfs = mockDb.get("performances");
      const updated = perfs.map(p => p.id === Number(id) ? { ...p, ...d } : p);
      mockDb.set("performances", updated);
      return d;
    }
  );

export const deletePerformance = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/performance/${id}`),
    () => {
      const perfs = mockDb.get("performances");
      mockDb.set("performances", perfs.filter(p => p.id !== Number(id)));
      return { success: true };
    }
  );

/* ================= RECRUITMENT ================= */

export const parseResume = (formData) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/recruitments/parse-resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
  );

export const getResumeExtraction = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/recruitments/${id}/resume-extraction`)
  );

export const getResumeAnalysis = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/recruitments/${id}/resume-analysis`)
  );

export const getRecruitments = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/recruitments`),
    () => mockDb.get("recruitments")
  );

export const addRecruitment = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/recruitments`, data),
    () => {
      const recs = mockDb.get("recruitments");
      const newRec = { ...data, id: recs.length ? Math.max(...recs.map(r => r.id)) + 1 : 1, status: "APPLIED" };
      mockDb.set("recruitments", [...recs, newRec]);
      return newRec;
    }
  );

export const updateRecruitment = (id, data) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/recruitments/${id}`, data),
    () => {
      const recs = mockDb.get("recruitments");
      const updated = recs.map(r => r.id === Number(id) ? { ...r, ...data } : r);
      mockDb.set("recruitments", updated);
      return data;
    }
  );

export const deleteRecruitment = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/recruitments/${id}`),
    () => {
      const recs = mockDb.get("recruitments");
      mockDb.set("recruitments", recs.filter(r => r.id !== Number(id)));
      return { success: true };
    }
  );

export const getFraudReport = (applicationId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/fraud/${applicationId}`),
    () => {
      const mockResult = {
        id: 1,
        candidateId: "mock@example.com",
        applicationId: applicationId,
        fraudScore: 18,
        riskLevel: "Low",
        duplicateScore: 10,
        aiAnalysis: "### 🔍 AI Recruitment Fraud Report\n- Base Risk Analysis: 18/100 (Low Risk)\n- Duplicate Resume Score: 10%\n- No duplicate contact details or experience overlaps found."
      };
      return mockResult;
    }
  );

/* ================= JOB OPENINGS ================= */

export const getJobOpenings = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/jobs`),
    () => mockDb.get("job_openings")
  );

export const createJobOpening = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/jobs`, data),
    () => {
      const jobs = mockDb.get("job_openings");
      const newJob = { ...data, id: jobs.length ? Math.max(...jobs.map(j => j.id)) + 1 : 1, createdAt: new Date().toISOString() };
      mockDb.set("job_openings", [...jobs, newJob]);
      return newJob;
    }
  );

export const deleteJobOpening = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/jobs/${id}`),
    () => {
      const jobs = mockDb.get("job_openings");
      mockDb.set("job_openings", jobs.filter(j => j.id !== Number(id)));
      return { success: true };
    }
  );

/* ================= DEPARTMENT ================= */

export const getDepartments = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/departments`),
    () => mockDb.get("departments")
  );

export const getDepartmentHealthScores = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/departments/health-scores`),
    () => {
      const depts = mockDb.get("departments") || [];
      return depts.map(d => ({
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        healthScore: 88,
        status: "Good",
        statusColor: "🟡",
        attendanceScore: 92,
        performanceScore: 85,
        trainingScore: 90,
        leaveScore: 85,
        attritionRiskScore: 90,
        insight: `Performance score of ${d.departmentName} is stable.`
      }));
    }
  );

export const addDepartment = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/departments`, data),
    () => {
      const depts = mockDb.get("departments");
      const nextId = depts.length ? Math.max(...depts.map(d => d.departmentId)) + 1 : 1;
      const newDept = { ...data, departmentId: nextId };
      mockDb.set("departments", [...depts, newDept]);
      return newDept;
    }
  );

export const updateDepartment = (id, data) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/departments/${id}`, data),
    () => {
      const depts = mockDb.get("departments");
      const updated = depts.map(d => d.departmentId === Number(id) ? { ...d, ...data } : d);
      mockDb.set("departments", updated);
      return data;
    }
  );

export const deleteDepartment = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/departments/${id}`),
    () => {
      const depts = mockDb.get("departments");
      mockDb.set("departments", depts.filter(d => d.departmentId !== Number(id)));
      return { success: true };
    }
  );

/* ================= CANDIDATE / OTP ================= */

export const candidateLogin = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/recruitments/login`, data),
    () => {
      const recs = mockDb.get("recruitments");
      const rec = recs.find(r => r.email === data.email);
      if (!rec) throw new Error("Candidate login profile not found");
      return rec;
    }
  );

export const sendOtp = (email) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/otp/send`, { email }),
    () => {
      console.log(`[MOCK OTP] Sent to ${email}: 123456`);
      localStorage.setItem("mock_otp", JSON.stringify({ email, otp: "123456" }));
      return { success: true };
    }
  );

export const verifyOtp = (email, otp) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/otp/verify`, { email, password: otp }),
    () => {
      const saved = JSON.parse(localStorage.getItem("mock_otp"));
      if (saved && saved.email === email && (otp === "123456" || saved.otp === otp)) {
        const recs = mockDb.get("recruitments");
        let rec = recs.find(r => r.email === email);
        if (!rec) {
          rec = {
            id: recs.length ? Math.max(...recs.map(r => r.id)) + 1 : 1,
            candidateName: email.split("@")[0],
            email,
            position: "Software Developer",
            status: "APPLIED"
          };
          mockDb.set("recruitments", [...recs, rec]);
        }
        return rec;
      }
      throw new Error("Incorrect mock OTP validation");
    }
  );

export const getRecruitmentByEmail = (email) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/recruitments/email?email=${email}`),
    () => {
      const recs = mockDb.get("recruitments") || [];
      return recs.find(r => r.email === email) || null;
    }
  );

export const getNotifications = (role, userId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/notifications?role=${role}&userId=${userId}`),
    () => {
      const notifications = mockDb.get("notifications") || [];
      return notifications.filter(n => n.role === role || n.userId === userId);
    }
  );

export const getUnreadNotificationCount = (role, userId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/notifications/unread-count?role=${role}&userId=${userId}`),
    () => {
      const notifications = mockDb.get("notifications") || [];
      return notifications.filter(n => (n.role === role || n.userId === userId) && !n.isRead).length;
    }
  );

export const markAllNotificationsAsRead = (role, userId) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/notifications/read-all?role=${role}&userId=${userId}`),
    () => {
      const notifications = mockDb.get("notifications") || [];
      const updated = notifications.map(n => (n.role === role || n.userId === userId) ? { ...n, isRead: true } : n);
      mockDb.set("notifications", updated);
      return { success: true };
    }
  );

export const markNotificationAsRead = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/notifications/${id}/read`),
    () => {
      const notifications = mockDb.get("notifications") || [];
      const updated = notifications.map(n => n.id === Number(id) ? { ...n, isRead: true } : n);
      mockDb.set("notifications", updated);
      return { success: true };
    }
  );

export const deleteNotification = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/notifications/${id}`),
    () => {
      const notifications = mockDb.get("notifications") || [];
      const updated = notifications.filter(n => n.id !== Number(id));
      mockDb.set("notifications", updated);
      return { success: true };
    }
  );

export const getStatusHistory = (email) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/notifications/history?email=${email}`),
    () => {
      const history = mockDb.get("statusHistory") || [];
      return history.filter(h => h.email === email);
    }
  );

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return handleRequest(
    () => axios.post(`${BASE_URL}/file/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    () => {
      return { fileName: file.name, url: "#" };
    }
  );
};

/* ================= PERMISSIONS ================= */

export const applyPermission = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/permission`, data),
    () => {
      const perms = mockDb.get("permissions");
      const newPerm = { ...data, id: perms.length ? Math.max(...perms.map(p => p.id)) + 1 : 1, status: "PENDING" };
      mockDb.set("permissions", [...perms, newPerm]);
      return newPerm;
    }
  );

export const getPermissions = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/permission`),
    () => mockDb.get("permissions")
  );

export const getEmployeePermissions = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/permission/${id}`),
    () => {
      const perms = mockDb.get("permissions");
      return perms.filter(p => Number(p.employeeId) === Number(id));
    }
  );

export const approvePermission = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/permission/approve/${id}`),
    () => {
      const perms = mockDb.get("permissions");
      const updated = perms.map(p => p.id === Number(id) ? { ...p, status: "APPROVED" } : p);
      mockDb.set("permissions", updated);
      return { success: true };
    }
  );

export const rejectPermission = (id) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/permission/reject/${id}`),
    () => {
      const perms = mockDb.get("permissions");
      const updated = perms.map(p => p.id === Number(id) ? { ...p, status: "REJECTED" } : p);
      mockDb.set("permissions", updated);
      return { success: true };
    }
  );

export const deletePermission = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/permission/${id}`),
    () => {
      const perms = mockDb.get("permissions");
      mockDb.set("permissions", perms.filter(p => p.id !== Number(id)));
      return { success: true };
    }
  );

export const saveAttendanceInsight = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/ai-insights/attendance`, data),
    () => {
      const db = mockDb.get("ai_attendance") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("ai_attendance", [...db, newD]);
      return newD;
    }
  );

export const getAttendanceInsights = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/attendance`),
    () => mockDb.get("ai_attendance") || []
  );

export const saveCandidateInsight = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/ai-insights/candidate`, data),
    () => {
      const db = mockDb.get("ai_candidate") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("ai_candidate", [...db, newD]);
      return newD;
    }
  );

export const getCandidateInsights = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/candidate`),
    () => mockDb.get("ai_candidate") || []
  );

export const savePerformanceInsight = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/ai-insights/performance`, data),
    () => {
      const db = mockDb.get("ai_performance") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("ai_performance", [...db, newD]);
      return newD;
    }
  );

export const getPerformanceInsights = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/performance`),
    () => mockDb.get("ai_performance") || []
  );

export const getEmployeeAiIntelligence = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/employees/${id}/ai-insights`),
    () => {
      const emps = mockDb.get("employees") || [];
      const emp = emps.find(e => e.id === Number(id));
      return {
        employeeName: emp ? emp.name : "Employee",
        department: emp && emp.department ? emp.department.departmentName : "General",
        role: emp && emp.designation ? emp.designation : "Developer",
        attendanceScore: 85,
        performanceScore: 88,
        productivityAnalysis: "Consistent output, meets performance baselines. Maintains stable productivity.",
        skillStrengths: emp && emp.skills ? emp.skills.split(", ") : ["Java", "Spring Boot"],
        improvementAreas: ["Advanced architectural concepts"],
        recommendations: ["Provide advanced domain-specific training."]
      };
    }
  );

export const getEmployeePerformanceScore = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/employees/${id}/performance-score`),
    () => {
      const emps = mockDb.get("employees") || [];
      const emp = emps.find(e => e.id === Number(id));
      return {
        employeeId: emp ? emp.employeeId : "EMP1001",
        employeeName: emp ? emp.name : "Employee",
        performanceScore: 87,
        performanceLevel: "Excellent Performer",
        attendanceScore: 92,
        leaveScore: 85,
        punctualityScore: 90,
        taskCompletionScore: 88,
        reviewScore: 80
      };
    }
  );

export const getWellnessSentinel = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/wellness-sentinel`),
    () => {
      return [
        {
          employeeId: 1,
          employeeName: "Alice Johnson",
          department: "Engineering",
          burnoutIndex: 78,
          riskLevel: "HIGH",
          riskFactors: ["High Overtime (22 hrs)", "Attendance Drop (88.5%)"],
          recommendedIntervention: "Schedule a 1-on-1 Wellness sync immediately. Recommend a workload optimization or a 2-day paid wellness break to prevent attrition."
        }
      ];
    }
  );

export const saveDepartmentInsight = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/ai-insights/department`, data),
    () => {
      const db = mockDb.get("ai_department") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("ai_department", [...db, newD]);
      return newD;
    }
  );

export const getDepartmentInsights = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/department`),
    () => mockDb.get("ai_department") || []
  );

export const saveDashboardInsight = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/ai-insights/dashboard`, data),
    () => {
      const db = mockDb.get("ai_dashboard") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("ai_dashboard", [...db, newD]);
      return newD;
    }
  );

export const getDashboardInsights = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/ai-insights/dashboard`),
    () => mockDb.get("ai_dashboard") || []
  );

export const registerHr = (user) => axios.post(`${BASE_URL}/hr/register`, user);
export const loginHr = (email, password) => axios.post(`${BASE_URL}/hr/login`, { email, password });
export const loginHrOtp = (email) => axios.post(`${BASE_URL}/hr/login-otp?email=${email}`);
export const sendGenericOtp = (email) => axios.post(`${BASE_URL}/otp/send-generic?email=${email}`);
export const verifyGenericOtp = (email, otp) => axios.post(`${BASE_URL}/otp/verify-generic?email=${email}&otp=${otp}`);
export const checkHrEmail = (email) => axios.get(`${BASE_URL}/hr/check-email?email=${email}`);

export const applyEmployeeRequest = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/requests/apply`, data),
    () => {
      const db = mockDb.get("employee_requests") || [];
      const newD = { ...data, id: db.length + 1, createdAt: new Date().toISOString() };
      mockDb.set("employee_requests", [...db, newD]);
      return { data: newD };
    }
  );

export const getEmployeeRequests = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/requests/all`),
    () => mockDb.get("employee_requests") || []
  );

export const getMyRequests = (employeeId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/requests/my-requests?employeeId=${employeeId}`),
    () => (mockDb.get("employee_requests") || []).filter(r => String(r.employeeId) === String(employeeId))
  );

export const approveEmployeeRequest = (id, remarks) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/requests/approve/${id}`, { remarks }),
    () => {
      const db = mockDb.get("employee_requests") || [];
      const updated = db.map(r => r.id === Number(id) ? { ...r, status: "APPROVED", remarks } : r);
      mockDb.set("employee_requests", updated);
      return { data: { success: true } };
    }
  );

export const rejectEmployeeRequest = (id, remarks) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/requests/reject/${id}`, { remarks }),
    () => {
      const db = mockDb.get("employee_requests") || [];
      const updated = db.map(r => r.id === Number(id) ? { ...r, status: "REJECTED", remarks } : r);
      mockDb.set("employee_requests", updated);
      return { data: { success: true } };
    }
  );

export const updateEmployeeRequest = (id, data) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/requests/update/${id}`, data),
    () => {
      const db = mockDb.get("employee_requests") || [];
      const updated = db.map(r => r.id === Number(id) ? { ...r, ...data } : r);
      mockDb.set("employee_requests", updated);
      return { data: data };
    }
  );

export const deleteEmployeeRequest = (id) =>
  handleRequest(
    () => axios.delete(`${BASE_URL}/requests/delete/${id}`),
    () => {
      const db = mockDb.get("employee_requests") || [];
      const updated = db.filter(r => r.id !== Number(id));
      mockDb.set("employee_requests", updated);
      return { data: { success: true } };
    }
  );

export const getMyLeaves = (employeeId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/leave/my-leaves?employeeId=${employeeId}`),
    () => (mockDb.get("leaves") || []).filter(l => String(l.employeeId) === String(employeeId))
  );

export const getLeaveAiAnalysis = (id) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/leave/${id}/ai-analysis`),
    () => ({
      recommendation: "Recommend Approval",
      confidenceScore: 90,
      aiReason: "Employee has sufficient leave balance and good attendance."
    })
  );

export const suggestInterviewSlot = (candidateId, skipCount = 0) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/interviews/suggest-slot?candidateId=${candidateId}&skipCount=${skipCount}`),
    () => {
      const date = new Date();
      date.setDate(date.getDate() + 3 + skipCount);
      if (date.getDay() === 0) date.setDate(date.getDate() + 1);
      if (date.getDay() === 6) date.setDate(date.getDate() + 2);
      
      const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });
      const suggestedDate = dateFormatter.format(date);
      
      return {
        candidateId,
        hrId: 1,
        interviewDate: suggestedDate,
        interviewTime: "11:00 AM",
        duration: "30 Minutes",
        interviewType: "Online",
        confidence: "95%",
        reason: "Best available slot with no scheduling conflicts."
      };
    }
  );

export const scheduleInterview = (data) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/interviews/schedule`, data),
    () => {
      const schedules = mockDb.get("interview_schedules") || [];
      const newSchedule = {
        id: schedules.length + 1,
        candidateId: data.candidateId,
        hrId: data.hrId,
        interviewDate: data.interviewDate,
        interviewTime: data.interviewTime,
        interviewType: data.interviewType,
        status: "UPCOMING",
        aiGenerated: true,
        createdAt: new Date().toISOString()
      };
      mockDb.set("interview_schedules", [...schedules, newSchedule]);
      
      const recs = mockDb.get("recruitments") || [];
      const updated = recs.map(r => r.id === Number(data.candidateId) ? { ...r, status: "Interview Scheduled", interviewDetails: `${data.interviewDate} at ${data.interviewTime}` } : r);
      mockDb.set("recruitments", updated);
      
      return newSchedule;
    }
  );

export const getHrInterviews = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/interviews/hr`),
    () => mockDb.get("interview_schedules") || []
  );

export const getCandidateInterviews = (candidateId) =>
  handleRequest(
    () => axios.get(`${BASE_URL}/interviews/candidate?candidateId=${candidateId}`),
    () => {
      const schedules = mockDb.get("interview_schedules") || [];
      return schedules.filter(s => s.candidateId === Number(candidateId));
    }
  );

export const updateHrProfile = (data) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/hr/profile`, data),
    () => {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      const updated = { ...user, ...data };
      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    }
  );

export const getIncrementRecommendations = () =>
  handleRequest(
    () => axios.get(`${BASE_URL}/payroll/ai-revision`),
    () => []
  );

export const modifyIncrementPercentage = (id, percentage, remarks) =>
  handleRequest(
    () => axios.put(`${BASE_URL}/payroll/increment-recommendations/${id}/modify`, { percentage, remarks }),
    () => null
  );

export const approveIncrement = (id) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/payroll/increment-recommendations/${id}/approve`),
    () => null
  );

export const rejectIncrement = (id) =>
  handleRequest(
    () => axios.post(`${BASE_URL}/payroll/increment-recommendations/${id}/reject`),
    () => null
  );