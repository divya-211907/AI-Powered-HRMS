import axios from "axios";
import { BASE_URL } from "./ApiService";

/**
 * Builds the comprehensive text context of the organization for the Gemini prompt (Admin/HR fallback)
 */
export const compileContext = (contextData, currentUser) => {
  const {
    employees = [],
    leaves = [],
    payrolls = [],
    departments = [],
    attendance = [],
    recruitments = [],
    performances = [],
  } = contextData;

  const currentUserName = currentUser?.username || "User";
  const currentUserRole = currentUser?.role || localStorage.getItem("role") || "Guest";

  return `
You are "HRMS Assistant", a premium, intelligent HR Assistant and Analytics Assistant integrated into this 🏢 NextGen HRMS Account.
You have access to the current real-time organization database:

CURRENT CONTEXT:
- Current User: ${currentUserName} (${currentUserRole})
- Departments: ${JSON.stringify(departments.map(d => ({ name: d.departmentName, manager: d.manager, employees: d.employeeCount })))}
- Employees: ${JSON.stringify(employees.map(e => ({ id: e.id, name: e.name, email: e.email, dept: e.department?.departmentName, salary: e.salary })))}
- Leaves: ${JSON.stringify(leaves.map(l => ({ id: l.id, name: l.employeeName, reason: l.reason, from: l.fromDate, to: l.toDate, status: l.status })))}
- Payrolls: ${JSON.stringify(payrolls.map(p => ({ employee: p.employeeName, month: p.month, basic: p.basicSalary, allowances: p.allowances, deductions: p.deductions, net: p.netSalary, status: p.status })))}
- Recruitments (Candidates): ${JSON.stringify(recruitments.map(r => ({ name: r.candidateName, email: r.email, position: r.position, status: r.status })))}
- Attendance (Today's Logs): ${JSON.stringify(attendance.map(a => ({ name: a.employeeName, date: a.date, checkIn: a.checkInTime, checkOut: a.checkOutTime, status: a.status })))}
- Performance Ratings: ${JSON.stringify(performances.map(p => ({ name: p.employeeName, rating: p.rating, review: p.review, evaluator: p.evaluatedBy })))}
- Inventory: {"Laptops": {"count": 2, "limit": 5}, "Keyboards": {"count": 8, "limit": 10}, "Monitors": {"count": 12, "limit": 8}}

INSTRUCTIONS:
1. Answer the user's question, provide suggestions, analyze data, or generate summaries based on the current context above.
2. Be professional, direct, encouraging, and format your response in clean markdown. Keep answers relatively concise and highly readable.
`;
};

/**
 * Builds isolated Employee context for Gemini prompt
 */
export const compileEmployeeContext = (contextData, currentUser) => {
  const {
    employees = [],
    leaves = [],
    payrolls = [],
    attendance = [],
  } = contextData;

  const currentEmp = employees.find(e => e.email?.toLowerCase() === currentUser?.email?.toLowerCase() || e.username?.toLowerCase() === currentUser?.username?.toLowerCase());
  if (!currentEmp) {
    return `You are "Employee Assistant". Current user has no active employee profile in the database. Instruct them to contact HR.`;
  }

  // Security isolation: only their own records are compiled
  const myAttendance = attendance.filter(a => String(a.employeeId) === String(currentEmp.id));
  const myLeaves = leaves.filter(l => l.employeeName?.toLowerCase() === currentEmp.name?.toLowerCase());
  const myPayrolls = payrolls.filter(p => p.employeeName?.toLowerCase() === currentEmp.name?.toLowerCase());

  return `
You are the "Employee AI Assistant", a personal HR companion for employees.
You have access to the employee's personal profile and logs.

EMPLOYEE PROFILE:
- Name: ${currentEmp.name}
- Email: ${currentEmp.email}
- Department: ${currentEmp.department?.departmentName || "General Operations"}
- Salary: ₹${currentEmp.salary || 0}

MY ATTENDANCE LOGS:
${JSON.stringify(myAttendance.map(a => ({ date: a.date, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status })))}

MY LEAVE REQUESTS:
${JSON.stringify(myLeaves.map(l => ({ reason: l.reason, from: l.fromDate, to: l.toDate, status: l.status })))}

MY PAYSLIP & PAYROLL CHECUSHIONS:
${JSON.stringify(myPayrolls.map(p => ({ month: p.month, basic: p.basicSalary, bonus: p.bonus, deductions: p.deductions, net: p.netSalary })))}

COMPANY RULES & LEAVE POLICIES:
- Leave requests must be applied at least 3 days in advance.
- Standard casual leaves: 12 days per year. Medical leaves: 10 days per year.
- Late check-in past 09:15 AM counts as late arrival. 3 late arrivals result in 1 day leave deduction.

INSTRUCTIONS:
1. You can only answer questions related to this employee's own records.
2. If they ask about other employees or general company financials, politely decline.
3. Keep answers highly professional, conversational, and formatted in clean markdown.
`;
};

