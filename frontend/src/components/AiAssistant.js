import React, { useState, useContext, useEffect, useRef } from "react";
import { HrmsContext } from "../context/HrmsContext";
import { askAiAssistant } from "../services/AiService";
import {
  getEmployees,
  getAttendance,
  getLeaves,
  getPayrolls,
  getRecruitments
} from "../services/ApiService";
import "./AiAssistant.css";

function AiAssistant() {
  const context = useContext(HrmsContext);
  const { isAiOpen, setIsAiOpen } = context;

  const role = localStorage.getItem("role");

  // Portal render protection: Chatbot is disabled on HR / Admin dashboard pages
  const isAuthorized = true;

  const getInitialAssistantName = () => {
    if (role === "HR") return "HR Assistant";
    return role === "EMPLOYEE" ? "Employee Assistant" : "Recruitment Assistant";
  };

  const [assistantName, setAssistantName] = useState(getInitialAssistantName());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings values
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [model, setModel] = useState(localStorage.getItem("gemini_model") || "gemini-2.5-flash");

  const chatEndRef = useRef(null);

  // Initialize role-specific welcome text
  useEffect(() => {
    if (!isAuthorized) return;
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userName = currentUser?.name || currentUser?.username || "Guest";
    
    if (role === "HR") {
      setMessages([
        {
          role: "assistant",
          text: `👋 Hello ${userName}! I am your AI HR Copilot. I can help you analyze recruitment profiles, search candidate suitability, check employee leave patterns, or generate interview questions. How can I help you today?`
        }
      ]);
      setAssistantName("HR Assistant");
    } else if (role === "EMPLOYEE") {
      setMessages([
        {
          role: "assistant",
          text: `👋 Hello ${userName}! I am your Employee AI Assistant. I can answer queries regarding your specific attendance records, leave balances, salary details, and HR policies. How can I help you today?`
        }
      ]);
      setAssistantName("Employee Assistant");
    } else if (role === "CANDIDATE") {
      setMessages([
        {
          role: "assistant",
          text: `👋 Hello ${userName}! I am your Recruitment AI Assistant. I can track your application status, analyze your resume details, suggest skill certifications, and help you prepare for interviews. How can I help you today?`
        }
      ]);
      setAssistantName("Recruitment Assistant");
    }
  }, [role, isAuthorized]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);



  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) {
      setInput("");
    }

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      // Fetch fresh, real-time records from database
      const [empRes, attRes, leaveRes, payRes, recRes] = await Promise.all([
        getEmployees(),
        getAttendance(),
        getLeaves(),
        getPayrolls(),
        getRecruitments()
      ]);

      const freshContext = {
        employees: empRes.data || [],
        attendance: attRes.data || [],
        leaves: leaveRes.data || [],
        payrolls: payRes.data || [],
        recruitments: recRes.data || []
      };

      const reply = await askAiAssistant(query, freshContext, currentUser);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Sorry, I encountered an issue processing your request." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const finalName = assistantName.trim() || getInitialAssistantName();
    setAssistantName(finalName);
    localStorage.setItem("gemini_assistant_name", finalName);

    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    localStorage.setItem("gemini_model", model);
    setShowSettings(false);
    
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `⚙️ **Settings Saved**: Assistant name set to **${finalName}**. ${
          apiKey.trim()
            ? `Live Gemini AI Mode is active using **${model}**.`
            : "Reverted to local **Demo Mode**."
        }`
      }
    ]);
  };

  // Suggestion chips per portal type
  const suggestionChips = role === "EMPLOYEE"
    ? [
        { label: "⏰ My Attendance Today", query: "Am I marked present today?" },
        { label: "🌴 Leave Balance", query: "How many casual leaves do I have left?" },
        { label: "💰 Net Salary details", query: "Show my salary details and net payout" },
        { label: "👨‍💼 My Profile info", query: "Show my employee information" }
      ]
    : [
        { label: "🎯 My Application Status", query: "What is my application status?" },
        { label: "🧠 Resume feedback", query: "Analyze my resume and generate feedback" },
        { label: "🛠️ Skill recommendations", query: "What skills should I improve for this role?" },
        { label: "💬 Interview Prep", query: "Help me prepare for my interview" }
      ];

  const renderMarkdown = (text) => {
    if (!text) return "";
    
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt bridge;");

    formatted = formatted.replace(/^### (.*?)$/gm, "<h4 class='chat-h4'>$1</h4>");
    formatted = formatted.replace(/^## (.*?)$/gm, "<h3 class='chat-h3'>$1</h3>");
    formatted = formatted.replace(/^# (.*?)$/gm, "<h2 class='chat-h2'>$1</h2>");
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/^\* (.*?)$/gm, "<li class='chat-li'>$1</li>");
    formatted = formatted.replace(/\n\n/g, "<div class='chat-p-break'></div>");
    formatted = formatted.replace(/\n/g, "<br />");
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const isDemo = !localStorage.getItem("gemini_api_key");
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser || (role !== "EMPLOYEE" && role !== "CANDIDATE")) return null;

  return (
    <div className={`ai-copilot-container ${isAiOpen ? "open" : ""}`}>
      <button 
        className={`ai-copilot-toggle ${isAiOpen ? "active" : ""} pulse-active`}
        onClick={() => setIsAiOpen(!isAiOpen)}
        title="AI Assistant"
      >
        {isAiOpen ? (
          <span style={{ fontSize: "20px", fontWeight: "700" }}>✕</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
            <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" fill="currentColor" />
            <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Chat Window Panel */}
      {isAiOpen && (
        <div className="ai-chat-window glass-card animate-fade-in">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <span className="ai-chat-header-avatar">🤖</span>
              <div>
                <h4>{assistantName}</h4>
                <p className="ai-chat-status">
                  <span className="status-dot online"></span>
                  {isDemo ? "Demo Mode (Local Data)" : "Live AI Mode"}
                </p>
              </div>
            </div>
            <button 
              className="ai-chat-settings-btn" 
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              ⚙️
            </button>
          </div>

          {/* Settings panel overlay */}
          {showSettings ? (
            <form onSubmit={handleSaveSettings} className="ai-chat-settings-panel">
              <h5>⚙️ Assistant Settings</h5>
              <div className="settings-field">
                <label>Assistant Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. HRMS Assistant" 
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  required
                />
              </div>
              <div className="settings-field">
                <label>Gemini API Key</label>
                <input 
                  type="password" 
                  placeholder="Paste AI Studio Key..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <small>Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.</small>
              </div>
              <div className="settings-field">
                <label>AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>
              <div className="settings-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSettings(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Settings</button>
              </div>
            </form>
          ) : (
            <>
              {/* Chat Feed */}
              <div className="ai-chat-feed">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-bubble-wrapper ${msg.role}`}>
                    <div className="chat-bubble-avatar">{msg.role === "assistant" ? "🤖" : "👤"}</div>
                    <div className="chat-bubble-content">
                      {renderMarkdown(msg.text)}
                    </div>
                  </div>
                ))}
                
                {/* Typing Loader */}
                {loading && (
                  <div className="chat-bubble-wrapper assistant">
                    <div className="chat-bubble-avatar">🤖</div>
                    <div className="chat-bubble-content loading-skeleton">
                      <div className="skeleton-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions chips wrapper */}
              <div className="ai-chat-suggestions">
                {suggestionChips.map((chip, idx) => (
                  <button 
                    key={idx} 
                    className="ai-suggestion-chip"
                    onClick={() => handleSend(chip.query)}
                    disabled={loading}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Input area */}
              <div className="ai-chat-input-area">
                <input
                  type="text"
                  placeholder={role === "EMPLOYEE" ? "Ask about your attendance, leaves, payroll..." : "Ask about your application status, preparation topics..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading}
                />
                <button 
                  className="ai-chat-send-btn"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                >
                  ➔
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
