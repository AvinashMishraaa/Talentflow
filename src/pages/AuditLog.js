import React from "react";

const getAuditLog = () => {
  try {
    return JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
  } catch {
    return [];
  }
};

function AuditLog() {
  const log = getAuditLog();
  return (
    <div className="content">
      <div className="card">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {log.length === 0 && <li className="muted">No actions recorded yet.</li>}
          {log.map((entry, idx) => (
            <li key={idx} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div><strong>{entry.action}</strong> <span className="muted">{entry.details}</span></div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(entry.timestamp).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AuditLog;