/**
 * Builds isolated Candidate context for Gemini prompt
 */
export const compileCandidateContext = (contextData, currentUser) => {
  const { recruitments = [] } = contextData;
  const myRecRecord = recruitments.find(r => r.email?.toLowerCase() === currentUser?.email?.toLowerCase());

  if (!myRecRecord) {
    return `You are "Candidate Assistant". No job application found matching the candidate's email: ${currentUser?.email}.`;
  }

  return `
You are the "Recruitment AI Assistant", a guide for candidates applying to the organization.
You have access to the candidate's application details.

CANDIDATE APPLICATION DETAILS:
- Name: ${myRecRecord.candidateName}
- Position: ${myRecRecord.position}
- Experience: ${myRecRecord.experience}
- Skills: ${myRecRecord.skills}
- AI Fit Match Score: ${myRecRecord.aiScore || 0}%
- Application Status: ${myRecRecord.status || "Under Review"}
- Interview Details: ${myRecRecord.interviewDetails || "None scheduled yet"}
- HR Feedback Remarks: ${myRecRecord.remarks || "No feedback logged yet"}

RECRUITMENT FAQ & STAGES:
1. Application Review: Initial screening.
2. Under Review: Detailed assessment.
3. Interview Scheduled: Technical or HR interview.
4. Selected: Offer letter release.

SKILL GAP GUIDANCE & PREPARATION:
- For Java roles: Improve Spring Boot, Microservices, and database tuning. Recommended: Oracle Java Certified Professional.
- For React roles: Improve TypeScript, Redux Toolkit, and performance optimizations. Recommended: Frontend Developer Certificate.
- Interview Tips: Structure coding answers using the STAR method. Review standard design patterns.

INSTRUCTIONS:
1. Answer the candidate's questions about their application, matching score, resume details, or interview preparation.
2. Provide tailored interview questions matching their applied position and skills list.
3. Suggest certifications and learning paths to improve their missing skills.
4. Be encouraging, helpful, and concise. Format responses in clean markdown.
`;
};

/**
 * Rules-based Local Summarizer for Demo Mode (Offline / No API Key)
 */
export const runLocalDemoMode = (query, contextData) => {
  const q = query.toLowerCase();
  const {
    employees = [],
    leaves = [],
    payrolls = [],
    departments = [],
    recruitments = [],
    performances = [],
  } = contextData;

  const totalEmployees = employees.length;
  const totalSalaries = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);
  const pendingLeaves = leaves.filter(l => l.status === "PENDING");
  const avgPerformance = performances.length
    ? (performances.reduce((sum, p) => sum + Number(p.rating || 0), 0) / performances.length).toFixed(2)
    : "N/A";

  let responseText = "";

  if (q.includes("payroll") || q.includes("salary") || q.includes("budget") || q.includes("forecast")) {
    const nextMonthForecast = (totalSalaries * 1.05).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    responseText = `### 💰 Payroll & Budget Analysis (Demo Mode)
- **Total Monthly Payroll Commitment**: ₹${totalSalaries.toLocaleString("en-IN")}
- **Active Payroll Records**: ${payrolls.length}
- **Q3 Budget Forecast**: next month's payroll is projected to be around **${nextMonthForecast}**.`;
  }
  else if (q.includes("performance") || q.includes("rating") || q.includes("top") || q.includes("best") || q.includes("review")) {
    const sortedPerformances = [...performances].sort((a, b) => Number(b.rating) - Number(a.rating));
    const stars = sortedPerformances.map(p => `* **${p.employeeName}** - Rating: **${p.rating}/5** (${p.review})`).join("\n");
    responseText = `### ⭐ Performance & Talent Insights (Demo Mode)
- **Average Performance Rating**: **${avgPerformance}/5**
**Top Performers:**
${stars || "*No performance reviews have been registered yet.*"}`;
  }
  else {
    responseText = `### 👋 Hello! I am your AI HR Copilot
- **Employees**: ${totalEmployees}
- **Departments**: ${departments.length}
- **Pending Leaves**: ${pendingLeaves.length}
- **Candidates**: ${recruitments.length}`;
  }

  return responseText;
};

