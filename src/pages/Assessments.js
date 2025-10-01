import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

function Assessments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '1';
  const builderMode = searchParams.get('builder') === '1';
  const takeId = searchParams.get('take');
  const [builder, setBuilder] = useState(() => ({ name: `Job ${jobId} Assessment`, sections: [] }));
  const [previewKey, setPreviewKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);

  useEffect(() => {
    // Load catalog of assessments to display as ready-to-take list
    fetch(`/assessments`).then(r=>r.json()).then(setCatalog);
  }, []);

  useEffect(() => {
    if (!takeId) { setActiveAssessment(null); return; }
    // resolve active assessment when ?take=id is present
    const found = catalog.find(a => String(a.id) === String(takeId));
    if (found) setActiveAssessment(found);
  }, [takeId, catalog]);

  useEffect(() => {
    // Load existing assessment strictly if saved for this job. Otherwise keep empty.
    fetch(`/assessments/${jobId}`).then(r=>r.json()).then(list => {
      const existing = Array.isArray(list) ? list[0] : null;
      if (existing && existing.questions?.length) {
        setBuilder({ name: existing.name, sections: [{ id: 's1', title: 'Section 1', questions: existing.questions.slice() }] });
      } else {
        setBuilder({ name: `Job ${jobId} Assessment`, sections: [] });
      }
    });
  }, [jobId]);

  const addSection = () => {
    setBuilder(b => ({ ...b, sections: [...b.sections, { id: `s${Date.now()}`, title: `Section ${b.sections.length + 1}`, questions: [] }] }));
  };
  const addQuestion = (sectionId, type) => {
    setBuilder(b => ({
      ...b,
      sections: b.sections.map(s => s.id === sectionId ? { ...s, questions: [...s.questions, blankQuestion(type)] } : s)
    }));
  };

  const save = async () => {
    const payload = { jobId: Number(jobId), name: builder.name, questions: flattenQuestions(builder) };
    await fetch(`/assessments/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  };

  const onChangeQuestion = (sectionId, qid, patch) => {
    setBuilder(b => ({
      ...b,
      sections: b.sections.map(s => s.id === sectionId ? { ...s, questions: s.questions.map(q => q.id === qid ? { ...q, ...patch } : q) } : s)
    }));
  };

  const preview = () => setPreviewKey(k => k + 1);

  const openBuilder = () => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('builder', '1'); p.set('jobId', jobId); p.delete('take'); return p; });
  const closeBuilder = () => setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('builder'); return p; });
  const openTake = (id) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('take', String(id)); p.delete('builder'); return p; });
  const backToList = () => setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('take'); return p; });

  if (!builderMode && takeId) {
    // Fullscreen single assessment view
    const a = activeAssessment;
    if (!a) return <div className="content"><div className="muted">Loading...</div></div>;
    return (
      <div className="content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <h2 style={{ margin:0 }}>{a.name}</h2>
          <div style={{ display:'flex', gap:8 }}>
            <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={backToList}>Back</button>
          </div>
        </div>
        <div className="card">
          <AssessmentPreview hideHeader builder={{ name: a.name, sections: [{ id:'s', title:'', questions: (a.questions||[]).slice(0,10) }] }} jobId={jobId} submitting={submitting} setSubmitting={setSubmitting} showScore />
        </div>
      </div>
    );
  }

  if (!builderMode) {
    return (
      <div className="content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <h2 style={{ margin:0 }}>Assessments</h2>
          <div style={{ display:'flex', gap:8 }}>
            <AssignModal />
            <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={openBuilder}>Open Builder</button>
          </div>
        </div>
        <div className="card">
          <ul style={{ listStyle:'none', padding:0, margin:0 }}>
            {catalog.map(a => (
              <li key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight:600 }}>{a.name}</div>
                  <div className="muted" style={{ fontSize:12 }}>{(a.questions||[]).length} questions</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={() => openTake(a.id)}>Open</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="content" key={previewKey}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Assessment Builder</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="search" style={{ width: 280 }} value={builder.name} onChange={e => setBuilder(b => ({ ...b, name: e.target.value }))} />
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={addSection}>+ Section</button>
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={save}>Save</button>
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={preview}>Preview</button>
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={closeBuilder}>Close Builder</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          {builder.sections.map(section => (
            <div key={section.id} style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <input className="search" style={{ width: '60%' }} value={section.title} onChange={e => setBuilder(b => ({ ...b, sections: b.sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s) }))} />
                <div style={{ display:'flex', gap: 6 }}>
                  {['single','multi','short','long','number','file'].map(t => (
                    <button key={t} className="icon-btn" style={{ width:'auto', padding:'0 8px' }} onClick={() => addQuestion(section.id, t)}>{t}</button>
                  ))}
                </div>
              </div>
              <ul style={{ listStyle:'none', padding:0 }}>
                {section.questions.map(q => (
                  <li key={q.id} style={{ border:'1px solid #e5e7eb', borderRadius: 10, padding: 10, marginTop: 8 }}>
                    <input className="search" placeholder="Question text" value={q.text} onChange={e => onChangeQuestion(section.id, q.id, { text: e.target.value })} />
                    {['single','multi'].includes(q.type) && (
                      <>
                        <input className="search" placeholder="Comma-separated options" value={q.options.join(', ')} onChange={e => onChangeQuestion(section.id, q.id, { options: e.target.value.split(',').map(s=>s.trim()) })} />
                        {q.type === 'single' && (
                          <select className="search" value={q.answerIndex ?? ''} onChange={e => onChangeQuestion(section.id, q.id, { answerIndex: e.target.value === '' ? undefined : Number(e.target.value) })}>
                            <option value="">Correct option (optional)</option>
                            {q.options.map((opt, idx) => <option key={idx} value={idx}>{opt}</option>)}
                          </select>
                        )}
                        {q.type === 'multi' && (
                          <input className="search" placeholder="Correct options (comma separated labels)" value={(q.answerMulti||[]).join(', ')} onChange={e => onChangeQuestion(section.id, q.id, { answerMulti: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                        )}
                      </>
                    )}
                    {q.type === 'number' && (
                      <div style={{ display:'flex', gap:8 }}>
                        <input className="search" placeholder="Min" value={q.min ?? ''} onChange={e => onChangeQuestion(section.id, q.id, { min: num(e.target.value) })} />
                        <input className="search" placeholder="Max" value={q.max ?? ''} onChange={e => onChangeQuestion(section.id, q.id, { max: num(e.target.value) })} />
                      </div>
                    )}
                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <label><input type="checkbox" checked={!!q.required} onChange={e => onChangeQuestion(section.id, q.id, { required: e.target.checked })} /> Required</label>
                      <input className="search" placeholder="Show if: Qid=Value (e.g., q1=Yes)" value={q.showIf || ''} onChange={e => onChangeQuestion(section.id, q.id, { showIf: e.target.value })} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="card">
          <AssessmentPreview builder={builder} jobId={jobId} submitting={submitting} setSubmitting={setSubmitting} />
        </div>
      </div>
    </div>
  );
}

function AssessmentPreview({ builder, jobId, submitting, setSubmitting, showScore, hideHeader }) {
  const flat = useMemo(() => flattenQuestions(builder), [builder]);
  const [values, setValues] = useState({});
  const [score, setScore] = useState(null);
  const visible = (q) => {
    if (!q.showIf) return true;
    const [qid, val] = q.showIf.split('=');
    return String(values[qid?.trim()]) === String(val?.trim());
  };
  const set = (id, v) => setValues(s => ({ ...s, [id]: v }));
  const validate = () => {
    for (const q of flat) {
      if (!visible(q)) continue;
      if (q.required && (values[q.id] == null || values[q.id] === '' || (Array.isArray(values[q.id]) && values[q.id].length === 0))) return `Please answer: ${q.text}`;
      if (q.type === 'number') {
        const n = Number(values[q.id]);
        if (Number.isFinite(q.min) && n < q.min) return `${q.text}: must be >= ${q.min}`;
        if (Number.isFinite(q.max) && n > q.max) return `${q.text}: must be <= ${q.max}`;
      }
      if (q.maxLength && String(values[q.id] || '').length > q.maxLength) return `${q.text}: too long`;
    }
    return null;
  };
  const submit = async () => {
    const err = validate();
    if (err) { alert(err); return; }
    setSubmitting(true);
    await fetch(`/assessments/${jobId}/submit`, { method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values }) });
    setSubmitting(false);
    if (showScore) {
      // basic scoring: count single-choice correct answers using answerIndex
      let total = 0; let correct = 0;
      for (const q of flat) {
        if (q.type === 'single' && Array.isArray(q.options) && typeof q.answerIndex === 'number') {
          total += 1;
          if (values[q.id] === q.options[q.answerIndex]) correct += 1;
        }
      }
      setScore({ correct, total });
    } else {
      alert('Submitted');
    }
  };
  return (
    <div>
      {!hideHeader && <h3 style={{ marginTop:0 }}>Preview</h3>}
      {showScore && score && (
        <div style={{ marginBottom: 8 }}>
          <strong>Score:</strong> {score.correct} / {score.total}
        </div>
      )}
      {flat.map(q => visible(q) && (
        <div key={q.id} style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>{q.text}{q.required ? ' *' : ''}</div>
          {q.type === 'short' && <input className="search" value={values[q.id] || ''} onChange={e => set(q.id, e.target.value)} />}
          {q.type === 'long' && <textarea className="search" rows={4} value={values[q.id] || ''} onChange={e => set(q.id, e.target.value)} />}
          {q.type === 'number' && <input className="search" type="number" value={values[q.id] || ''} onChange={e => set(q.id, e.target.value)} />}
          {q.type === 'file' && <input className="search" type="file" onChange={e => set(q.id, e.target.files?.[0]?.name || '')} />}
          {q.type === 'single' && (
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              {q.options.map(o => (
                <label key={o}><input type="radio" name={q.id} checked={values[q.id]===o} onChange={()=>set(q.id,o)} /> {o}</label>
              ))}
            </div>
          )}
          {q.type === 'multi' && (
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              {q.options.map(o => {
                const arr = Array.isArray(values[q.id]) ? values[q.id] : [];
                const checked = arr.includes(o);
                return <label key={o}><input type="checkbox" checked={checked} onChange={(e)=>{
                  const next = e.target.checked ? [...arr, o] : arr.filter(x=>x!==o);
                  set(q.id, next);
                }} /> {o}</label>
              })}
            </div>
          )}
        </div>
      ))}
      <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
    </div>
  );
}

function blankQuestion(type) {
  const id = `q${Math.random().toString(36).slice(2,8)}`;
  const base = { id, type, text: '', required: false, options: [], min: undefined, max: undefined, maxLength: undefined, showIf: '' };
  if (type === 'single' || type === 'multi') base.options = ['Yes', 'No'];
  if (type === 'number') { base.min = 0; base.max = 100; }
  if (type === 'long') base.maxLength = 500;
  return base;
}
function flattenQuestions(builder) {
  return builder.sections.flatMap(s => s.questions);
}
const num = (v) => (v === '' ? undefined : Number(v));

function AssignModal() {
  const [open, setOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  useEffect(() => {
    if (!open) return;
    fetch('/assessments').then(r=>r.json()).then(setAssessments);
    fetch('/candidates?stage=applied&page=1&pageSize=500').then(r=>r.json()).then(p=> setCandidates(p.data || []));
  }, [open]);
  const assign = async () => {
    if (!selectedAssessment || !selectedCandidate) return;
    await fetch(`/assessments/${selectedAssessment}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: selectedCandidate }) });
    // Audit log entry
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      log.unshift({
        action: "Assessment Assigned",
        details: `Assessment ID ${selectedAssessment} assigned to Candidate ID ${selectedCandidate}`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    setOpen(false);
  };
  return (
    <div>
      <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={() => setOpen(true)}>Assign Assessment</button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={() => setOpen(false)}>
          <div className="card" style={{ width: 520, background: 'var(--bg)' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginTop:0 }}>Assign to Candidate</h3>
            <div style={{ display:'grid', gap:8 }}>
              <select className="search" value={selectedAssessment} onChange={e=>setSelectedAssessment(e.target.value)}>
                <option value="">Select assessment</option>
                {assessments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select className="search" value={selectedCandidate} onChange={e=>setSelectedCandidate(e.target.value)}>
                <option value="">Select applied candidate</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={() => setOpen(false)}>Cancel</button>
                <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={assign}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;
