import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs, { JobDetail } from "./pages/Jobs";
import Candidates, { CandidateProfile } from "./pages/Candidates";
import Assessments from "./pages/Assessments";
import AuditLog from "./pages/AuditLog";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <Link to="/" className="brand-link">
              <div className="brand-logo">TF</div>
              <div className="brand-name">TalentFlow</div>
            </Link>
          </div>
          <nav className="nav">
            <NavItem to="/" label="Dashboard" icon="🏠" />
            <NavItem to="/jobs" label="Jobs" icon="💼" />
            <NavItem to="/candidates" label="Candidates" icon="👥" />
            <NavItem to="/assessments" label="Assessments" icon="🧪" />
          </nav>
          <div className="sidebar-footer">
            <div className="user-avatar">AM</div>
            <div className="user-meta">
              <div className="user-name">Avinash Mishra</div>
              <div className="user-role">HR Manager</div>
            </div>
          </div>
        </aside>

        <main className="main">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/audit-log" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, label, icon }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link className={active ? "nav-item active" : "nav-item"} to={to}>{label}</Link>
  );
}

function Topbar() {
  const [term, setTerm] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("tf_theme") || "light");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = React.useRef(null);
  const profileRef = React.useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tf_theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/notifications").then(r => r.json()).then(setNotifications);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (notifRef.current && notifRef.current.contains(e.target)) return;
      if (profileRef.current && profileRef.current.contains(e.target)) return;
      setShowNotif(false);
      setShowProfile(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/candidates?search=${encodeURIComponent(term)}`);
    }
  };

  return (
    <header className="topbar">
      {location.pathname === '/' ? (
        <input className="search" placeholder="Search jobs, candidates..." value={term} onChange={e => setTerm(e.target.value)} onKeyDown={onKeyDown} />
      ) : (
        <div style={{ flex: 1 }} />
      )}
      <div className="actions">
        <button className="icon-btn tooltip" onClick={() => setTheme(theme === "light" ? "dark" : "light")} data-tip={theme === "light" ? "Switch dark" : "Switch light"}>
          {theme === "light" ? "☀" : "🌙"}
        </button>
        <div className="dropdown" ref={notifRef}>
          <button className="icon-btn tooltip" onClick={() => { setShowNotif(v => !v); setShowProfile(false); }} data-tip="Notifications">🔔</button>
          {showNotif && (
            <div className="menu">
              <div className="menu-header">Recent activity</div>
              {notifications.length === 0 && <div className="menu-item muted">No notifications</div>}
              {notifications.map(n => (
                <div key={n.id} className="menu-item">{n.text}</div>
              ))}
            </div>
          )}
        </div>
        <div className="dropdown" ref={profileRef}>
          <button className="icon-btn tooltip" onClick={() => { setShowProfile(v => !v); setShowNotif(false); }} data-tip="Profile">👤</button>
          {showProfile && (
            <div className="menu">
              <div className="menu-header">Signed in as</div>
              <div className="menu-item"><strong>Admin</strong> access</div>
              <div className="menu-item muted">You have full permissions</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default App;
