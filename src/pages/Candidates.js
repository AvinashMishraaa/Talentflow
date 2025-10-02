import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

const getStageTitle = (stage, count) => {
  const stageInfo = {
    applied: { title: "📝 New Applications", subtitle: "Recently submitted candidates" },
    screen: { title: "📞 Initial Screening", subtitle: "Phone/video interviews in progress" },
    tech: { title: "💻 Technical Assessment", subtitle: "Coding challenges and technical interviews" },
    offer: { title: "🤝 Offer Extended", subtitle: "Pending candidate acceptance" },
    hired: { title: "✅ Successfully Hired", subtitle: "Onboarded team members" },
    rejected: { title: "❌ Not Selected", subtitle: "Candidates not moving forward" }
  };
  
  const info = stageInfo[stage] || { title: stage, subtitle: "" };
  return {
    title: `${info.title} (${count})`,
    subtitle: info.subtitle
  };
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getButtonStyle = (stage) => {
  const styles = {
    applied: { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
    screen: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    tech: { backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc' },
    offer: { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' },
    hired: { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
    rejected: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
  };
  return styles[stage] || { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
};

const getAvailableStages = (currentStage) => {
  const stageFlow = {
    applied: ['screen', 'rejected'],
    screen: ['tech', 'rejected'],
    tech: ['offer', 'rejected'],
    offer: ['hired', 'rejected'],
    hired: [],
    rejected: []
  };
  return stageFlow[currentStage] || [];
};

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("search") || "";
    setSearch(s);
  }, [location.search]);

  useEffect(() => {
    fetch('/jobs?page=1&pageSize=100').then(r=>r.json()).then(p=> setJobs(p.data || []));
  }, []);

  const load = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);
    if (jobFilter) params.set("jobId", jobFilter);
    params.set("pageSize", "2000"); 
    const res = await fetch(`/candidates?${params.toString()}`);
    const pageData = await res.json();
    setCandidates(pageData.data);
  }, [search, stage, jobFilter]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { const id = setTimeout(load, 300); return () => clearTimeout(id); }, [load]);

  const byStage = React.useMemo(() => {
    const map = Object.fromEntries(STAGES.map(s => [s, []]));
    for (const c of candidates) map[c.stage]?.push(c);
    return map;
  }, [candidates]);

  const move = async (id, stage, targetIndex = null) => {
    if (targetIndex !== null) {
      setCandidates(prevCandidates => {
        const newCandidates = [...prevCandidates];
        const candidateIndex = newCandidates.findIndex(c => c.id === id);
        
        if (candidateIndex !== -1) {
          const [movedCandidate] = newCandidates.splice(candidateIndex, 1);
          
          movedCandidate.stage = stage;
          
          const targetStageCandidates = newCandidates.filter(c => c.stage === stage);
          const clampedIndex = Math.min(targetIndex, targetStageCandidates.length);
          
          let insertPosition = newCandidates.length;
          let currentStageCount = 0;
          
          for (let i = 0; i < newCandidates.length; i++) {
            if (newCandidates[i].stage === stage) {
              if (currentStageCount === clampedIndex) {
                insertPosition = i;
                break;
              }
              currentStageCount++;
            }
          }
          
          newCandidates.splice(insertPosition, 0, movedCandidate);
        }
        
        return newCandidates;
      });
    }
    
    await fetch(`/candidates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) });
    
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      log.unshift({
        action: "Candidate Stage Changed",
        details: `Candidate ID ${id} moved to stage '${stage}'`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    
    if (targetIndex === null) {
      load();
    }
  };

  const reorderCandidates = (stageKey, fromIndex, toIndex) => {
    const stageCandidates = [...byStage[stageKey]];
    const [movedCandidate] = stageCandidates.splice(fromIndex, 1);
    stageCandidates.splice(toIndex, 0, movedCandidate);
    
    setCandidates(prevCandidates => {
      const newCandidates = [...prevCandidates];
      const stageStartIndex = newCandidates.findIndex(c => c.stage === stageKey);
      const stageCandidatesInOriginal = newCandidates.filter(c => c.stage === stageKey);
      
      stageCandidatesInOriginal.forEach(c => {
        const index = newCandidates.findIndex(candidate => candidate.id === c.id);
        if (index !== -1) newCandidates.splice(index, 1);
      });
      
      stageCandidates.forEach((candidate, index) => {
        newCandidates.splice(stageStartIndex + index, 0, candidate);
      });
      
      return newCandidates;
    });
  };

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedCandidate(null);
    setDragOverIndex(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageKey, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStage, targetIndex) => {
    e.preventDefault();
    
    if (!draggedCandidate) return;
    
    const sourceStage = draggedCandidate.stage;
    const sourceIndex = byStage[sourceStage].findIndex(c => c.id === draggedCandidate.id);
    
    if (sourceStage === targetStage) {
      if (sourceIndex !== targetIndex) {
        reorderCandidates(targetStage, sourceIndex, targetIndex);
      }
    } else {
      move(draggedCandidate.id, targetStage, targetIndex);
    }
    
    setDraggedCandidate(null);
    setDragOverIndex(null);
    setDragOverStage(null);
  };

  const visibleStages = stage ? [stage] : STAGES;

  return (
    <div className="content" ref={containerRef}>
      <div className="candidates-filters" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 12,
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        gap: window.innerWidth <= 768 ? 8 : 0
      }}>
        <div style={{ 
          display: "flex", 
          gap: 8,
          width: window.innerWidth <= 768 ? '100%' : 'auto',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
        }}>
          <select 
            className="search" 
            style={{ width: window.innerWidth <= 768 ? '100%' : 160 }} 
            value={stage} 
            onChange={e => setStage(e.target.value)}
          >
            <option value="">All stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="search" 
            style={{ width: window.innerWidth <= 768 ? '100%' : 180 }} 
            value={jobFilter} 
            onChange={e => setJobFilter(e.target.value)}
          >
            <option value="">All job roles</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <input 
            className="search" 
            placeholder="Search by name or email" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: window.innerWidth <= 768 ? '100%' : 280 }} 
          />
        </div>
      </div>

      {visibleStages.length === 1 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {visibleStages.map(stage => (
            <div className="card" key={stage} style={{ minHeight: 300 }}>
              <div style={{ marginBottom: 12, minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, lineHeight: '24px', minHeight: 60, display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
                  {getStageTitle(stage, byStage[stage]?.length || 0).title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', lineHeight: '16px', minHeight: 20 }}>
                  {getStageTitle(stage, byStage[stage]?.length || 0).subtitle}
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, alignItems: "stretch", minHeight: 200 }}>
                {(byStage[stage] || []).map((c, index) => (
                  <React.Fragment key={c.id}>
                    {dragOverStage === stage && dragOverIndex === index && (
                      <div style={{
                        height: 4,
                        background: '#3b82f6',
                        borderRadius: 2,
                        margin: '4px 0'
                      }} />
                    )}
                    <li 
                      className="candidate-card"
                      style={{ 
                        border: draggedCandidate?.id === c.id ? "2px dashed #3b82f6" : "1px solid var(--border)", 
                        borderRadius: 10, 
                        padding: window.innerWidth <= 768 ? 12 : 10, 
                        background: "var(--bg)", 
                        height: window.innerWidth <= 768 ? 'auto' : 120,
                        minHeight: window.innerWidth <= 768 ? 100 : 120,
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        boxSizing: 'border-box',
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        touchAction: 'manipulation'
                      }} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, c)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, stage, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage, index)}
                    >
                      <div className="candidate-info" style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? 8 : 10, flex: 1 }}>
                        <div 
                          className="candidate-avatar"
                          style={{ 
                            width: window.innerWidth <= 768 ? 32 : 40, 
                            height: window.innerWidth <= 768 ? 32 : 40, 
                            borderRadius: '50%', 
                            backgroundColor: getAvatarColor(c.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 768 ? 12 : 14
                          }}
                        >
                          {getInitials(c.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div 
                            className="candidate-name"
                            style={{ 
                              fontWeight: 600,
                              fontSize: window.innerWidth <= 768 ? 14 : 16,
                              lineHeight: 1.3
                            }}
                          >
                            <Link to={`/candidates/${c.id}`}>{c.name}</Link>
                          </div>
                          <div 
                            className="candidate-email muted" 
                            style={{ 
                              fontSize: window.innerWidth <= 768 ? 11 : 12 
                            }}
                          >
                            {c.email}
                          </div>
                          <div 
                            className="candidate-job"
                            style={{ 
                              fontSize: window.innerWidth <= 768 ? 10 : 11, 
                              color: '#5b5bd6', 
                              fontWeight: 500, 
                              marginTop: 2 
                            }}
                          >
                            {c.jobTitle || c.appliedFor || 'No Job Assigned'}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="candidate-actions"
                        style={{ 
                          display: "flex", 
                          gap: window.innerWidth <= 768 ? 4 : 6, 
                          flexWrap: 'wrap', 
                          marginTop: 8 
                        }}
                      >
                        {getAvailableStages(stage).map(s => (
                          <button 
                            key={s} 
                            onClick={() => move(c.id, s)}
                            style={{
                              ...getButtonStyle(s),
                              padding: window.innerWidth <= 768 ? '4px 6px' : '4px 8px',
                              borderRadius: '4px',
                              fontSize: window.innerWidth <= 768 ? 10 : 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                              minWidth: window.innerWidth <= 768 ? 60 : 'auto'
                            }}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </li>
                    {dragOverStage === stage && dragOverIndex === index + 1 && (
                      <div style={{
                        height: 4,
                        background: '#3b82f6',
                        borderRadius: 2,
                        margin: '4px 0'
                      }} />
                    )}
                  </React.Fragment>
                ))}
                <div 
                  style={{ minHeight: 20 }}
                  onDragOver={(e) => handleDragOver(e, stage, byStage[stage]?.length || 0)}
                  onDrop={(e) => handleDrop(e, stage, byStage[stage]?.length || 0)}
                />
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="candidates-grid"
          style={{ 
            display: "grid", 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : `repeat(${visibleStages.length}, 1fr)`, 
            gap: window.innerWidth <= 768 ? 8 : 12,
            overflowX: window.innerWidth <= 768 ? 'auto' : 'visible'
          }}
        >
          {visibleStages.map(stage => (
            <div className="card candidate-stage-card" key={stage} style={{ minHeight: window.innerWidth <= 768 ? 200 : 300 }}>
              <div style={{ marginBottom: 12, minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, lineHeight: '24px', minHeight: 60, display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
                  {getStageTitle(stage, byStage[stage]?.length || 0).title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', lineHeight: '16px', minHeight: 20 }}>
                  {getStageTitle(stage, byStage[stage]?.length || 0).subtitle}
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8, alignItems: "stretch", minHeight: 200 }}>
                {(byStage[stage] || []).map((c, index) => (
                  <React.Fragment key={c.id}>
                    {dragOverStage === stage && dragOverIndex === index && (
                      <div style={{
                        height: 4,
                        background: '#3b82f6',
                        borderRadius: 2,
                        margin: '4px 0'
                      }} />
                    )}
                    <li 
                      style={{ 
                        border: draggedCandidate?.id === c.id ? "2px dashed #3b82f6" : "1px solid var(--border)", 
                        borderRadius: 10, 
                        padding: 10, 
                        background: "var(--bg)", 
                        height: 120, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        boxSizing: 'border-box',
                        cursor: 'grab',
                        transition: 'all 0.2s ease'
                      }} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, c)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, stage, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage, index)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          backgroundColor: getAvatarColor(c.name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}><Link to={`/candidates/${c.id}`}>{c.name}</Link></div>
                        <div className="muted" style={{ fontSize: 12 }}>{c.email}</div>
                        <div style={{ fontSize: 11, color: '#5b5bd6', fontWeight: 500, marginTop: 2 }}>
                          {c.jobTitle || c.appliedFor || 'No Job Assigned'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {getAvailableStages(stage).map(s => (
                        <button 
                          key={s} 
                          onClick={() => move(c.id, s)}
                          style={{
                            ...getButtonStyle(s),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </li>
                  {dragOverStage === stage && dragOverIndex === index + 1 && (
                    <div style={{
                      height: 4,
                      background: '#3b82f6',
                      borderRadius: 2,
                      margin: '4px 0'
                    }} />
                  )}
                </React.Fragment>
              ))}
              <div 
                style={{ minHeight: 20 }}
                onDragOver={(e) => handleDragOver(e, stage, byStage[stage]?.length || 0)}
                onDrop={(e) => handleDrop(e, stage, byStage[stage]?.length || 0)}
              />
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
);
}

export default Candidates;

export function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = React.useRef(null);
  const mentionOptions = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Henry"];
  useEffect(() => {
    fetch(`/candidates?search=&page=1&pageSize=1&id=${id}`);
    fetch(`/candidates`).then(r => r.json()).then(p => {
      const all = Array.isArray(p.data) ? p.data : p;
      const found = all.find(c => String(c.id) === String(id));
      setCandidate(found || null);
    });
    fetch(`/candidates/${id}/timeline`).then(r => r.json()).then(setTimeline);
    fetch(`/candidates/${id}/notes`).then(r => r.json()).then(setNotes);
  }, [id]);
  const addNote = async () => {
    if (!text.trim()) return;
    const res = await fetch(`/candidates/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    if (res.ok) {
      const note = await res.json();
      setNotes(n => [note, ...n]);
      setText("");
      setShowSuggestions(false);
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
        const filtered = mentionOptions.filter(name => 
          name.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        
        if (filtered.length > 0) {
          setFilteredSuggestions(filtered);
          setActiveSuggestion(0);
          setShowSuggestions(true);
          
          const input = e.target;
          const rect = input.getBoundingClientRect();
          setSuggestionPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX
          });
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (name) => {
    const cursorPos = inputRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newText = textBeforeCursor.slice(0, lastAtIndex) + `@${name} ` + textAfterCursor;
      setText(newText);
      setShowSuggestions(false);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = lastAtIndex + name.length + 2;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 10);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredSuggestions[activeSuggestion]) {
          insertMention(filteredSuggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!candidate) return <div className="content"><div className="muted">Loading...</div></div>;
  return (
    <div className="content">
      <h2 style={{ marginTop: 0 }}>{candidate.name}</h2>
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="muted">{candidate.email}</div>
        <Assignments candidateId={id} />
        <div style={{ marginTop: 12, fontWeight: 700 }}>Timeline</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {timeline.map(t => (
            <li key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              Moved from <strong>{t.from || '—'}</strong> to <strong>{t.to}</strong> on {new Date(t.at).toLocaleString()}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12, fontWeight: 700 }}>Notes</div>
        <div style={{ display: 'flex', gap: 8, margin: '8px 0', position: 'relative' }}>
          <input 
            ref={inputRef}
            className="search" 
            placeholder="Write a note with @mentions" 
            value={text} 
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={addNote}>Add</button>
          
          {/* Custom suggestions dropdown */}
          {showSuggestions && (
            <div 
              style={{
                position: 'fixed',
                top: suggestionPosition.top,
                left: suggestionPosition.left,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '150px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {filteredSuggestions.map((name, index) => (
                <div
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(name);
                  }}
                  onClick={() => insertMention(name)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: index === activeSuggestion ? '#f3f4f6' : 'transparent',
                    borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                  onMouseEnter={() => setActiveSuggestion(index)}
                >
                  @{name}
                </div>
              ))}
            </div>
          )}
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notes.map(n => (
            <li key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(n.at).toLocaleString()}</div>
              <div dangerouslySetInnerHTML={{ __html: n.text.replace(/@([A-Za-z]+)/g, '<strong>@$1</strong>') }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function VirtualizedCandidateList({ scrollParentRef, items, renderItem }) {
  const ITEM_HEIGHT = 128;
  const [viewport, setViewport] = useState({ top: 0, height: 600 });

  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;
    const onScroll = () => setViewport({ top: el.scrollTop, height: el.clientHeight });
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollParentRef]);

  const startIndex = Math.max(0, Math.floor(viewport.top / ITEM_HEIGHT) - 5);
  const visibleCount = Math.ceil(viewport.height / ITEM_HEIGHT) + 10;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const topPad = startIndex * ITEM_HEIGHT;
  const bottomPad = (items.length - endIndex) * ITEM_HEIGHT;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {topPad > 0 && <li style={{ height: topPad }} />}
      {items.slice(startIndex, endIndex).map(item => renderItem(item))}
      {bottomPad > 0 && <li style={{ height: bottomPad }} />}
    </ul>
  );
}

function Assignments({ candidateId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch(`/candidates/${candidateId}/assignments`).then(r=>r.json()).then(setItems);
  }, [candidateId]);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700 }}>Assigned Assessments</div>
      <ul style={{ listStyle:'none', padding: 0 }}>
        {items.map(x => (
          <li key={`${x.assessmentId}-${x.at}`} className="muted" style={{ padding:'4px 0' }}>{x.name} — {new Date(x.at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