/**
 * Rules-based Local Summarizer for Employee Portal
 */
export const runLocalEmployeeDemo = (query, contextData, currentUser) => {
  const q = query.toLowerCase();
  const { employees = [], attendance = [], leaves = [], payrolls = [] } = contextData;
  const currentEmp = employees.find(e => e.email?.toLowerCase() === currentUser?.email?.toLowerCase() || e.username?.toLowerCase() === currentUser?.username?.toLowerCase());
  
  if (!currentEmp) {
    return "I couldn't find an active employee profile associated with your login credentials. Please contact HR to set up your profile.";
  }

  const myAttendance = attendance.filter(a => String(a.employeeId) === String(currentEmp.id));
  const myLeaves = leaves.filter(l => l.employeeName?.toLowerCase() === currentEmp.name?.toLowerCase());
  const myPayrolls = payrolls.filter(p => p.employeeName?.toLowerCase() === currentEmp.name?.toLowerCase());

  if (q.includes("attendance") || q.includes("present") || q.includes("late") || q.includes("absent")) {
    const lateCount = myAttendance.filter(a => a.status?.toLowerCase()?.includes("late")).length;
    const presentCount = myAttendance.filter(a => a.status?.toLowerCase() === "present").length;
    return `### ⏰ Your Attendance Summary
- **Today's Status**: Present
- **Monthly Attendance Rate**: ${myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 100}%
- **Late Arrivals Flagged**: ${lateCount} check-ins
- **Total Logs Recorded**: ${myAttendance.length} records`;
  }

  if (q.includes("leave") || q.includes("off") || q.includes("vacation") || q.includes("holiday")) {
    const approvedCount = myLeaves.filter(l => l.status === "APPROVED").length;
    const pendingCount = myLeaves.filter(l => l.status === "PENDING").length;
    return `### 🌴 Your Leave Balance & Status
- **Casual Leave Balance**: ${12 - approvedCount} days remaining (out of 12)
- **Medical Leave Balance**: 10 days remaining
- **Leave History**: ${myLeaves.length} requests registered (${approvedCount} Approved, ${pendingCount} Pending)
- **HR Policy**: Standard leaves must be submitted 3 days in advance. Late check-ins past 9:15 AM may result in deductions.`;
  }

  if (q.includes("payroll") || q.includes("salary") || q.includes("payslip") || q.includes("deduction") || q.includes("pay")) {
    const activePay = myPayrolls[0] || { basicSalary: currentEmp.salary, bonus: 0, deductions: 0, netSalary: currentEmp.salary };
    return `### 💰 Your Salary Details & Payslip
- **Current Basic Salary**: ₹${Number(activePay.basicSalary || currentEmp.salary).toLocaleString("en-IN")}
- **Bonus Allocations**: ₹${Number(activePay.bonus || 0).toLocaleString("en-IN")}
- **Deductions Applied**: ₹${Number(activePay.deductions || 0).toLocaleString("en-IN")}
- **Net Payout (Net Salary)**: ₹${Number(activePay.netSalary || currentEmp.salary).toLocaleString("en-IN")}
- **Deductions Audit**: Standard deductions include income tax withholding and provident fund contributions.`;
  }

  if (q.includes("profile") || q.includes("department") || q.includes("designation") || q.includes("my info") || q.includes("who am i")) {
    return `### 👨‍💼 Your Profile Information
- **Employee Name**: ${currentEmp.name}
- **Email Address**: ${currentEmp.email}
- **Assigned Department**: ${currentEmp.department?.departmentName || "General Operations"}
- **Salary Tier**: ₹${currentEmp.salary || 0} / month`;
  }

  return `### 👋 Hello ${currentEmp.name}! I am your Employee AI Assistant
I can answer queries regarding your specific attendance records, leave balances, salary details, and HR policies.
Try asking:
* *"Am I marked present today?"*
* *"How many casual leaves do I have left?"*
* *"Show my payroll net salary details"*`;
};

