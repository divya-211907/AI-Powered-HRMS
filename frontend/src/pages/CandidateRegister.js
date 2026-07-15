import { useState, useEffect } from "react";
import { addRecruitment, getJobOpenings, parseResume } from "../services/ApiService";
import { useNavigate } from "react-router-dom";

function CandidateRegister() {

const navigate = useNavigate();

const [jobs, setJobs] = useState([]);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisData, setAnalysisData] = useState(null);
const [fileObject, setFileObject] = useState(null);
const [analysisError, setAnalysisError] = useState("");

const [form, setForm] = useState({
candidateName: "",
email: "",
password: "",
mobile: "",
qualification: "",
skills: "",
experience: "",
position: "",
resumeName: "",
jobOpeningId: "",
gender: "",
certifications: "",
portfolioLinks: "",
linkedinUrl: "",
githubUrl: "",
portfolioUrl: "",
currentLocation: "",
projects: "",
});

useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await getJobOpenings();
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  fetchJobs();
}, []);

const handleChange = (e) => {
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const handleResume = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileObject(file);
  setForm(prev => ({ ...prev, resumeName: file.name }));
  setIsAnalyzing(true);
  setAnalysisError("");
  setAnalysisData(null);

  const formData = new FormData();
  formData.append("file", file);
  if (form.jobOpeningId) {
    formData.append("jobId", form.jobOpeningId);
  }

  try {
    const res = await parseResume(formData);
    if (res && res.data) {
      const ext = res.data;
      setForm(prev => ({
        ...prev,
        candidateName: ext.extractedName || prev.candidateName,
        email: ext.extractedEmail || prev.email,
        mobile: ext.extractedPhone || prev.mobile,
        qualification: ext.extractedEducation || prev.qualification,
        skills: ext.extractedSkills || prev.skills,
        experience: ext.extractedExperience || prev.experience,
        gender: ext.gender || prev.gender,
        certifications: ext.certifications || prev.certifications,
        portfolioLinks: ext.portfolioLinks || ext.linkedin || ext.github || prev.portfolioLinks,
        linkedinUrl: ext.linkedin || prev.linkedinUrl,
        githubUrl: ext.github || prev.githubUrl,
        portfolioUrl: ext.portfolioLinks || prev.portfolioUrl,
        currentLocation: ext.address || prev.currentLocation,
        projects: ext.projects || prev.projects,
      }));
      setAnalysisData({
        matchScore: ext.matchScore || 0,
        matchingSkills: ext.matchingSkills || "",
        missingSkills: ext.missingSkills || "",
        suitability: ext.aiAnalysis || ""
      });
    } else {
      setAnalysisError("Unable to extract resume details. Please enter information manually.");
    }
  } catch (err) {
    console.error("Resume analysis failed", err);
    setAnalysisError("Unable to extract resume details. Please enter information manually.");
  } finally {
    setIsAnalyzing(false);
  }
};

