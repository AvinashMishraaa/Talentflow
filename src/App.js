import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs, { JobDetail } from "./pages/Jobs";
import Candidates, { CandidateProfile } from "./pages/Candidates";
import Assessments from "./pages/Assessments";
import AuditLog from "./pages/AuditLog";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div className="app">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div className="mobile-overlay active" onClick={closeSidebar} />
        )}
        
        <aside className={`sidebar ${isMobile && sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="brand">
            <Link to="/" className="brand-link" onClick={isMobile ? closeSidebar : undefined}>
              <div className="brand-logo">TF</div>
              <div className="brand-name">TalentFlow</div>
            </Link>
          </div>
          <nav className="nav">
            <NavItem to="/" label="Dashboard" icon="🏠" onClick={isMobile ? closeSidebar : undefined} />
            <NavItem to="/jobs" label="Jobs" icon="💼" onClick={isMobile ? closeSidebar : undefined} />
            <NavItem to="/candidates" label="Candidates" icon="👥" onClick={isMobile ? closeSidebar : undefined} />
            <NavItem to="/assessments" label="Assessments" icon="🧪" onClick={isMobile ? closeSidebar : undefined} />
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
          <Topbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
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

function NavItem({ to, label, icon, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link className={active ? "nav-item active" : "nav-item"} to={to} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

function Topbar({ toggleSidebar, isMobile }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
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

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    let active = true;
    (async () => {
      const [jobsRes, candidatesRes] = await Promise.all([
        fetch(`/jobs?search=${encodeURIComponent(term)}&page=1&pageSize=5`),
        fetch(`/candidates?search=${encodeURIComponent(term)}&page=1&pageSize=5`)
      ]);
      const jobs = (await jobsRes.json()).data || [];
      const candidates = (await candidatesRes.json()).data || [];
      if (active) {
        setResults([
          ...jobs.map(j => ({ type: "job", id: j.id, title: j.title })),
          ...candidates.map(c => ({ type: "candidate", id: c.id, name: c.name }))
        ]);
        setShowResults(true);
      }
    })();
    return () => { active = false; };
  }, [term]);

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      {location.pathname === '/' ? (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            className="search"
            placeholder="Search jobs, candidates..."
            value={term}
            onChange={e => { setTerm(e.target.value); setShowResults(true); }}
            onFocus={() => term && setShowResults(true)}
            style={{ width: '100%' }}
          />
          {showResults && results.length > 0 && (
            <div style={{ position: 'absolute', top: 48, left: 0, right: 0, background: 'white', border: '1px solid #eee', borderRadius: 8, zIndex: 100, maxHeight: 300, overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {results.map((r, i) => (
                  <li key={r.type + '-' + r.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => {
                        setShowResults(false);
                        setTerm("");
                        if (r.type === "job") navigate(`/jobs/${r.id}`);
                        else navigate(`/candidates/${r.id}`);
                      }}>
                    {r.type === "job" ? <span style={{ color: '#2563eb', fontWeight: 600 }}>Job:</span> : <span style={{ color: '#059669', fontWeight: 600 }}>Candidate:</span>} {r.title || r.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Click outside to close */}
          {showResults && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }}
              onClick={() => setShowResults(false)}
              tabIndex={-1}
            />
          )}
        </div>
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