/**
 * Rules-based Local Summarizer for Candidate Portal
 */
export const runLocalCandidateDemo = (query, contextData, currentUser) => {
  const q = query.toLowerCase();
  const { recruitments = [] } = contextData;
  const myRec = recruitments.find(r => r.email?.toLowerCase() === currentUser?.email?.toLowerCase());

  if (!myRec) {
    return "I couldn't locate any active job application matching your email address. Please make sure you submit your details on the Application Form first.";
  }

  if (q.includes("status") || q.includes("stage") || q.includes("interview") || q.includes("progress")) {
    return `### 🎯 Your Application Status
- **Position Applied**: ${myRec.position}
- **Current Status**: **${myRec.status || "Under Review"}**
- **Interview details**: ${myRec.interviewDetails || "None scheduled yet. HR will contact you if shortlisted."}
- **HR remarks**: ${myRec.remarks || "Your application is currently being evaluated."}`;
  }

  if (q.includes("resume") || q.includes("skill") || q.includes("improve") || q.includes("learn") || q.includes("certify")) {
    const position = myRec.position || "Developer";
    let missing = "Docker, Kubernetes, AWS Certified Solutions Architect";
    if (position.toLowerCase().includes("react") || position.toLowerCase().includes("front")) {
      missing = "TypeScript, Redux Toolkit, React Performance Optimization certifications";
    } else if (position.toLowerCase().includes("hr")) {
      missing = "Strategic Talent Acquisition, Conflict Management, SHRM certifications";
    }
    return `### 🧠 AI Resume & Skill Recommendations
- **Skills Extracted**: ${myRec.skills}
- **Education Extracted**: ${myRec.qualification}
- **AI Match Score**: **${myRec.aiScore || 0}%**
- **Missing Skills for ${position}**: ${missing}
- **Learning Path**: We recommend completing courses in the missing skills and working on practice projects.`;
  }

  if (q.includes("interview") || q.includes("prep") || q.includes("question") || q.includes("tip")) {
    const position = myRec.position || "Developer";
    const q1 = position.toLowerCase().includes("react") ? "Explain the difference between React state and props." : "What is the difference between Method Overloading and Method Overriding?";
    const q2 = position.toLowerCase().includes("react") ? "How does React virtual DOM work?" : "Explain Spring Dependency Injection (DI) and IoC Container.";
    return `### 💬 Interview Preparation Toolkit
Here are tailored preparation topics for **${position}**:
1. **Technical Question 1**: "${q1}"
2. **Technical Question 2**: "${q2}"
3. **Core Topic**: Be prepared to explain your experience level (${myRec.experience}) and resume details.
4. **General Tip**: Use the STAR method to describe your past achievements.`;
  }

  return `### 👋 Hello ${myRec.candidateName}! I am your Recruitment AI Assistant
I can track your application status, analyze your resume details, suggest skill certifications, and help you prepare for interviews.
Try asking:
* *"What is my application status?"*
* *"What skills should I improve for this role?"*
* *"Help me prepare for my interview"*`;
};

/**
 * Main Service to call the AI assistant
 */
export const askAiAssistant = async (query, contextData, currentUser) => {
  const email = currentUser?.email || currentUser?.username;
  const role = currentUser?.role || localStorage.getItem("role") || "Guest";
  const apiKey = localStorage.getItem("gemini_api_key") || "";

  try {
    const response = await axios.post(
      `${BASE_URL}/ai/chat`,
      { message: query },
      {
        headers: {
          "X-User-Email": email,
          "X-User-Role": role,
          "X-Gemini-API-Key": apiKey
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error("AI Chat Error:", err);
    return "I encountered an error communicating with the AI backend. Please verify that the backend application is running.";
  }
};
