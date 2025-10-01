import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="content dashboard">
      <section className="hero">
        <div className="hero-text">
          <h1>Everything You Need To Hire Great Talent</h1>
          <p className="muted">Powerful features designed to make your hiring process efficient and effective.</p>
        </div>
      </section>

      <section className="feature-grid">
        <Link to="/jobs" className="feature feature-link">
          <div className="feature-icon jobs">🧰</div>
          <div className="feature-body">
            <h2>Jobs Management</h2>
            <p className="muted">Create, manage, and track job postings with advanced filtering and search capabilities.</p>
          </div>
          <div className="feature-arrow">→</div>
        </Link>
        <Link to="/candidates" className="feature feature-link">
          <div className="feature-icon candidates">👥</div>
          <div className="feature-body">
            <h2>Candidate Pipeline</h2>
            <p className="muted">Manage 1000+ candidates with virtualized lists and a Kanban board for stage tracking.</p>
          </div>
          <div className="feature-arrow">→</div>
        </Link>
        <Link to="/assessments" className="feature feature-link">
          <div className="feature-icon assessments">🧪</div>
          <div className="feature-body">
            <h2>Assessment Builder</h2>
            <p className="muted">Create comprehensive assessments with multiple question types and live preview.</p>
          </div>
          <div className="feature-arrow">→</div>
        </Link>
        <Link to="/audit-log" className="feature feature-link">
          <div className="feature-icon" style={{background: 'linear-gradient(135deg, #fbbf24 20%, #f3f6ff 80%)', fontSize: 32}}>📜</div>
          <div className="feature-body">
            <h2>Audit Log</h2>
            <p className="muted">View a history of all important actions for transparency and accountability.</p>
          </div>
          <div className="feature-arrow">→</div>
        </Link>
      </section>

      <section className="contact-banner">
        <div className="contact-col left"><strong>Contact Us</strong></div>
        <div className="contact-col center">📞 +91 9876543210</div>
        <div className="contact-col right">✉️ talentflow@test.com</div>
      </section>
    </div>
  );
}

export default Dashboard;