const registerCandidate = async () => {
  try {
    if (
      !form.candidateName ||
      !form.email ||
      !form.mobile ||
      !form.position
    ) {
      alert("Fill All Required Fields");
      return;
    }

    const formData = new FormData();
    formData.append("candidateName", form.candidateName);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("mobile", form.mobile);
    formData.append("qualification", form.qualification);
    formData.append("skills", form.skills);
    formData.append("experience", form.experience);
    formData.append("position", form.position);
    formData.append("gender", form.gender);
    formData.append("certifications", form.certifications);
    formData.append("portfolioLinks", form.portfolioLinks);
    formData.append("linkedinUrl", form.linkedinUrl);
    formData.append("githubUrl", form.githubUrl);
    formData.append("portfolioUrl", form.portfolioUrl);
    formData.append("currentLocation", form.currentLocation);
    formData.append("projects", form.projects);
    if (form.jobOpeningId) {
      formData.append("jobOpeningId", form.jobOpeningId);
    }
    if (fileObject) {
      formData.append("file", fileObject);
    }

    await addRecruitment(formData);
    alert("Application Submitted Successfully");
    navigate("/login");
  } catch (err) {
    console.log("FULL ERROR", err);
    alert("Registration Failed");
  }
};

  return (
    <>
      <div className="register-container">
        <div className="register-card" style={{ width: "550px" }}>
          <div className="logo">🎯</div>
          <h1>Candidate Portal</h1>
          <p className="subtitle">Submit your details to apply for an open position</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }} className="register-two-col">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Candidate Name *</label>
              <input
                name="candidateName"
                placeholder="Full Name"
                value={form.candidateName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Mobile Number *</label>
              <input
                name="mobile"
                placeholder="Phone Number"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Highest Qualification</label>
              <input
                name="qualification"
                placeholder="Degree / Diploma"
                value={form.qualification}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Professional Skills</label>
              <input
                name="skills"
                placeholder="e.g. React, Java, SQL"
                value={form.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Experience (Years)</label>
              <input
                name="experience"
                placeholder="e.g. 3 Years"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Current Location</label>
              <input
                name="currentLocation"
                placeholder="e.g. New York, USA"
                value={form.currentLocation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Projects</label>
              <input
                name="projects"
                placeholder="e.g. E-Commerce Website, Chat App"
                value={form.projects}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "#fff",
                  outline: "none"
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Certifications</label>
              <input
                name="certifications"
                placeholder="e.g. AWS Solutions Architect"
                value={form.certifications}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>LinkedIn URL</label>
              <input
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedinUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>GitHub URL</label>
              <input
                name="githubUrl"
                placeholder="https://github.com/username"
                value={form.githubUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Portfolio URL</label>
              <input
                name="portfolioUrl"
                placeholder="https://mywebsite.com"
                value={form.portfolioUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Applied Position *</label>
              <select
                name="position"
                value={form.position}
                onChange={(e) => {
                  const selectedJob = jobs.find(j => j.title === e.target.value);
                  setForm({
                    ...form,
                    position: e.target.value,
                    jobOpeningId: selectedJob ? selectedJob.id : ""
                  });
                }}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "#fff",
                  outline: "none"
                }}
              >
                <option value="">Select a Position</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.title}>{j.title} ({j.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Upload Resume (PDF/Doc)</label>
            <input
              type="file"
              onChange={handleResume}
              style={{ padding: "10px", background: "rgba(15, 23, 42, 0.4)" }}
            />
            {form.resumeName && (
              <small style={{ color: "var(--accent-success)", display: "block", marginTop: "5px", fontWeight: "600" }}>
                📎 Selected: {form.resumeName}
              </small>
            )}

            {isAnalyzing && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-primary)", fontWeight: "600", fontSize: "13px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid #cbd5e1", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                🤖 AI is analyzing your resume and auto-filling the form...
              </div>
            )}

            {analysisError && (
              <div style={{ marginTop: "12px", color: "var(--accent-danger)", fontWeight: "600", fontSize: "13px" }}>
                ⚠️ {analysisError}
              </div>
            )}

            {analysisData && (
              <div style={{
                marginTop: "15px",
                padding: "15px",
                borderRadius: "8px",
                background: "rgba(30, 41, 59, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f8fafc"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>✨ AI Match Analysis</span>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: analysisData.matchScore >= 80 ? "#22c55e" : analysisData.matchScore >= 50 ? "#eab308" : "#ef4444",
                    background: analysisData.matchScore >= 80 ? "rgba(34,197,94,0.15)" : analysisData.matchScore >= 50 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  }}>{analysisData.matchScore}% Match</span>
                </div>
                {analysisData.matchingSkills && (
                  <p style={{ fontSize: "13px", margin: "4px 0" }}>
                    <strong style={{ color: "#22c55e" }}>Matching Skills:</strong> {analysisData.matchingSkills}
                  </p>
                )}
                {analysisData.missingSkills && (
                  <p style={{ fontSize: "13px", margin: "4px 0" }}>
                    <strong style={{ color: "#ef4444" }}>Missing Skills:</strong> {analysisData.missingSkills}
                  </p>
                )}
              </div>
            )}
          </div>

          <button className="register-btn" onClick={registerCandidate}>
            Submit Application Form
          </button>

          <div className="login-link">
            Back to HRMS login?
            <span onClick={() => navigate("/login")}>
              Login here
            </span>
          </div>
        </div>
      </div>

      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:'Outfit',sans-serif;
        }

        .register-container{
          min-height:100vh;
          display:flex;
          justify-content:center;
          align-items:center;
          background:linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 50%,
            #0f172a 100%
          );
          padding:40px 20px;
        }

        .register-card{
          background:rgba(30, 41, 59, 0.7);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
          padding:40px;
          border-radius:var(--radius-lg);
          box-shadow:0 20px 50px rgba(0, 0, 0, 0.4);
          animation:fadeUp .7s ease;
        }

        @keyframes fadeUp{
          from{
            opacity:0;
            transform:translateY(30px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .logo{
          width:80px;
          height:80px;
          margin:auto;
          border-radius:50%;
          display:flex;
          justify-content:center;
          align-items:center;
          font-size:45px;
          background:rgba(255,255,255,0.1);
          box-shadow:0 8px 32px rgba(0,0,0,0.2);
          margin-bottom:20px;
        }

        h1{
          text-align:center;
          color:white;
          font-size:28px;
          font-weight:800;
          margin-bottom:8px;
        }

        .subtitle{
          text-align:center;
          color:#94a3b8;
          margin-bottom:25px;
          font-size:14px;
        }

        .form-group{
          margin-bottom:18px;
        }

        label{
          display:block;
          margin-bottom:7px;
          color:#cbd5e1;
          font-weight:600;
          font-size:13px;
        }

        input{
          width:100%;
          padding:12px 14px;
          border:1.5px solid rgba(255,255,255,0.1);
          border-radius:var(--radius-md);
          background:rgba(15, 23, 42, 0.6);
          color:white;
          font-size:14px;
          transition:.3s;
        }

        input:focus{
          outline:none;
          border-color:var(--accent-primary);
          box-shadow:0 0 0 4px rgba(59, 130, 246, 0.25);
        }

        .register-btn{
          width:100%;
          padding:15px;
          border:none;
          border-radius:var(--radius-md);
          background:linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
          color:white;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          box-shadow:0 4px 12px rgba(59, 130, 246, 0.3);
          transition:.3s;
        }

        .register-btn:hover{
          transform:translateY(-2px);
          box-shadow:0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .login-link{
          margin-top:20px;
          text-align:center;
          color:#94a3b8;
          font-size:14px;
        }

        .login-link span{
          color:#60a5fa;
          font-weight:700;
          cursor:pointer;
          margin-left:5px;
        }

        .login-link span:hover{
          text-decoration:underline;
        }

        @media(max-width:500px){
          .register-card{
            width:100%;
            padding:25px;
          }

          h1{
            font-size:24px;
          }
        }
      `}</style>
    </>
  );
}

export default CandidateRegister;
