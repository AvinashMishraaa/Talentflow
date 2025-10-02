import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch(`/candidates/${id}`)
      .then(r => r.json())
      .then(setCandidate)
      .catch(() => navigate('/candidates'));
    
    fetch(`/candidates/${id}/assignments`)
      .then(r => r.json())
      .then(setAssignments);
  }, [id, navigate]);

  if (!candidate) return <div className="content"><div className="muted">Loading...</div></div>;

  const updateStage = async (newStage) => {
    try {
      await fetch(`/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      setCandidate(prev => ({ ...prev, stage: newStage }));
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  return (
    <div className="content">
      <button 
        onClick={() => navigate('/candidates')}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 16 }}
      >
        ← Back to Candidates
      </button>
      
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0' }}>{candidate.name}</h1>
            <p className="muted" style={{ margin: '0 0 8px 0' }}>{candidate.email}</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{candidate.jobTitle}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Current Stage</div>
            <select 
              value={candidate.stage} 
              onChange={(e) => updateStage(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Phone</div>
            <div>{candidate.phone || 'Not provided'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Experience</div>
            <div>{candidate.experience || 'Not specified'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Applied Date</div>
            <div>{candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : 'Unknown'}</div>
          </div>
        </div>
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Skills</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {candidate.skills.map((skill, index) => (
              <span key={index} style={{
                padding: '6px 12px',
                background: '#e0f2fe',
                color: '#0284c7',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ margin: '0 0 16px 0' }}>Assessment History</h3>
        {assignments.length === 0 ? (
          <p className="muted">No assessments assigned yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {assignments.map((assignment, index) => (
              <div key={index} style={{ 
                padding: 12, 
                border: '1px solid var(--border)', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{assignment.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Assigned: {new Date(assignment.at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  fontSize: 12
                }}>
                  Assigned
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateProfile;
