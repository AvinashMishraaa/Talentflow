import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Jobs, { JobDetail } from './pages/Jobs';
import Candidates, { CandidateProfile } from './pages/Candidates';
import Assessments from './pages/Assessments';
import AuditLog from './pages/AuditLog';
import Landing from "./pages/Landing";
import { api } from './utils/api';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <AppContent isMobile={isMobile} />
    </Router>
  );
}

function AppContent({ isMobile }) {
  const location = useLocation();

  return (
    <div className="app">
      {!isMobile && location.pathname !== '/' && (
          <aside className="sidebar">
            <div className="brand">
              <Link to="/" className="brand-link">
                <div className="brand-logo">TF</div>
                <div className="brand-name">TalentFlow</div>
              </Link>
            </div>
            <nav className="nav">
              <NavItem to="/dashboard" label="Dashboard" icon="🏠" />
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
        )}

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <Dashboard />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/jobs" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <Jobs />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/jobs/:jobId" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <JobDetail />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/candidates" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <Candidates />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/candidates/:id" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <CandidateProfile />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/assessments" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <Assessments />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
          <Route path="/audit-log" element={
            <main className={`main ${isMobile ? 'mobile-main' : ''}`}>
              <Topbar isMobile={isMobile} />
              <AuditLog />
              {isMobile && <MobileBottomNav />}
            </main>
          } />
        </Routes>
      </div>
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

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="mobile-bottom-nav">
      <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'mobile-nav-item active' : 'mobile-nav-item'}>
        <span className="mobile-nav-icon">🏠</span>
        <span className="mobile-nav-label">Dashboard</span>
      </Link>
      <Link to="/jobs" className={location.pathname.startsWith('/jobs') ? 'mobile-nav-item active' : 'mobile-nav-item'}>
        <span className="mobile-nav-icon">💼</span>
        <span className="mobile-nav-label">Jobs</span>
      </Link>
      <Link to="/candidates" className={location.pathname.startsWith('/candidates') ? 'mobile-nav-item active' : 'mobile-nav-item'}>
        <span className="mobile-nav-icon">👥</span>
        <span className="mobile-nav-label">Candidates</span>
      </Link>
      <Link to="/assessments" className={location.pathname.startsWith('/assessments') ? 'mobile-nav-item active' : 'mobile-nav-item'}>
        <span className="mobile-nav-icon">🧪</span>
        <span className="mobile-nav-label">Tests</span>
      </Link>
    </nav>
  );
}

function Topbar({ isMobile }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("tf_theme") || "light");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = React.useRef(null);
  const profileRef = React.useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tf_theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        const res = await api.get("/notifications");
        const data = await res.json();
        setNotifications(data);
        console.log('✅ Notifications loaded successfully:', data);
      } catch (err) {
        console.error('❌ Failed to load notifications:', err);
        setNotificationsError(err.message);
        // Fallback to empty notifications instead of crashing
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };
    
    // Add a small delay to ensure MSW is ready
    const timer = setTimeout(loadNotifications, 500);
    return () => clearTimeout(timer);
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
      try {
        const [jobsRes, candidatesRes] = await Promise.all([
          api.get(`/jobs?search=${encodeURIComponent(term)}&page=1&pageSize=5`),
          api.get(`/candidates?search=${encodeURIComponent(term)}&page=1&pageSize=5`)
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
      } catch (err) {
        console.error('Search failed:', err);
        if (active) {
          setResults([]);
          setShowResults(false);
        }
      }
    })();
    return () => { active = false; };
  }, [term]);

  return (
    <header className={`topbar ${isMobile ? 'mobile-topbar' : ''}`} style={{ position: 'relative' }}>
      {isMobile && location.pathname !== '/dashboard' && (
        <button className="mobile-back-btn" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      )}
      {location.pathname === '/dashboard' ? (
        <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: isMobile ? 'calc(100% - 160px)' : 'calc(100% - 220px)', marginRight: '20px' }}>
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
        <div className="page-title" style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
            {location.pathname === '/dashboard' ? 'Dashboard' :
             location.pathname === '/jobs' ? 'Jobs' :
             location.pathname === '/candidates' ? 'Candidates' :
             location.pathname === '/assessments' ? 'Assessments' :
             location.pathname === '/audit-log' ? 'Audit Log' : 'TalentFlow'}
          </h2>
        </div>
      )}
      <div className={`actions ${isMobile ? 'mobile-actions' : ''}`}>
        <button className="icon-btn tooltip" onClick={() => setTheme(theme === "light" ? "dark" : "light")} data-tip={theme === "light" ? "Switch dark" : "Switch light"}>
          {theme === "light" ? "☀" : "🌙"}
        </button>
        <div className="dropdown" ref={notifRef}>
          <button className="icon-btn tooltip" onClick={() => { setShowNotif(v => !v); setShowProfile(false); }} data-tip="Notifications">🔔</button>
          {showNotif && (
            <div className="menu">
              <div className="menu-header">Recent activity</div>
              {notificationsLoading && <div className="menu-item muted">Loading...</div>}
              {notificationsError && <div className="menu-item muted">Error: {notificationsError}</div>}
              {!notificationsLoading && !notificationsError && notifications.length === 0 && <div className="menu-item muted">No notifications</div>}
              {!notificationsLoading && !notificationsError && notifications.map(n => (
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
