import { useEffect, useState } from "react";
import {
  getRecruitments,
  updateRecruitment,
  saveCandidateInsight,
  getJobOpenings,
  createJobOpening,
  deleteJobOpening,
  getFraudReport,
  getResumeExtraction,
  suggestInterviewSlot,
  scheduleInterview,
  deleteRecruitment,
  BASE_URL
} from "../services/ApiService";

function Recruitment() {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = localStorage.getItem("theme") || "dark";
  
  // Tab navigator
  const [activeTab, setActiveTab] = useState("candidates");
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({ title: "", department: "Engineering", description: "" });
  const [jobLoading, setJobLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [newStatus, setNewStatus] = useState("Under Review");
  const [remarks, setRemarks] = useState("");
  const [interviewDetails, setInterviewDetails] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLink, setInterviewLink] = useState("");

  // AI Scheduler states
  const [aiSlot, setAiSlot] = useState(null);
  const [slotSkipCount, setSlotSkipCount] = useState(0);
  const [slotLoading, setSlotLoading] = useState(false);

  // AI Fraud states
  const [modalTab, setModalTab] = useState("skills"); // skills | fraud
  const [fraudReport, setFraudReport] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (showModal && selectedCandidate && (newStatus === "Shortlisted" || (newStatus === "Interview Scheduled" && (!interviewDate || !interviewTime)))) {
      fetchAiSlot(selectedCandidate.id, 0);
    } else {
      if (newStatus !== "Shortlisted" && newStatus !== "Interview Scheduled") {
        setAiSlot(null);
        setSlotSkipCount(0);
      }
    }
  }, [newStatus, showModal, selectedCandidate]);

  const fetchAiSlot = async (candidateId, skip) => {
    setSlotLoading(true);
    try {
      const res = await suggestInterviewSlot(candidateId, skip);
      if (res.data) {
        setAiSlot(res.data);
        setSlotSkipCount(skip);
        setInterviewDate(res.data.interviewDate || "");
        setInterviewTime(res.data.interviewTime || "");
        setInterviewLink("Automatically Generated on Save");
      }
    } catch (err) {
      console.error("Error fetching AI slot:", err);
    } finally {
      setSlotLoading(false);
    }
  };

  const handleApproveSchedule = async () => {
    if (!aiSlot || !selectedCandidate) return;
    setLoading(true);
    try {
      await scheduleInterview({
        candidateId: selectedCandidate.id,
        hrId: aiSlot.hrId || 1,
        interviewDate: aiSlot.interviewDate,
        interviewTime: aiSlot.interviewTime,
        interviewType: aiSlot.interviewType
      });
      alert(`✅ Interview Scheduled successfully!\nDate: ${aiSlot.interviewDate}\nTime: ${aiSlot.interviewTime}`);
      setShowModal(false);
      loadRecruitments();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSlot = () => {
    if (!selectedCandidate) return;
    fetchAiSlot(selectedCandidate.id, slotSkipCount + 1);
  };

  useEffect(() => {
    loadRecruitments();
    loadJobs();
  }, []);

  const loadRecruitments = async () => {
    try {
      const res = await getRecruitments();
      setRecruitments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await getJobOpenings();
      setJobs(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description) {
      alert("Please fill all required fields");
      return;
    }
    setJobLoading(true);
    try {
      await createJobOpening(jobForm);
      alert("Job opening created successfully!");
      setJobForm({ title: "", department: "Engineering", description: "" });
      loadJobs();
    } catch (err) {
      console.log(err);
      alert("Failed to create job opening");
    } finally {
      setJobLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Delete this job opening?")) return;
    try {
      await deleteJobOpening(id);
      alert("Job opening deleted successfully!");
      loadJobs();
    } catch (err) {
      console.log(err);
      alert("Failed to delete job opening");
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate application?")) return;
    try {
      await deleteRecruitment(id);
      alert("Candidate application deleted successfully!");
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await getRecruitments(user?.email);
      setRecruitments(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to delete candidate application");
    }
  };

  const handleOpenReview = (candidate, defaultStatus) => {
    setSelectedCandidate(candidate);
    setNewStatus(defaultStatus || candidate.status || "Applied");
    setRemarks(candidate.remarks || "");
    setInterviewDetails(candidate.interviewDetails || "");

    // Parse existing interview details if possible
    let dateVal = "";
    let timeVal = "";
    let linkVal = "";
    if (candidate.interviewDetails) {
      const lines = candidate.interviewDetails.split("\n");
      lines.forEach(line => {
        if (line.toLowerCase().startsWith("date:")) {
          dateVal = line.substring(5).trim();
        } else if (line.toLowerCase().startsWith("time:")) {
          timeVal = line.substring(5).trim();
        } else if (line.toLowerCase().startsWith("meeting link:")) {
          linkVal = line.substring(13).trim();
        }
      });
    }
    setInterviewDate(dateVal);
    setInterviewTime(timeVal);
    setInterviewLink(linkVal || "Automatically Generated on Save");

    setShowModal(true);
  };

  const handleOpenAiScorecard = async (candidate) => {
    setSelectedCandidate(candidate);
    setModalTab("skills");
    setFraudReport(null);
    setResumeData(null);
    setShowAiModal(true);

    try {
      const res = await getFraudReport(candidate.id);
      if (res.data) {
        setFraudReport(res.data);
      }
    } catch (err) {
      console.error("Failed to load fraud report", err);
    }

    try {
      const res = await getResumeExtraction(candidate.id);
      if (res.data) {
        setResumeData(res.data);
      }
    } catch (err) {
      console.error("Failed to load resume extraction", err);
    }

    const evalResult = getCandidateEvaluation(candidate);
    if (evalResult) {
      saveCandidateInsight({
        candidateName: candidate.candidateName,
        email: candidate.email,
        position: candidate.position,
        aiScore: evalResult.score,
        skillsMatched: candidate.skills,
        interviewQuestions: evalResult.questions?.join(" | ") || "",
        recommendations: evalResult.recommendation
      }).catch(err => console.error("Error saving Candidate AI Insight:", err));
    }
  };

  const handleQuickStatus = async (candidate, status) => {
    try {
      await updateRecruitment(candidate.id, {
        ...candidate,
        status: status,
        remarks: `Updated status to ${status} via Quick Action`
      });
      alert(`Candidate status updated to ${status} successfully!`);
      loadRecruitments();
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.message || err.response?.data || "Failed to update status.";
      alert(`❌ ${backendError}`);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedCandidate) return;
    let finalDetails = interviewDetails;
    if (newStatus === "Interview Scheduled") {
      const trimmedLink = (interviewLink || "").trim();
      const meetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/;
      const jitsiRegex = /^https:\/\/meet\.jit\.si\/.*$/;
      const isAutoGenerated = trimmedLink.toLowerCase() === "automatically generated on save";
      
      if (!isAutoGenerated && !meetRegex.test(trimmedLink) && !jitsiRegex.test(trimmedLink)) {
        alert("❌ Invalid Google Meet URL.\n\nPlease enter a valid Google Meet link.\nExample: https://meet.google.com/xxx-yyyy-zzz");
        return;
      }
      finalDetails = `Date: ${interviewDate}\nTime: ${interviewTime}\nMeeting Link: ${trimmedLink}`;
    }
    try {
      await updateRecruitment(selectedCandidate.id, {
        ...selectedCandidate,
        status: newStatus,
        remarks: remarks,
        interviewDetails: finalDetails
      });
      alert("Application status updated successfully!");
      setShowModal(false);
      loadRecruitments();
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.message || err.response?.data || "Failed to update status.";
      alert(`❌ ${backendError}`);
    }
  };

  const getStatusStyle = (status) => {
    const normal = status ? status.toUpperCase() : "UNDER REVIEW";
    if (normal === "SELECTED" || normal === "OFFERED") {
      return { background: "#d1fae5", color: "#065f46" };
    }
    if (normal === "REJECTED" || normal === "NOT SELECTED") {
      return { background: "#fee2e2", color: "#991b1b" };
    }
    if (normal === "INTERVIEW SCHEDULED") {
      return { background: "#dbeafe", color: "#1e40af" };
    }
    return { background: "#ffedd5", color: "#9a3412" };
  };

  const getRecommendation = (score) => {
    if (score >= 80) return "🔥 Shortlisted";
    if (score >= 50) return "🟡 Review";
    return "❌ Rejected";
  };

  // ================= AI RECRUITMENT ASSISTANT ENGINE =================
  const getCandidateEvaluation = (candidate) => {
    if (!candidate) return null;
    
    const score = candidate.aiScore || 70;
    const skillsList = candidate.skills?.split(",").map(s => s.trim()) || [];
    const position = candidate.position || "Software Developer";

    // Position requirement check
    let requiredSkills = ["Java", "SQL", "Git"];
    if (position.toLowerCase().includes("react") || position.toLowerCase().includes("front")) {
      requiredSkills = ["React", "JavaScript", "CSS", "Git"];
    } else if (position.toLowerCase().includes("hr") || position.toLowerCase().includes("recruitment")) {
      requiredSkills = ["Recruiting", "Communication", "HR Policies"];
    }

    const education = candidate.qualification || "Bachelor of Technology";
    const certifications = position.toLowerCase().includes("java")
      ? "Oracle Certified Java Associate"
      : position.toLowerCase().includes("hr")
      ? "SHRM Certified Professional (SHRM-CP)"
      : "Certified Front-End Specialist";

    // Tailored questions
    const questions = [];
    if (skillsList.some(s => s.toLowerCase().includes("react"))) {
      questions.push("Explain the difference between React state and props, and how useEffect handles cleanups.");
    }
    if (skillsList.some(s => s.toLowerCase().includes("java"))) {
      questions.push("How does Spring Boot auto-configuration work internally? Explain @SpringBootApplication.");
    }
    if (skillsList.some(s => s.toLowerCase().includes("sql") || s.toLowerCase().includes("database"))) {
      questions.push("What is database normalization? Explain the differences between INNER and LEFT JOINs.");
    }
    if (questions.length < 3) {
      questions.push(`Can you explain your experience working as a ${position} and details of your key projects?`);
      questions.push(`What core development methodologies (like Agile/Scrum) did you follow in your last role?`);
      questions.push(`What certifications or training pathways do you plan to complete next?`);
    }

    let recommendation = "Interview";
    let recColor = "#d97706";
    if (score >= 80) {
      recommendation = "Strong Hire";
      recColor = "#16a34a";
    } else if (score < 50) {
      recommendation = "Reject";
      recColor = "#dc2626";
    }

    return {
      score,
      education,
      certifications,
      requiredSkills,
      questions,
      recommendation,
      recColor
    };
  };

  return (
    <div
      style={{
        padding: "25px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "var(--text-primary)", marginBottom: "25px" }}>
          🎯 Recruitment Management
        </h1>

        {/* Tab Navigator */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px", borderBottom: "2px solid #cbd5e1", paddingBottom: "12px" }}>
          <button
            onClick={() => setActiveTab("candidates")}
            style={{
              padding: "10px 20px",
              background: activeTab === "candidates" ? "var(--accent-primary)" : "transparent",
              color: activeTab === "candidates" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            👥 Candidate Applications
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            style={{
              padding: "10px 20px",
              background: activeTab === "jobs" ? "var(--accent-primary)" : "transparent",
              color: activeTab === "jobs" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            💼 Manage Job Openings
          </button>
        </div>

        {activeTab === "candidates" ? (
          <>
            {/* AI Recruitment Leaderboard Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px", marginBottom: "25px" }} className="recruitment-grid-main">
              
              {/* Top Leaderboard Card */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🏆 AI Candidate Leaderboard
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recruitments
                    .slice()
                    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                    .slice(0, 3)
                    .map((cand, idx) => (
                      <div key={cand.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 15px", background: idx === 0 ? "rgba(37,99,235,0.04)" : "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "800", color: idx === 0 ? "#d97706" : "#64748b" }}>#{idx + 1}</span>
                          <div>
                            <strong style={{ fontSize: "13.5px", color: "#1e293b" }}>{cand.candidateName}</strong>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{cand.position} | {cand.experience}</p>
                          </div>
                        </div>
                        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                          {cand.aiScore || 0}% Match
                        </span>
                      </div>
                    ))}
                  {recruitments.length === 0 && (
                    <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", padding: "10px 0" }}>No candidates found to rank.</p>
                  )}
                </div>
              </div>

              {/* AI Stats Overview */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", marginBottom: "15px" }}>🎯 Recruitment Funnel Stats</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }} className="responsive-two-col">
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Total Applicants</span>
                    <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "4px 0 0" }}>{recruitments.length}</h4>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Avg Match Score</span>
                    <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "4px 0 0" }}>
                      {recruitments.length > 0 
                        ? Math.round(recruitments.reduce((sum, r) => sum + (r.aiScore || 0), 0) / recruitments.length) 
                        : 0}%
                    </h4>
                  </div>
                </div>
                <p style={{ fontSize: "11.5px", color: "#64748b", marginTop: "15px", lineHeight: "1.4", margin: 0 }}>
                  💡 <strong>AI Recommendations:</strong> Invite candidates with match scores above 80% to schedule technical interviews immediately.
                </p>
              </div>

            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Qualification</th>
                    <th>Skills</th>
                    <th>AI Score</th>
                    <th>Recommendation</th>
                    <th>Experience</th>
                    <th>Position</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {recruitments.length > 0 ? (
                    recruitments.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>
                          <div>
                            <div>{r.candidateName}</div>
                            {r.duplicateCandidateId && (
                              <div style={{
                                fontSize: "10px",
                                background: "#fee2e2",
                                color: "#991b1b",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                marginTop: "3px",
                                fontWeight: "700",
                                display: "inline-block"
                              }}>
                                ⚠️ Potential Duplicate ({r.duplicateSimilarity}%)
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{r.email}</td>
                        <td>{r.mobile}</td>
                        <td>{r.qualification}</td>
                        <td>{r.skills}</td>
                        <td>
                          <strong>{r.aiScore || 0}%</strong>
                        </td>
                        <td>
                          <span className={`badge-custom ${(r.aiScore || 0) >= 80 ? "badge-success" : (r.aiScore || 0) >= 50 ? "badge-warning" : "badge-danger"}`}>
                            {getRecommendation(r.aiScore || 0)}
                          </span>
                        </td>
                        <td>{r.experience}</td>
                        <td>{r.position}</td>
                        <td>
                          {r.resumePath ? (
                            <a
                              href={`${BASE_URL.replace("/api", "")}${r.resumePath}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                textDecoration: "none",
                                color: "var(--accent-primary)",
                                fontWeight: "700",
                              }}
                            >
                              📄 View
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-secondary)" }}>No Resume</span>
                          )}
                        </td>
                        <td>
                          <span 
                            className="badge-custom" 
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "700",
                              display: "inline-block",
                              ...getStatusStyle(r.status)
                            }}
                          >
                            {r.status || "Under Review"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              className="edit-btn"
                              onClick={() => handleOpenAiScorecard(r)}
                              style={{ padding: "4px 8px", fontSize: "11px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "white" }}
                            >
                              👁️ View Details
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleQuickStatus(r, "Shortlisted")}
                              style={{ padding: "4px 8px", fontSize: "11px", background: "#e0f2fe", color: "#0369a1" }}
                              disabled={r.status === "Shortlisted"}
                            >
                              Shortlist
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleOpenReview(r, "Interview Scheduled")}
                              style={{ padding: "4px 8px", fontSize: "11px", background: "#fef3c7", color: "#b45309" }}
                              disabled={r.status === "Interview Scheduled"}
                            >
                              Schedule Interview
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleQuickStatus(r, "Selected")}
                              style={{ padding: "4px 8px", fontSize: "11px", background: "#d1fae5", color: "#065f46" }}
                              disabled={r.status === "Selected"}
                            >
                              Hire
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleQuickStatus(r, "Rejected")}
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              disabled={r.status === "Rejected"}
                            >
                              Reject
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteCandidate(r.id)}
                              style={{ padding: "4px 8px", fontSize: "11px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "30px" }}>
                        No Applications Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "25px" }} className="recruitment-grid-split">
            {/* Job Opening Creation Form */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", height: "fit-content" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", marginBottom: "15px" }}>🆕 Post New Job Opening</h3>
              <form onSubmit={handleCreateJob} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569" }}>Job Title *</label>
                  <input
                    placeholder="e.g. Senior Java Developer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569" }}>Department *</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13.5px", background: "#fff" }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#475569" }}>Job Description *</label>
                  <textarea
                    placeholder="Enter job roles, responsibilities, requirements..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={jobLoading}
                  style={{ padding: "10px 18px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "white", fontSize: "13px", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "10px" }}
                >
                  {jobLoading ? "Posting Job..." : "🚀 Post Job"}
                </button>
              </form>
            </div>

            {/* Active Jobs Table */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", marginBottom: "15px" }}>💼 Active Job Openings</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Job Title</th>
                      <th>Department</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.id}</td>
                          <td style={{ fontWeight: "700" }}>{job.title}</td>
                          <td>{job.department}</td>
                          <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.description}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="delete-btn"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "30px" }}>No job openings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedCandidate && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.container}>
            <h2 style={modalStyles.title}>📝 Update Application Status</h2>
            <p style={modalStyles.subtitle}>
              Candidate: <strong>{selectedCandidate.candidateName}</strong> for <em>{selectedCandidate.position}</em>
            </p>
            
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Application Status</label>
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={modalStyles.select}
              >
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>HR Remarks</label>
              <textarea
                placeholder="Enter feedback or evaluation remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={modalStyles.textarea}
              />
            </div>

            {newStatus === "Selected" && (
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Department Assignment (AI Suggested: <strong>{selectedCandidate.suggestedDepartment || "Engineering"}</strong>)</label>
                <select
                  value={selectedCandidate.suggestedDepartment || "Engineering"}
                  onChange={(e) => {
                    setSelectedCandidate({
                      ...selectedCandidate,
                      suggestedDepartment: e.target.value
                    });
                  }}
                  style={modalStyles.select}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Frontend Department">Frontend Department</option>
                  <option value="Backend Department">Backend Department</option>
                  <option value="Cloud Department">Cloud Department</option>
                  <option value="AI/ML Department">AI/ML Department</option>
                  <option value="Data Analytics Department">Data Analytics Department</option>
                  <option value="Security Department">Security Department</option>
                  <option value="HR Department">HR Department</option>
                  <option value="QA">QA</option>
                  <option value="Design">Design</option>
                </select>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0" }}>
                  💡 Suggested by AI based on candidate resume. You can override it before hiring completes.
                </p>
              </div>
            )}

            {newStatus === "Shortlisted" && (
              <div className="ai-scheduler-card" style={{
                background: theme === "dark" ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.04)",
                border: "1.5px dashed #3b82f6",
                borderRadius: "12px",
                padding: "20px",
                margin: "15px 0",
                textAlign: "left"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <strong style={{ fontSize: "14px", color: "#3b82f6" }}>AI Recommended Interview Slot</strong>
                </div>

                {slotLoading ? (
                  <div style={{ textAlign: "center", padding: "15px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                    Analyzing calendar & predicting slot...
                  </div>
                ) : aiSlot ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Recommended Date:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{aiSlot.interviewDate}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Recommended Time:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{aiSlot.interviewTime}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Duration:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{aiSlot.duration}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Interview Type:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{aiSlot.interviewType}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Confidence score:</span>
                      <strong style={{ color: "#10b981" }}>{aiSlot.confidence}</strong>
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block", marginBottom: "2px", fontWeight: "700" }}>Reasoning:</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.4" }}>
                        "{aiSlot.reason}"
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <button 
                        onClick={handleApproveSchedule} 
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        {loading ? "Scheduling..." : "✓ Approve Schedule"}
                      </button>
                      <button 
                        onClick={handleRegenerateSlot} 
                        style={{
                          padding: "10px 14px",
                          background: "rgba(59, 130, 246, 0.15)",
                          color: "#3b82f6",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        🔄 Generate Another Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px 0", color: "#ef4444", fontSize: "12px" }}>
                    Failed to load recommended slot.
                  </div>
                )}
              </div>
            )}

            {newStatus === "Interview Scheduled" && (
              <div className="ai-scheduler-card" style={{
                background: theme === "dark" ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.04)",
                border: "1.5px dashed #10b981",
                borderRadius: "12px",
                padding: "20px",
                margin: "15px 0",
                textAlign: "left"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <strong style={{ fontSize: "14px", color: "#10b981" }}>AI Recommended Interview Schedule</strong>
                </div>

                {slotLoading ? (
                  <div style={{ textAlign: "center", padding: "15px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                    Analyzing calendar & predicting slot...
                  </div>
                ) : (!interviewDate || !interviewTime) ? (
                  <div style={{ textAlign: "center", padding: "15px 0", color: "#ef4444", fontSize: "13px", fontWeight: "600" }}>
                    Unable to generate interview schedule. Please try again.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Interview Date:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{interviewDate}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Interview Time:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{interviewTime}</strong>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Google Meet Link:</span>
                      <input
                        type="text"
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                        placeholder="Paste real Google Meet Link (e.g. https://meet.google.com/xxx-yyyy-zzz)"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1.5px solid var(--border-color)",
                          background: "var(--bg-app)",
                          color: "var(--text-primary)",
                          fontSize: "12.5px",
                          outline: "none"
                        }}
                      />
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block", marginBottom: "2px", fontWeight: "700" }}>Reason:</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.4" }}>
                        Best available slot selected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={modalStyles.btnGroup}>
              <button onClick={() => setShowModal(false)} style={modalStyles.cancelBtn}>Cancel</button>
              <button onClick={handleSaveStatus} style={modalStyles.saveBtn}>Save Status</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Scorecard Modal */}
      {showAiModal && selectedCandidate && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.container, width: "550px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={modalStyles.title}>🧠 AI Candidate Evaluation</h2>
              <button onClick={() => setShowAiModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>×</button>
            </div>
            
            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "8px", marginBottom: "10px" }}>
              <button 
                onClick={() => setModalTab("skills")}
                style={{
                  padding: "6px 12px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  background: modalTab === "skills" ? "var(--accent-primary)" : "transparent",
                  color: modalTab === "skills" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                🧠 Skill Scorecard
              </button>
              <button 
                onClick={() => setModalTab("fraud")}
                style={{
                  padding: "6px 12px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  background: modalTab === "fraud" ? "var(--accent-primary)" : "transparent",
                  color: modalTab === "fraud" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                🔍 AI Fraud Check
              </button>
              <button 
                onClick={() => setModalTab("resume")}
                style={{
                  padding: "6px 12px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  background: modalTab === "resume" ? "var(--accent-primary)" : "transparent",
                  color: modalTab === "resume" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                📄 Resume Analysis
              </button>
            </div>
            
            {modalTab === "skills" && (() => {
              const evalResult = getCandidateEvaluation(selectedCandidate);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto", maxHeight: "70vh", paddingRight: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "#f1f5f9", padding: "12px 18px", borderRadius: "10px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px" }}>
                      {selectedCandidate.candidateName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>{selectedCandidate.candidateName}</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{selectedCandidate.position} | Score: <strong>{evalResult.score}%</strong></p>
                    </div>
                    <span style={{ marginLeft: "auto", background: evalResult.recColor, color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                      {evalResult.recommendation}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Resume Details Extracted</span>
                    <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}><strong>Education:</strong> {evalResult.education}</p>
                    <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}><strong>Certifications:</strong> {evalResult.certifications}</p>
                    <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}><strong>Experience Level:</strong> {selectedCandidate.experience}</p>
                    <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}><strong>Applicant Skills:</strong> {selectedCandidate.skills}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1.5px solid #f1f5f9", paddingTop: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Position Match Analysis</span>
                    <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}>
                      <strong>Position Required Skills:</strong> {evalResult.requiredSkills.join(", ")}
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {evalResult.requiredSkills.map((skill, idx) => {
                        const matched = selectedCandidate.skills?.toLowerCase().includes(skill.toLowerCase());
                        return (
                          <span key={idx} style={{ fontSize: "10.5px", padding: "2px 8px", borderRadius: "10px", fontWeight: "700", background: matched ? "#d1fae5" : "#fee2e2", color: matched ? "#065f46" : "#991b1b" }}>
                            {matched ? "✓" : "✗"} {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1.5px solid #f1f5f9", paddingTop: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Generated Interview Questions</span>
                    <ul style={{ margin: 0, paddingLeft: "15px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {evalResult.questions.map((q, idx) => (
                        <li key={idx} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.4" }}>💬 {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {modalTab === "fraud" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto", maxHeight: "65vh" }}>
                {fraudReport ? (
                  <>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center", background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Fraud Score</span>
                        <div style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          color: fraudReport.fraudScore >= 61 ? "#dc2626" : fraudReport.fraudScore >= 31 ? "#d97706" : "#16a34a",
                          marginTop: "4px"
                        }}>
                          {fraudReport.fraudScore}/100
                        </div>
                      </div>
                      <div style={{ width: "2px", height: "40px", background: "#cbd5e1" }} />
                      <div>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Risk Level</span>
                        <div style={{
                          fontWeight: "800",
                          fontSize: "13px",
                          color: "white",
                          background: fraudReport.fraudScore >= 61 ? "#dc2626" : fraudReport.fraudScore >= 31 ? "#d97706" : "#16a34a",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          marginTop: "4px",
                          display: "inline-block"
                        }}>
                          {fraudReport.riskLevel}
                        </div>
                      </div>
                      <div style={{ width: "2px", height: "40px", background: "#cbd5e1" }} />
                      <div>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Duplicate Match</span>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>
                          {fraudReport.duplicateScore}%
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>AI Explanation Summary</span>
                      <div style={{
                        fontSize: "13px",
                        color: "#334155",
                        lineHeight: "1.5",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px",
                        whiteSpace: "pre-line"
                      }}>
                        {fraudReport.aiAnalysis}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    <div style={{ width: "24px", height: "24px", border: "3px solid #cbd5e1", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "auto" }}></div>
                    <p style={{ marginTop: "10px", fontSize: "12px" }}>Analyzing application for potential fraud indicators...</p>
                  </div>
                )}
              </div>
            )}

            {modalTab === "resume" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto", maxHeight: "65vh" }}>
                {resumeData ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center", background: "#f8fafc", padding: "12px 18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Match Score</span>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--accent-primary)", marginTop: "4px" }}>
                          {resumeData.matchScore}%
                        </div>
                      </div>
                      <div style={{ width: "2px", height: "40px", background: "#cbd5e1" }} />
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Extracted Contact</span>
                        <div style={{ fontSize: "12.5px", color: "#334155", marginTop: "4px", lineHeight: "1.4" }}>
                          📞 {resumeData.extractedPhone || "N/A"} <br/> ✉ {resumeData.extractedEmail || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Parsed Profile details</span>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Name:</strong> {resumeData.extractedName || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Current Location:</strong> {resumeData.currentLocation || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Projects:</strong> {resumeData.projects || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Education:</strong> {resumeData.extractedEducation || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Experience Level:</strong> {resumeData.extractedExperience || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Skills:</strong> {resumeData.extractedSkills || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Gender:</strong> {resumeData.gender || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}><strong>Certifications:</strong> {resumeData.certifications || "N/A"}</p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}>
                        <strong>LinkedIn URL:</strong> {resumeData.linkedinUrl ? (
                          <a href={resumeData.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", marginLeft: "4px" }}>
                            {resumeData.linkedinUrl}
                          </a>
                        ) : "N/A"}
                      </p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}>
                        <strong>GitHub URL:</strong> {resumeData.githubUrl ? (
                          <a href={resumeData.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", marginLeft: "4px" }}>
                            {resumeData.githubUrl}
                          </a>
                        ) : "N/A"}
                      </p>
                      <p style={{ fontSize: "13px", margin: "2px 0", color: "#334155" }}>
                        <strong>Portfolio URL:</strong> {resumeData.portfolioUrl ? (
                          <a href={resumeData.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", marginLeft: "4px" }}>
                            {resumeData.portfolioUrl}
                          </a>
                        ) : "N/A"}
                      </p>
                      {resumeData.matchingSkills && (
                        <p style={{ fontSize: "13px", margin: "2px 0", color: "#16a34a" }}><strong>Matching Skills:</strong> {resumeData.matchingSkills}</p>
                      )}
                      {resumeData.missingSkills && (
                        <p style={{ fontSize: "13px", margin: "2px 0", color: "#dc2626" }}><strong>Missing Skills:</strong> {resumeData.missingSkills}</p>
                      )}
                    </div>

                    {/* Recruitment Intelligence Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1.5px solid #f1f5f9", paddingTop: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Recruitment Intelligence</span>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                        <div><strong>Suggested Dept:</strong> {resumeData.suggestedDepartment || "Engineering"}</div>
                        <div><strong>Hiring Recommendation:</strong> <span style={{ fontWeight: "700", color: resumeData.hiringRecommendation?.includes("Not") ? "#ef4444" : "#16a34a" }}>{resumeData.hiringRecommendation || "N/A"}</span></div>
                        <div><strong>Interview Readiness:</strong> {resumeData.interviewReadinessScore || 0}%</div>
                        <div><strong>Risk Factor:</strong> <span style={{ fontWeight: "700", color: resumeData.candidateRisk?.includes("High") ? "#ef4444" : "#16a34a" }}>{resumeData.candidateRisk || "Low Risk"}</span></div>
                        <div><strong>Overall AI Score:</strong> {resumeData.overallScore || 0}% ({resumeData.matchCategory})</div>
                        <div><strong>Skills Match Score:</strong> {resumeData.skillScore || 0}%</div>
                      </div>

                      <p style={{ fontSize: "12.5px", margin: 0, color: "#334155" }}>
                        <strong>Skill Gap Analysis:</strong> {resumeData.skillGapAnalysis || "No significant gap identified."}
                      </p>

                      {resumeData.duplicateCandidateId && (
                        <div style={{
                          background: "#fee2e2",
                          border: "1px solid #fca5a5",
                          borderRadius: "6px",
                          padding: "10px",
                          fontSize: "12px",
                          color: "#991b1b",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>⚠️</span>
                          <span>
                            <strong>Potential Duplicate Detected:</strong> Similarity of {resumeData.duplicateSimilarity}% with Candidate ID {resumeData.duplicateCandidateId}.
                          </span>
                        </div>
                      )}
                    </div>

                    {resumeData.aiAnalysis && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1.5px solid #f1f5f9", paddingTop: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>AI Suitability & Analysis</span>
                        <p style={{ fontSize: "13px", color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", margin: 0, whiteSpace: "pre-line", lineHeight: "1.4" }}>
                          {resumeData.aiAnalysis}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    <div style={{ width: "24px", height: "24px", border: "3px solid #cbd5e1", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "auto" }}></div>
                    <p style={{ marginTop: "10px", fontSize: "12px" }}>Loading parsed resume details...</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={() => setShowAiModal(false)} style={{ ...modalStyles.saveBtn, background: "#475569" }}>Close Evaluation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    background: "var(--bg-panel)",
    padding: "30px",
    borderRadius: "16px",
    width: "480px",
    maxWidth: "90%",
    boxShadow: "var(--shadow-lg)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    border: "var(--card-border)",
  },
  title: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    background: "var(--bg-app)",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "13px",
    color: "var(--text-primary)",
    outline: "none",
    minHeight: "80px",
    resize: "vertical",
    fontFamily: "inherit",
    background: "var(--bg-app)",
  },
  btnGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "10px 18px",
    background: "var(--bg-app)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  saveBtn: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)",
  }
};

export default Recruitment;