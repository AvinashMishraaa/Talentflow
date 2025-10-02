import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    fetch(`/jobs/${jobId}`)
      .then(r => r.json())
      .then(setJob)
      .catch(() => navigate('/jobs'));
    
    fetch(`/candidates?jobId=${jobId}`)
      .then(r => r.json())
      .then(p => setCandidates(p.data || []));
    
    fetch(`/assessments?jobId=${jobId}`)
      .then(r => r.json())
      .then(setAssessments);
  }, [jobId, navigate]);

  if (!job) return <div className="content"><div className="muted">Loading...</div></div>;

  return (
    <div className="content">
      <button 
        onClick={() => navigate('/jobs')}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 16 }}
      >
        ← Back to Jobs
      </button>
      
      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 8px 0' }}>{job.title}</h1>
        <p className="muted" style={{ margin: '0 0 16px 0' }}>{job.description}</p>
        
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <strong>Status:</strong> <span style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              background: job.status === 'active' ? '#dcfce7' : '#f3f4f6',
              color: job.status === 'active' ? '#166534' : '#6b7280',
              fontSize: '12px'
            }}>{job.status}</span>
          </div>
          <div><strong>Location:</strong> {job.location}</div>
          <div><strong>Department:</strong> {job.department}</div>
        </div>
        
        {job.skills && (
          <div>
            <strong>Required Skills:</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {job.skills.map((skill, index) => (
                <span key={index} style={{
                  padding: '4px 8px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 16px 0' }}>Candidates ({candidates.length})</h3>
        {candidates.length === 0 ? (
          <p className="muted">No candidates have applied for this position yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{ 
                padding: 12, 
                border: '1px solid var(--border)', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    <Link 
                      to={`/candidates/${candidate.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {candidate.name}
                    </Link>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>{candidate.email}</div>
                </div>
                <div style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  fontSize: 12
                }}>
                  {candidate.stage}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Available Assessments ({assessments.length})</h3>
          <Link 
            to={`/assessments?jobId=${jobId}&builder=1`}
            style={{ 
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            + Create Assessment
          </Link>
        </div>
        {assessments.length === 0 ? (
          <p className="muted">No assessments available for this position yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {assessments.map(assessment => (
              <div key={assessment.id} style={{ 
                padding: 12, 
                border: '1px solid var(--border)', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    <Link 
                      to={`/assessments?jobId=${jobId}&preview=${assessment.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {assessment.name}
                    </Link>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {assessment.questions?.length || 0} questions
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  fontSize: 12
                }}>
                  {assessment.level || 'General'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetail;
