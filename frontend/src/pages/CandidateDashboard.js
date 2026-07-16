import { useState, useEffect } from "react";
import { 
  addRecruitment,
  getRecruitmentByEmail,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  getStatusHistory,
  getJobOpenings,
  parseResume,
  getCandidateInterviews,
  getEmployees,
  getResumeAnalysis
} from "../services/ApiService";

// Job Profiles requirements dictionary
const jobRequirements = {
  "Software Engineer": ["Java", "JavaScript", "SQL", "REST API", "Git", "HTML", "CSS"],
  "Java Developer": ["Java", "Spring Boot", "SQL", "REST API", "Git", "Docker", "Microservices"],
  "React Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Redux", "Git"],
  "QA Engineer": ["Selenium", "Java", "Testing", "Automation", "Jira", "SQL", "Git"],
  "UI/UX Designer": ["Figma", "Sketch", "Wireframing", "Prototyping", "User Research", "HTML", "CSS"],
};

const getJobRequirements = (pos) => {
  if (!pos) return jobRequirements["Software Engineer"];
  const cleanPos = pos.trim().toLowerCase();
  for (const [key, value] of Object.entries(jobRequirements)) {
    if (key.toLowerCase() === cleanPos) {
      return value;
    }
  }
  return jobRequirements["Software Engineer"];
};

function CandidateDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const renderDetailsWithLinks = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.toLowerCase().includes("http://") || line.toLowerCase().includes("https://")) {
        const parts = line.split(/(https?:\/\/[^\s]+)/g);
        return (
          <div key={idx}>
            {parts.map((part, pIdx) => {
              if (part.startsWith("http://") || part.startsWith("https://")) {
                return (
                  <a key={pIdx} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", fontWeight: "700" }}>
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </div>
        );
      }
      return <div key={idx}>{line}</div>;
    });
  };

  // Status & Notifications state
  const [candidateRecord, setCandidateRecord] = useState(null);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    if (candidateRecord?.id) {
      getCandidateInterviews(candidateRecord.id)
        .then(res => setInterviews(res.data || []))
        .catch(err => console.error("Error loading candidate interviews:", err));
    }
  }, [candidateRecord?.id]);

  useEffect(() => {
    if (candidateRecord && (candidateRecord.status === "Selected" || candidateRecord.status?.toUpperCase() === "SELECTED" || candidateRecord.status?.toUpperCase() === "HIRED" || candidateRecord.status?.toUpperCase() === "OFFER ACCEPTED")) {
      const fetchEmp = async () => {
        try {
          const res = await getEmployees();
          const emps = res.data || [];
          const found = emps.find(e => e.email?.toLowerCase() === candidateRecord.email?.toLowerCase());
          if (found) {
            setEmployeeRecord(found);
          }
        } catch (err) {
          console.error("Failed to load converted employee details", err);
        }
      };
      fetchEmp();
    }
  }, [candidateRecord]);

  const isGarbage = (str) => {
    if (!str) return true;
    return false;
  };

  const loadCandidateDetails = async (isInitial = false) => {
    if (!currentUser?.email) return;
    try {
      const res = await getRecruitmentByEmail(currentUser.email);
      if (res.data) {
        setCandidateRecord(res.data);
        if (isInitial) {
          const nameClean = (res.data.candidateName && !isGarbage(res.data.candidateName)) ? res.data.candidateName : (currentUser?.candidateName || currentUser?.name || "");
          setForm({
            candidateName: nameClean,
            email: res.data.email || "",
            mobile: res.data.mobile || "",
            gender: res.data.gender || "Male",
            qualification: res.data.qualification || "",
            skills: res.data.skills || "",
            experience: res.data.experience || "",
            position: res.data.position || "Software Engineer",
            certifications: res.data.certifications || "",
            portfolioLinks: res.data.portfolioLinks || "",
            linkedinUrl: res.data.linkedinUrl || "",
            githubUrl: res.data.githubUrl || "",
            portfolioUrl: res.data.portfolioUrl || "",
            jobOpeningId: res.data.jobOpeningId || "",
            currentLocation: res.data.currentLocation || "",
            projects: res.data.projects || "",
          });

          // Fetch Resume Analysis from database
          getResumeAnalysis(res.data.id)
            .then(analysisRes => {
              if (analysisRes.data) {
                const d = analysisRes.data;
                setMatchScore(d.matchScore || d.aiMatchScore || 0);
                setMatchingSkills(d.matchingSkills ? d.matchingSkills.split(",").map(s => s.trim()) : []);
                setMissingSkills(d.missingSkills ? d.missingSkills.split(",").map(s => s.trim()) : []);
                setSuitabilityAnalysis(d.suitability || d.aiAnalysis || "Suitability evaluated successfully.");
                setProfileSummary(d.summary || d.aiAnalysis || "Extracted profile summary.");
                
                // Advanced AI parameters mapping
                setOverallScore(d.overallScore || d.matchScore || d.aiMatchScore || 0);
                setSkillScore(d.skillScore || d.matchScore || d.aiMatchScore || 0);
                setExperienceScore(d.experienceScore || 0);
                setEducationScore(d.educationScore || 0);
                setProjectScore(d.projectScore || 0);
                setMatchCategory(d.matchCategory || "Average Match");
                setAiExplanation(d.aiExplanation || d.suitability || d.aiAnalysis || "");
                setSuggestedDepartment(d.suggestedDepartment || "");
                setSkillGapAnalysis(d.skillGapAnalysis || d.missingSkills || "");
                setInterviewReadinessScore(d.interviewReadinessScore || 0);
                setCandidateRisk(d.candidateRisk || "Low Risk");
                setHiringRecommendation(d.hiringRecommendation || "Recommended");
                
                setAnalyzed(true);
              }
            })
            .catch(err => console.error("Failed to load resume analysis on init", err));
        }
      } else {
        if (isInitial) {
          const draft = sessionStorage.getItem("candidate_form_draft");
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              setForm(parsed);
            } catch (e) {
              console.error("Failed to parse draft form from session", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load candidate details", err);
    }
  };

  const loadNotifications = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await getNotifications(currentUser.email);
      setNotifications(res.data || []);
      
      const countRes = await getUnreadNotificationCount(currentUser.email);
      setUnreadCount(countRes.data || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const loadStatusHistory = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await getStatusHistory(currentUser.email);
      setStatusHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load status history", err);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await getJobOpenings();
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.email) return;
    try {
      await markAllNotificationsAsRead(currentUser.email);
      setUnreadCount(0);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status) => {
    const normal = status ? status.toUpperCase() : "UNDER REVIEW";
    if (normal === "SELECTED" || normal === "OFFERED") {
      return { background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" };
    }
    if (normal === "REJECTED" || normal === "NOT SELECTED") {
      return { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
    }
    if (normal === "INTERVIEW SCHEDULED") {
      return { background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" };
    }
    return { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
  };

  const getStepState = (stepNumber) => {
    const current = candidateRecord?.status ? candidateRecord.status.toUpperCase() : "APPLIED";
    const isHiredOrSelected = current === "SELECTED" || current === "HIRED" || current === "OFFER ACCEPTED";
    
    // Step 1: Applied
    if (stepNumber === 1) {
      return { completed: true, active: current === "APPLIED" };
    }
    // Step 2: Reviewing / Shortlisted
    if (stepNumber === 2) {
      const isCompleted = current !== "APPLIED" && current !== "UNDER REVIEW" && current !== "SHORTLISTED";
      const isActive = current === "UNDER REVIEW" || current === "SHORTLISTED";
      return { completed: isCompleted, active: isActive };
    }
    // Step 3: Interview Scheduled
    if (stepNumber === 3) {
      const isCompleted = isHiredOrSelected || current === "REJECTED";
      const isActive = current === "INTERVIEW SCHEDULED";
      return { completed: isCompleted, active: isActive };
    }
    // Step 4: Selected / Rejected
    if (stepNumber === 4) {
      const isSelected = isHiredOrSelected;
      const isRejected = current === "REJECTED";
      return { completed: isSelected || isRejected, active: isSelected || isRejected, isRejected };
    }
    return { completed: false, active: false };
  };

  // Form State
  const [form, setForm] = useState({
    candidateName: currentUser?.candidateName || "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
    gender: "Male",
    qualification: currentUser?.qualification || "",
    skills: currentUser?.skills || "",
    experience: currentUser?.experience || "",
    position: currentUser?.position || "Software Engineer",
    certifications: currentUser?.certifications || "",
    portfolioLinks: currentUser?.portfolioLinks || "",
    linkedinUrl: currentUser?.linkedinUrl || "",
    githubUrl: currentUser?.githubUrl || "",
    portfolioUrl: currentUser?.portfolioUrl || "",
    jobOpeningId: "",
    currentLocation: "",
    projects: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Theme support
  const [theme, setTheme] = useState(localStorage.getItem("hrms_candidate_theme") || "dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("hrms_candidate_theme", nextTheme);
  };

  // AI & Analysis States
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [profileSummary, setProfileSummary] = useState("");
  const [activeTab, setActiveTab] = useState("match"); // match | career | feedback | intelligence
  const [matchScore, setMatchScore] = useState(0);
  const [missingSkills, setMissingSkills] = useState([]);
  const [careerSuggestions, setCareerSuggestions] = useState({ roles: [], courses: [], paths: [] });
  const [formTips, setFormTips] = useState([]);
  const [appFeedback, setAppFeedback] = useState([]);
  const [matchingSkills, setMatchingSkills] = useState([]);
  const [suitabilityAnalysis, setSuitabilityAnalysis] = useState("");

  // Advanced AI Scores
  const [overallScore, setOverallScore] = useState(0);
  const [skillScore, setSkillScore] = useState(0);
  const [experienceScore, setExperienceScore] = useState(0);
  const [educationScore, setEducationScore] = useState(0);
  const [projectScore, setProjectScore] = useState(0);
  const [matchCategory, setMatchCategory] = useState("Average Match");
  const [aiExplanation, setAiExplanation] = useState("");
  const [suggestedDepartment, setSuggestedDepartment] = useState("");
  const [skillGapAnalysis, setSkillGapAnalysis] = useState("");
  const [interviewReadinessScore, setInterviewReadinessScore] = useState(0);
  const [candidateRisk, setCandidateRisk] = useState("Low Risk");
  const [hiringRecommendation, setHiringRecommendation] = useState("Recommended");

  useEffect(() => {
    loadCandidateDetails(true);
    loadNotifications();
    loadStatusHistory();
    loadJobs();

    const interval = setInterval(() => {
      loadCandidateDetails(false);
      loadNotifications();
      loadStatusHistory();
      loadJobs();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (form.email && !candidateRecord) {
      sessionStorage.setItem("candidate_form_draft", JSON.stringify(form));
    }
  }, [form, candidateRecord]);

  // Real-time recalculation of skill match score and feedback tips (AI Form Assistant)
  useEffect(() => {
    if (analyzed) {
      return;
    }
    const required = getJobRequirements(form.position);

    const candidateSkills = form.skills
      ? form.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    const matched = required.filter((req) => 
      candidateSkills.some((cand) => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand))
    );

    const score = Math.round((matched.length / required.length) * 100);
    setMatchScore(score);

    const missing = required.filter((req) => 
      !candidateSkills.some((cand) => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand))
    );
    setMissingSkills(missing);
    
    // Set matching skills for display
    const matchedCapitalized = required.filter((req) => 
      candidateSkills.some((cand) => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand))
    );
    setMatchingSkills(matchedCapitalized);

    const text = `Candidate possesses ${matched.length} out of ${required.length} required skills for the ${form.position} role. Match score: ${score}%. ${
      score >= 70
        ? "Excellent suitability for this role."
        : score >= 40
        ? "Moderate alignment; upskilling is recommended."
        : "Low alignment; consider other positions or adding missing skills."
    }`;
    setSuitabilityAnalysis(text);

    const summary = `${form.candidateName || "Candidate"} is applying for the ${form.position} position with ${form.experience || "0 years of"} experience. Educational background includes ${form.qualification || "not specified"}. Identified skills: ${form.skills || "none"}.`;
    setProfileSummary(summary);
    setAnalyzed(true);

    // Form Tips (AI Form Assistant)
    const tips = [];
    if (!form.candidateName) tips.push("Please provide your full legal name for formal verification.");
    if (!form.mobile || form.mobile.length < 10) tips.push("A valid 10-digit mobile number ensures immediate contact.");
    if (score < 50) tips.push(`Your match rating is low. Adding skills like ${missing.slice(0, 2).join(", ")} will improve matches.`);
    if (!form.portfolioLinks) tips.push("Providing a LinkedIn or Portfolio URL increases shortlist probability by 35%.");
    setFormTips(tips);

    // Career suggestions
    const suggestedRoles = [];
    if (candidateSkills.includes("react") || candidateSkills.includes("javascript")) {
      suggestedRoles.push("Frontend Developer", "Full Stack Engineer");
    }
    if (candidateSkills.includes("java") || candidateSkills.includes("spring")) {
      suggestedRoles.push("Java Developer", "Backend Engineer");
    }
    if (suggestedRoles.length === 0) {
      suggestedRoles.push("Associate Software Engineer", "Junior Consultant");
    }

    const courses = missing.map((skill) => ({
      name: `Mastering ${skill} for Enterprise Applications`,
      platform: "Coursera / Udemy",
    }));

    setCareerSuggestions({
      roles: suggestedRoles,
      courses: courses.slice(0, 3),
      paths: [
        "Strengthen foundation in core development frameworks.",
        "Obtain professional certifications in database modeling.",
        "Build a robust GitHub portfolio with deployed projects.",
      ]
    });

    // Application Feedback
    const feedbacks = [];
    if (score >= 70) {
      feedbacks.push("⭐ Excellent skill alignment. Your profile matches most criteria.");
    } else if (score >= 40) {
      feedbacks.push("⚠️ Moderate match. Focus on filling core skill gaps before final evaluation.");
    } else {
      feedbacks.push("❌ Low match. Consider applying for general software associate positions.");
    }
    if (form.experience && parseInt(form.experience) >= 2) {
      feedbacks.push("✅ Solid hands-on experience listed. Great advantage!");
    }
    if (form.certifications) {
      feedbacks.push("🎯 Professional credentials verified. Improves recruiter visibility.");
    }
    setAppFeedback(feedbacks);

  }, [form.skills, form.position, form.candidateName, form.mobile, form.portfolioLinks, form.experience, form.certifications, form.qualification]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setAnalyzed(false);
  };

  const handleFile = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    if (!uploadedFile) return;

    setAnalyzing(true);
    setAnalyzed(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      if (form.jobOpeningId) {
        formData.append("jobId", form.jobOpeningId);
      }

      const res = await parseResume(formData);
      if (res.data) {
        const d = res.data;

        setForm((prev) => {
          const extractedName = d.extractedName && !isGarbage(d.extractedName) ? d.extractedName.trim() : prev.candidateName;
          const extractedEmail = d.extractedEmail && !isGarbage(d.extractedEmail) ? d.extractedEmail.trim() : prev.email;
          const extractedPhone = d.extractedPhone && !isGarbage(d.extractedPhone) ? d.extractedPhone.trim() : prev.mobile;
          const extractedQual = d.extractedEducation && !isGarbage(d.extractedEducation) ? d.extractedEducation.trim() : prev.qualification;
          const extractedSkills = d.extractedSkills && !isGarbage(d.extractedSkills) ? d.extractedSkills.trim() : prev.skills;
          const extractedExp = d.extractedExperience && !isGarbage(d.extractedExperience) ? d.extractedExperience.trim() : prev.experience;
          const extractedGender = d.gender && !isGarbage(d.gender) ? d.gender.trim() : prev.gender;
          const extractedCert = d.certifications && !isGarbage(d.certifications) ? d.certifications.trim() : prev.certifications;
          const extractedPortfolio = d.portfolioLinks && !isGarbage(d.portfolioLinks) ? d.portfolioLinks.trim() : prev.portfolioLinks;
          const extractedLinkedin = d.linkedin && !isGarbage(d.linkedin) ? d.linkedin.trim() : prev.linkedinUrl;
          const extractedGithub = d.github && !isGarbage(d.github) ? d.github.trim() : prev.githubUrl;
          const extractedLocation = d.address && !isGarbage(d.address) ? d.address.trim() : prev.currentLocation;
          const extractedProjects = d.projects && !isGarbage(d.projects) ? d.projects.trim() : prev.projects;

          // Match position
          let matchedPosition = prev.position;
          let matchedJobId = prev.jobOpeningId;
          if (d.preferredJobRole && jobs.length > 0) {
            const pLower = d.preferredJobRole.toLowerCase();
            const matched = jobs.find(j => j.title.toLowerCase().includes(pLower) || pLower.includes(j.title.toLowerCase()));
            if (matched) {
              matchedPosition = matched.title;
              matchedJobId = matched.id;
            }
          }

          return {
            ...prev,
            candidateName: extractedName,
            email: extractedEmail,
            mobile: extractedPhone,
            qualification: extractedQual,
            skills: extractedSkills,
            experience: extractedExp,
            gender: extractedGender,
            certifications: extractedCert,
            portfolioLinks: extractedPortfolio,
            linkedinUrl: extractedLinkedin,
            githubUrl: extractedGithub,
            portfolioUrl: extractedPortfolio,
            currentLocation: extractedLocation,
            projects: extractedProjects,
            position: matchedPosition,
            jobOpeningId: matchedJobId,
          };
        });

        setMatchScore(d.matchScore || 0);
        setMatchingSkills(d.matchingSkills ? d.matchingSkills.split(",").map(s => s.trim()) : []);
        setMissingSkills(d.missingSkills ? d.missingSkills.split(",").map(s => s.trim()) : []);
        setSuitabilityAnalysis(d.aiAnalysis || "Suitability evaluated successfully.");
        setProfileSummary(d.aiAnalysis || "Extracted profile summary.");
        
        // Advanced AI parameters mapping
        setOverallScore(d.overallScore || d.matchScore || 0);
        setSkillScore(d.skillScore || d.matchScore || 0);
        setExperienceScore(d.experienceScore || 0);
        setEducationScore(d.educationScore || 0);
        setProjectScore(d.projectScore || 0);
        setMatchCategory(d.matchCategory || "Average Match");
        setAiExplanation(d.aiExplanation || d.aiAnalysis || "");
        setSuggestedDepartment(d.suggestedDepartment || "");
        setSkillGapAnalysis(d.skillGapAnalysis || d.missingSkills || "");
        setInterviewReadinessScore(d.interviewReadinessScore || 0);
        setCandidateRisk(d.candidateRisk || "Low Risk");
        setHiringRecommendation(d.hiringRecommendation || "Recommended");
      }
    } catch (err) {
      console.error("Failed to parse resume", err);
      setError("Resume parsing failed. Please fill details manually.");
    } finally {
      setAnalyzing(false);
      setAnalyzed(true);
    }
  };

  const submitApplication = async () => {
    if (!form.candidateName || !form.mobile) {
      setError("Please complete all personal details before submitting.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });
      if (file) {
        formData.append("file", file);
      }

      await addRecruitment(formData);
      setSuccess("✅ Application Submitted Successfully! Our hiring team will review your profile shortly.");
      sessionStorage.removeItem("candidate_form_draft");
      setForm({
        candidateName: "",
        email: currentUser?.email || "",
        mobile: "",
        gender: "Male",
        qualification: "",
        skills: "",
        experience: "",
        position: "Software Engineer",
        certifications: "",
        portfolioLinks: "",
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",
        jobOpeningId: "",
        currentLocation: "",
        projects: "",
      });
      setFile(null);
      loadCandidateDetails(true);
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.message || err.response?.data || "Failed to submit application. Please verify your connection.";
      setError(`❌ ${backendError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    if (!window.confirm("Are you sure you want to reset the application form?")) return;
    setForm({
      candidateName: currentUser?.candidateName || currentUser?.name || "",
      email: currentUser?.email || "",
      mobile: "",
      gender: "Male",
      qualification: "",
      skills: "",
      experience: "",
      position: "Software Engineer",
      certifications: "",
      portfolioLinks: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      jobOpeningId: "",
      currentLocation: "",
      projects: "",
    });
    setFile(null);
    setAnalyzed(false);
    setMatchScore(0);
    setMatchingSkills([]);
    setMissingSkills([]);
    setSuitabilityAnalysis("");
    setProfileSummary("");
    sessionStorage.removeItem("candidate_form_draft");
  };

  const themeVars = theme === "dark" ? {
    "--bg-app": "#0f172a",
    "--bg-panel": "rgba(30, 41, 59, 0.75)",
    "--text-primary": "#ffffff",
    "--text-secondary": "#94a3b8",
    "--card-border": "1px solid rgba(255, 255, 255, 0.08)",
    "--stat-card-bg": "rgba(15, 23, 42, 0.4)",
    "--radius-lg": "16px",
    "--radius-md": "12px",
    "--accent-primary": "#3b82f6",
    "--accent-success": "#10b981",
    "--shadow-md": "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.2)",
  } : {
    "--bg-app": "#f8fafc",
    "--bg-panel": "#ffffff",
    "--text-primary": "#1e293b",
    "--text-secondary": "#64748b",
    "--card-border": "1px solid #e2e8f0",
    "--stat-card-bg": "#f1f5f9",
    "--radius-lg": "16px",
    "--radius-md": "12px",
    "--accent-primary": "#2563eb",
    "--accent-success": "#16a34a",
    "--shadow-md": "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    "--shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div style={{ ...styles.page, ...themeVars }}>
      {/* Top Header Bar */}
      <div style={styles.topHeader}>
        <div style={styles.logoGroup}>
          <span style={styles.portalTitle}>Candidate Recruitment Portal</span>
          <button
            onClick={toggleTheme}
            style={{
              marginLeft: "15px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "12px",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
        
        {/* Notification Bell */}
        <div style={styles.notifWrapper}>
          <button 
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (!showNotifDropdown) {
                handleMarkAllRead();
              }
            }} 
            style={styles.bellBtn}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showNotifDropdown && (
            <div style={styles.notifDropdown}>
              <div style={styles.notifHeader}>
                <span style={styles.notifTitle}>Notifications</span>
                {unreadCount > 0 && <span style={styles.notifSubtitle}>{unreadCount} new</span>}
              </div>
              <div style={styles.notifList}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} style={{ ...styles.notifItem, background: n.read ? "transparent" : "rgba(37, 99, 235, 0.05)" }}>
                      <p style={styles.notifMsg}>
                        {!n.read && <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>●</span>}
                        {n.message}
                      </p>
                      <span style={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ ...styles.emptyNotifs, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "20px 10px" }}>
                    <span style={{ fontSize: "28px" }}>🔔</span>
                    <span>No notifications yet</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Card & Application status timeline */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeText}>
          <h1 style={styles.welcomeTitle}>👋 Welcome, {form.candidateName || currentUser?.candidateName || "Candidate"}!</h1>
          <p style={styles.welcomeSubtitle}>Track your recruitment lifecycle and build your future application portal.</p>
        </div>
        
        {/* Timeline Status */}
        <div style={styles.timelineWrapper}>
          {(() => {
            const step1 = getStepState(1);
            return (
              <div style={styles.timelineStep}>
                <div style={{
                  ...styles.stepDot,
                  background: step1.completed ? "var(--accent-success)" : step1.active ? "var(--accent-primary)" : "var(--stat-card-bg)",
                  color: step1.completed || step1.active ? "white" : "var(--text-secondary)",
                  border: step1.completed || step1.active ? "none" : "2px solid #cbd5e1"
                }}>
                  {step1.completed ? "✓" : "1"}
                </div>
                <span style={{ ...styles.stepLabel, color: step1.active ? "var(--accent-primary)" : "var(--text-secondary)" }}>Applied</span>
              </div>
            );
          })()}
          <div style={styles.timelineLine} />
          
          {(() => {
            const step2 = getStepState(2);
            return (
              <div style={styles.timelineStep}>
                <div style={{
                  ...styles.stepDot,
                  background: step2.completed ? "var(--accent-success)" : step2.active ? "var(--accent-primary)" : "var(--stat-card-bg)",
                  color: step2.completed || step2.active ? "white" : "var(--text-secondary)",
                  border: step2.completed || step2.active ? "none" : "2px solid #cbd5e1"
                }}>
                  {step2.completed ? "✓" : "2"}
                </div>
                <span style={{ ...styles.stepLabel, color: step2.active ? "var(--accent-primary)" : "var(--text-secondary)" }}>Reviewing</span>
              </div>
            );
          })()}
          <div style={styles.timelineLine} />

          {(() => {
            const step3 = getStepState(3);
            return (
              <div style={styles.timelineStep}>
                <div style={{
                  ...styles.stepDot,
                  background: step3.completed ? "var(--accent-success)" : step3.active ? "var(--accent-primary)" : "var(--stat-card-bg)",
                  color: step3.completed || step3.active ? "white" : "var(--text-secondary)",
                  border: step3.completed || step3.active ? "none" : "2px solid #cbd5e1"
                }}>
                  {step3.completed ? "✓" : "3"}
                </div>
                <span style={{ ...styles.stepLabel, color: step3.active ? "var(--accent-primary)" : "var(--text-secondary)" }}>Interview</span>
              </div>
            );
          })()}
          <div style={styles.timelineLine} />

          {(() => {
            const step4 = getStepState(4);
            const dotBg = step4.isRejected ? "var(--accent-danger)" : "var(--accent-success)";
            return (
              <div style={styles.timelineStep}>
                <div style={{
                  ...styles.stepDot,
                  background: step4.completed || step4.active ? dotBg : "var(--stat-card-bg)",
                  color: step4.completed || step4.active ? "white" : "var(--text-secondary)",
                  border: step4.completed || step4.active ? "none" : "2px solid #cbd5e1"
                }}>
                  {step4.completed && !step4.isRejected ? "✓" : step4.isRejected ? "✗" : "4"}
                </div>
                <span style={{ ...styles.stepLabel, color: step4.active ? dotBg : "var(--text-secondary)" }}>
                  {step4.isRejected ? "Rejected" : "Offer"}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Application Status Card */}
      {candidateRecord && (
        <div style={styles.statusCard}>
          <div style={styles.statusHeader}>
            <h3 style={styles.statusTitle}>📢 Application Status: <span style={{ ...styles.statusBadge, ...getStatusStyle(candidateRecord.status) }}>{candidateRecord.status || "Under Review"}</span></h3>
            <span style={styles.submittedDate}>Submitted on: {candidateRecord.applicationDate || "Recently"}</span>
          </div>

          <div style={styles.statusContentGrid} className="status-content-grid">
            <div style={styles.statusItem}>
              <strong style={styles.statusItemLabel}>📋 Applied Position:</strong>
              <span style={styles.statusItemValue}>{candidateRecord.position}</span>
            </div>

            <div style={styles.statusItem}>
              <strong style={styles.statusItemLabel}>💬 HR Remarks:</strong>
              <p style={styles.remarksText}>{candidateRecord.remarks || "Your profile is being reviewed by our recruitment team."}</p>
            </div>

            {candidateRecord.status === "Interview Scheduled" && (
              <div style={{
                marginTop: "15px",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1.5px solid #10b981",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#10b981", fontSize: "14px", fontWeight: "700" }}>
                  Interview Scheduled
                </h4>
                {interviews.length > 0 ? (
                  interviews.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                      <div><strong>Date:</strong> {item.interviewDate}</div>
                      <div><strong>Time:</strong> {item.interviewTime}</div>
                      {item.meetingLink && (
                        <div>
                          <strong>Link:</strong>{" "}
                          <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", fontWeight: "700" }}>
                            {item.meetingLink}
                          </a>
                        </div>
                      )}
                      <div><strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "700" }}>Upcoming</span></div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                    <div><strong>Details:</strong></div>
                    <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                      {renderDetailsWithLinks(candidateRecord.interviewDetails)}
                    </div>
                    <div><strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "700" }}>Upcoming</span></div>
                  </div>
                )}
              </div>
            )}

            {(candidateRecord.status === "Selected" || candidateRecord.status?.toUpperCase() === "SELECTED" || candidateRecord.status?.toUpperCase() === "HIRED" || candidateRecord.status?.toUpperCase() === "OFFER ACCEPTED") && (
              <div style={{
                marginTop: "15px",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                border: "1.5px solid #10b981",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#10b981", fontSize: "17px", fontWeight: "800" }}>
                  🎉 Congratulations!
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", fontWeight: "600" }}>
                  You have been selected and successfully onboarded as an employee.
                </p>
                {employeeRecord && (
                  <div style={{
                    marginTop: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px",
                    borderTop: "1px dashed rgba(16, 185, 129, 0.3)",
                    paddingTop: "12px",
                    color: "var(--text-secondary)"
                  }}>
                    <div><strong>Employee ID:</strong> <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{employeeRecord.employeeId}</span></div>
                    <div><strong>Department:</strong> <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{employeeRecord.department?.departmentName || "Engineering"}</span></div>
                    <div><strong>Designation:</strong> <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{employeeRecord.designation || "Staff"}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {statusHistory.length > 0 && (
            <div style={{ marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
              <strong style={styles.statusItemLabel}>📜 Status History Log:</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                {statusHistory.map((history, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span>🔄 Marked <strong>{history.status}</strong></span>
                    <span>{new Date(history.updatedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Job Openings Grid */}
      <div style={{ ...styles.card, marginBottom: "25px", border: "1px solid #e2e8f0" }}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>💼 Available Job Openings</h2>
          <p style={styles.cardSubtitle}>Browse and apply directly to open positions created by our recruiting managers.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "15px" }}>
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const isSelected = form.jobOpeningId === job.id;
              return (
                <div 
                  key={job.id} 
                  style={{
                    background: "#fff",
                    border: isSelected ? "2.5px solid var(--accent-primary)" : "1.5px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                    boxShadow: isSelected ? "0 4px 15px rgba(37,99,235,0.15)" : "none",
                    transform: isSelected ? "scale(1.01)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "10.5px", background: "rgba(37,99,235,0.06)", color: "var(--accent-primary)", padding: "4px 8px", borderRadius: "12px", fontWeight: "800", textTransform: "uppercase" }}>{job.department}</span>
                    <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: "8px 0 4px" }}>{job.title}</h3>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>{job.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        position: job.title,
                        jobOpeningId: job.id
                      }));
                      setSuccess(`Selected position: "${job.title}". Fill in details below to apply!`);
                      document.getElementById("career-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{
                      padding: "8px 12px",
                      background: isSelected ? "var(--accent-success)" : "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginTop: "10px"
                    }}
                  >
                    {isSelected ? "✓ Position Selected" : "Apply Now"}
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", gridColumn: "span 3", textAlign: "center", padding: "20px 0" }}>No job openings currently available.</p>
          )}
        </div>
      </div>

      {/* Main Grid: Left Form, Right AI Panel */}
      <div style={styles.gridContainer} className="candidate-dashboard-grid">
        {/* Application Form */}
        <div style={styles.card} id="career-form">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📄 Career Application Form</h2>
            <p style={styles.cardSubtitle}>Fill in your details or upload your resume for auto-fill analysis.</p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}
          {success && <div style={styles.successAlert}>{success}</div>}

          <div style={styles.formGrid} className="candidate-form-grid">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                name="candidateName"
                placeholder="John Doe"
                value={form.candidateName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                value={form.email}
                readOnly
                style={{ ...styles.input, background: "var(--border-color)", opacity: 0.8 }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number</label>
              <input
                name="mobile"
                placeholder="10-digit number"
                value={form.mobile}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Education Details</label>
              <input
                name="qualification"
                placeholder="e.g. Master of Computer Applications"
                value={form.qualification}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Skills (Comma Separated)</label>
              <input
                name="skills"
                placeholder="Java, Spring Boot, React, Git, SQL"
                value={form.skills}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Experience (Years)</label>
              <input
                name="experience"
                placeholder="e.g. 3 Years"
                value={form.experience}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Applying Position</label>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="React Developer">React Developer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Certifications</label>
              <input
                name="certifications"
                placeholder="e.g. AWS Solutions Architect"
                value={form.certifications}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>LinkedIn URL</label>
              <input
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedinUrl}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>GitHub URL</label>
              <input
                name="githubUrl"
                placeholder="https://github.com/username"
                value={form.githubUrl}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Portfolio URL</label>
              <input
                name="portfolioUrl"
                placeholder="https://mywebsite.com"
                value={form.portfolioUrl}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Location</label>
              <input
                name="currentLocation"
                placeholder="e.g. New York, USA"
                value={form.currentLocation}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Projects</label>
              <input
                name="projects"
                placeholder="e.g. E-Commerce Website, Chat App"
                value={form.projects}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Upload Resume</label>
              <div style={styles.uploadArea}>
                <input
                  type="file"
                  onChange={handleFile}
                  style={styles.fileInput}
                  id="resume-file"
                />
                <label htmlFor="resume-file" style={styles.uploadBtn}>
                  {file ? "Change File" : "Choose Resume File"}
                </label>
                {file && <span style={styles.uploadFileName}>📄 {file.name}</span>}
              </div>
              {analyzing && (
                <div style={styles.analyzingAlert}>
                  <div style={styles.spinner}></div>
                  <span>AI Resume Analyzer extracting fields...</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              onClick={submitApplication}
              disabled={loading}
              style={{ ...styles.submitBtn, flex: 1, marginTop: 0 }}
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
            <button
              onClick={handleResetForm}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "14px",
                fontWeight: "700",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Reset Form
            </button>
          </div>
        </div>

        {/* AI Analytics Panel */}
        <div style={styles.aiPanel}>
          <div style={styles.aiHeader}>
            <div style={styles.aiTitleRow}>
              <span style={{ fontSize: "24px" }}>✨</span>
              <h3 style={styles.aiTitle}>HRMS AI Assistant</h3>
            </div>
            <p style={styles.aiSubtitle}>Real-time matching, profile analysis, and career insights.</p>
          </div>

          {/* AI Tabs */}
          <div style={styles.aiTabs}>
            <button
              onClick={() => setActiveTab("match")}
              style={{ ...styles.aiTab, borderBottom: activeTab === "match" ? "3px solid var(--accent-primary)" : "none", color: activeTab === "match" ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              Skill Score
            </button>
            <button
              onClick={() => setActiveTab("career")}
              style={{ ...styles.aiTab, borderBottom: activeTab === "career" ? "3px solid var(--accent-primary)" : "none", color: activeTab === "career" ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              Career Coach
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              style={{ ...styles.aiTab, borderBottom: activeTab === "feedback" ? "3px solid var(--accent-primary)" : "none", color: activeTab === "feedback" ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              Form Helper
            </button>
            <button
              onClick={() => setActiveTab("intelligence")}
              style={{ ...styles.aiTab, borderBottom: activeTab === "intelligence" ? "3px solid var(--accent-primary)" : "none", color: activeTab === "intelligence" ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              Recruitment Intelligence
            </button>
          </div>

          <div style={styles.aiContent}>
            {/* TAB 1: Skill Score */}
            {activeTab === "match" && (
              <div style={styles.aiMatchSection}>
                {analyzed && file && (
                  <div style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1.5px solid #10b981",
                    borderRadius: "10px",
                    padding: "15px",
                    marginBottom: "15px",
                    color: "var(--text-primary)",
                    textAlign: "left"
                  }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#10b981", fontSize: "14px", fontWeight: "800" }}>
                      🎉 Resume Analysis Complete
                    </h4>
                    <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div><strong>Match Score:</strong> {matchScore}%</div>
                      <div>
                        <strong>Extracted Skills:</strong>
                        <ul style={{ margin: "4px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                          {form.skills ? form.skills.split(",").map((s, idx) => (
                            <li key={idx}>{s.trim()}</li>
                          )) : <li>None</li>}
                        </ul>
                      </div>
                      <div>
                        <strong>Missing Skills:</strong>
                        <ul style={{ margin: "4px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                          {missingSkills.length > 0 ? missingSkills.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          )) : <li>None</li>}
                        </ul>
                      </div>
                      <div><strong>Experience:</strong> {form.experience || "None"}</div>
                      <div><strong>Education:</strong> {form.qualification || "None"}</div>
                    </div>
                  </div>
                )}
                <div style={styles.progressCircleContainer}>
                  <div style={styles.progressRing}>
                    <span style={styles.progressValue}>{matchScore}%</span>
                    <span style={styles.progressLabel}>Match</span>
                  </div>
                </div>

                <div style={styles.aiSubCard}>
                  <h4 style={styles.aiSubTitle}>🎯 Required Skills:</h4>
                  <div style={styles.tagGrid}>
                    {getJobRequirements(form.position).map((req, idx) => {
                      const isMatched = form.skills && form.skills.toLowerCase().includes(req.toLowerCase());
                      return (
                        <span key={idx} style={{
                          ...styles.tag,
                          background: isMatched ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: isMatched ? "#22C55E" : "#F59E0B"
                        }}>
                          {req} {isMatched ? "✓" : "⚠"}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {matchingSkills.length > 0 && (
                  <div style={styles.aiSubCard}>
                    <h4 style={{ ...styles.aiSubTitle, color: "#22C55E" }}>✓ Matching Skills:</h4>
                    <div style={styles.tagGrid}>
                      {matchingSkills.map((req, idx) => (
                        <span key={idx} style={{ ...styles.tag, background: "rgba(34, 197, 94, 0.1)", color: "#22C55E" }}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {missingSkills.length > 0 && (
                  <div style={styles.aiSubCard}>
                    <h4 style={{ ...styles.aiSubTitle, color: "var(--accent-danger)" }}>❌ Missing Skills:</h4>
                    <div style={styles.tagGrid}>
                      {missingSkills.map((req, idx) => (
                        <span key={idx} style={{ ...styles.tag, background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {suitabilityAnalysis && (
                  <div style={styles.aiSubCard}>
                    <h4 style={{ ...styles.aiSubTitle, color: "var(--accent-primary)" }}>📝 Job Suitability Analysis:</h4>
                    <p style={styles.aiText}>{suitabilityAnalysis}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Career Coach */}
            {activeTab === "career" && (
              <div style={styles.aiCareerSection}>
                {analyzed && (
                  <div style={{ ...styles.aiSubCard, background: "var(--card-gradient-4)" }}>
                    <h4 style={styles.aiSubTitle}>📝 Profile Summary:</h4>
                    <p style={styles.aiText}>{profileSummary}</p>
                  </div>
                )}

                <div style={styles.aiSubCard}>
                  <h4 style={styles.aiSubTitle}>🚀 Suggested Roles:</h4>
                  <ul style={styles.list}>
                    {careerSuggestions.roles.map((role, idx) => (
                      <li key={idx} style={styles.listItem}>💡 {role}</li>
                    ))}
                  </ul>
                </div>

                {careerSuggestions.courses.length > 0 && (
                  <div style={styles.aiSubCard}>
                    <h4 style={styles.aiSubTitle}>📚 Recommended Upskilling:</h4>
                    <ul style={styles.list}>
                      {careerSuggestions.courses.map((course, idx) => (
                        <li key={idx} style={styles.listItem}>🎓 <strong>{course.name}</strong> ({course.platform})</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={styles.aiSubCard}>
                  <h4 style={styles.aiSubTitle}>📈 Career Development Steps:</h4>
                  <ul style={styles.list}>
                    {careerSuggestions.paths.map((path, idx) => (
                      <li key={idx} style={styles.listItem}>⚡ {path}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: Form Helper & Feedback */}
            {activeTab === "feedback" && (
              <div style={styles.aiFeedbackSection}>
                <div style={styles.aiSubCard}>
                  <h4 style={styles.aiSubTitle}>💡 Form Assistant Tips:</h4>
                  {formTips.length > 0 ? (
                    <ul style={styles.list}>
                      {formTips.map((tip, idx) => (
                        <li key={idx} style={{ ...styles.listItem, color: "var(--text-secondary)" }}>✨ {tip}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={styles.aiText}>✅ All fields are fully optimized for recruiters!</p>
                  )}
                </div>

                <div style={styles.aiSubCard}>
                  <h4 style={styles.aiSubTitle}>📊 Application Selection Feedback:</h4>
                  {appFeedback.length > 0 ? (
                    <ul style={styles.list}>
                      {appFeedback.map((feedback, idx) => (
                        <li key={idx} style={styles.listItem}>{feedback}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={styles.aiText}>Reviewing matching requirements...</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Recruitment Intelligence */}
            {activeTab === "intelligence" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{
                  background: "var(--stat-card-bg)",
                  border: "var(--card-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                  textAlign: "left"
                }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "var(--text-primary)", fontSize: "16px", fontWeight: "800", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🎯 Scoring Breakdown</span>
                    <span style={{ fontSize: "12px", background: "rgba(37,99,235,0.1)", color: "var(--accent-primary)", padding: "4px 8px", borderRadius: "12px" }}>
                      {matchCategory}
                    </span>
                  </h4>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "conic-gradient(var(--accent-primary) " + (overallScore * 3.6) + "deg, #e2e8f0 0deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        <div style={{ width: "66px", height: "66px", borderRadius: "50%", background: "var(--bg-panel)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px", color: "var(--text-primary)" }}>
                          {overallScore}%
                        </div>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>Overall Score</span>
                    </div>

                    <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                          <span>Skills Score</span>
                          <span>{skillScore}%</span>
                        </div>
                        <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: skillScore + "%", height: "100%", background: "#3b82f6", borderRadius: "4px" }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                          <span>Experience Score</span>
                          <span>{experienceScore}%</span>
                        </div>
                        <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: experienceScore + "%", height: "100%", background: "#10b981", borderRadius: "4px" }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                          <span>Education Score</span>
                          <span>{educationScore}%</span>
                        </div>
                        <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: educationScore + "%", height: "100%", background: "#f59e0b", borderRadius: "4px" }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                          <span>Project Score</span>
                          <span>{projectScore}%</span>
                        </div>
                        <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: projectScore + "%", height: "100%", background: "#8b5cf6", borderRadius: "4px" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "var(--stat-card-bg)",
                  border: "var(--card-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                  textAlign: "left"
                }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "var(--text-primary)", fontSize: "15px", fontWeight: "800" }}>
                    💼 Hiring Evaluation
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>Recommendation:</td>
                        <td style={{ padding: "8px 0", fontWeight: "700", color: hiringRecommendation.includes("Not") || hiringRecommendation.includes("Needs") ? "#ef4444" : "#10b981" }}>{hiringRecommendation}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>Suggested Department:</td>
                        <td style={{ padding: "8px 0", fontWeight: "700", color: "var(--text-primary)" }}>{suggestedDepartment || "Engineering"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>Interview Readiness:</td>
                        <td style={{ padding: "8px 0", fontWeight: "700", color: "var(--text-primary)" }}>{interviewReadinessScore}%</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>Risk Assessment:</td>
                        <td style={{ padding: "8px 0", fontWeight: "700", color: candidateRisk.includes("High") ? "#ef4444" : "#10b981" }}>{candidateRisk}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{
                  background: "var(--stat-card-bg)",
                  border: "var(--card-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  boxShadow: "var(--shadow-sm)",
                  textAlign: "left"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "var(--text-primary)", fontSize: "15px", fontWeight: "800" }}>
                    ⚠ Skill Gap Analysis
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                    {skillGapAnalysis}
                  </p>
                </div>

                {aiExplanation && (
                  <div style={{
                    background: "rgba(37,99,235,0.05)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    textAlign: "left"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "var(--accent-primary)", fontSize: "15px", fontWeight: "800" }}>
                      💡 Evaluation Summary
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
                      {aiExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    background: "var(--bg-app)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  welcomeBanner: {
    background: "linear-gradient(135deg, var(--bg-panel), rgba(30, 41, 59, 0.05))",
    border: "var(--card-border)",
    borderRadius: "var(--radius-lg)",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    boxShadow: "var(--shadow-md)",
  },

  welcomeText: {
    flex: 1,
    minWidth: "280px",
  },

  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },

  welcomeSubtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },

  timelineWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "var(--stat-card-bg)",
    padding: "15px 25px",
    borderRadius: "var(--radius-md)",
    border: "var(--card-border)",
    boxShadow: "var(--shadow-sm)",
  },

  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  stepDot: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "var(--stat-card-bg)",
  },

  stepLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },

  timelineLine: {
    width: "40px",
    height: "2px",
    background: "#cbd5e1",
    marginTop: "-18px",
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "30px",
    alignItems: "start",
  },

  card: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-lg)",
    padding: "35px",
    boxShadow: "var(--shadow-md)",
    backdropFilter: "blur(8px)",
  },

  cardHeader: {
    marginBottom: "30px",
  },

  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "6px",
  },

  cardSubtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },

  input: {
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--stat-card-bg)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },

  select: {
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    background: "var(--stat-card-bg)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },

  uploadArea: {
    border: "2px dashed var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(0,0,0,0.01)",
  },

  fileInput: {
    display: "none",
  },

  uploadBtn: {
    padding: "8px 16px",
    background: "var(--accent-primary)",
    color: "white",
    fontSize: "12px",
    fontWeight: "700",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  uploadFileName: {
    fontSize: "13px",
    color: "var(--accent-success)",
    fontWeight: "600",
  },

  analyzingAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "var(--accent-primary)",
    marginTop: "10px",
    fontWeight: "600",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(37, 99, 235, 0.2)",
    borderTop: "2px solid var(--accent-primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  submitBtn: {
    width: "100%",
    marginTop: "30px",
    padding: "14px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  errorAlert: {
    padding: "12px 18px",
    background: "rgba(239, 68, 68, 0.1)",
    borderLeft: "4px solid var(--accent-danger)",
    color: "var(--accent-danger)",
    fontSize: "13px",
    borderRadius: "var(--radius-sm)",
    marginBottom: "20px",
    fontWeight: "600",
  },

  successAlert: {
    padding: "12px 18px",
    background: "rgba(34, 197, 94, 0.1)",
    borderLeft: "4px solid var(--accent-success)",
    color: "var(--accent-success)",
    fontSize: "13px",
    borderRadius: "var(--radius-sm)",
    marginBottom: "20px",
    fontWeight: "600",
  },

  aiPanel: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-lg)",
    padding: "30px",
    boxShadow: "var(--shadow-md)",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    position: "sticky",
    top: "30px",
  },

  aiHeader: {
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "15px",
  },

  aiTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },

  aiTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },

  aiSubtitle: {
    fontSize: "12px",
    color: "var(--text-secondary)",
  },

  aiTabs: {
    display: "flex",
    gap: "15px",
    borderBottom: "1px solid var(--border-color)",
  },

  aiTab: {
    padding: "10px 5px",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "color 0.2s",
  },

  aiContent: {
    minHeight: "260px",
  },

  progressCircleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },

  progressRing: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    background: "radial-gradient(var(--bg-panel) 60%, transparent 61%), conic-gradient(var(--accent-primary) 0%, var(--border-color) 0%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid rgba(37, 99, 235, 0.1)",
    boxShadow: "var(--shadow-sm)",
  },

  progressValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },

  progressLabel: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  aiSubCard: {
    background: "var(--stat-card-bg)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-md)",
    padding: "16px",
    marginBottom: "15px",
    boxShadow: "var(--shadow-sm)",
  },

  aiSubTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "10px",
  },

  tagGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  tag: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  aiText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
  },

  list: {
    listStyleType: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  listItem: {
    fontSize: "13px",
    color: "var(--text-primary)",
    fontWeight: "500",
  },

  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-sm)",
    marginBottom: "10px",
  },

  portalTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "var(--accent-primary)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  notifWrapper: {
    position: "relative",
  },

  bellBtn: {
    background: "var(--stat-card-bg)",
    border: "var(--card-border)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "transform 0.2s",
  },

  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "var(--accent-danger)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "10px",
    padding: "2px 6px",
    border: "2px solid var(--bg-panel)",
  },

  notifDropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    width: "320px",
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    zIndex: 100,
    overflow: "hidden",
    animation: "fadeIn 0.2s ease-out",
  },

  notifHeader: {
    padding: "12px 18px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.02)",
  },

  notifTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },

  notifSubtitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--accent-primary)",
  },

  notifList: {
    maxHeight: "280px",
    overflowY: "auto",
  },

  notifItem: {
    padding: "12px 18px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    transition: "background 0.2s",
  },

  notifMsg: {
    fontSize: "12px",
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: "1.4",
  },

  notifTime: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    alignSelf: "flex-end",
  },

  emptyNotifs: {
    padding: "30px",
    textAlign: "center",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },

  statusCard: {
    background: "var(--bg-panel)",
    border: "var(--card-border)",
    borderRadius: "var(--radius-lg)",
    padding: "25px 30px",
    boxShadow: "var(--shadow-md)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  statusHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "15px",
  },

  statusTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  submittedDate: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },

  statusContentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "20px",
    flexWrap: "wrap",
  },

  statusItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  statusItemLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  statusItemValue: {
    fontSize: "14px",
    color: "var(--text-primary)",
    fontWeight: "700",
  },

  remarksText: {
    fontSize: "13px",
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: "1.5",
    background: "rgba(0,0,0,0.01)",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-color)",
  },

  interviewDetailsBox: {
    gridColumn: "span 2",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "var(--radius-md)",
    padding: "15px 20px",
    marginTop: "5px",
  },

  interviewDetailsText: {
    fontSize: "13px",
    color: "#1e3a8a",
    margin: 0,
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    fontWeight: "600",
  },
};

export default CandidateDashboard;