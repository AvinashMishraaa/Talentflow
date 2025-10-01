import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("search") || "";
    setSearch(s);
  }, [location.search]);

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);
    params.set("page", String(page));
    params.set("pageSize", "50");
    const res = await fetch(`/candidates?${params.toString()}`);
    const pageData = await res.json();
    setCandidates(pageData.data);
  };

  useEffect(() => { load(); }, [search, stage, page]);
  useEffect(() => { const id = setTimeout(load, 300); return () => clearTimeout(id); }, [search, stage, page]);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map(s => [s, []]));
    for (const c of candidates) map[c.stage]?.push(c);
    return map;
  }, [candidates]);

  const move = async (id, stage) => {
    await fetch(`/candidates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) });
    // Audit log entry
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      log.unshift({
        action: "Candidate Stage Changed",
        details: `Candidate ID ${id} moved to stage '${stage}'`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    load();
  };

  const visibleStages = stage ? [stage] : STAGES;

  return (
    <div className="content" ref={containerRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Candidates</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="search" style={{ width: 160 }} value={stage} onChange={e => { setStage(e.target.value); setPage(1); }}>
            <option value="">All stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="search" placeholder="Search candidates" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 320 }} />
        </div>
      </div>

      {visibleStages.length === 1 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {visibleStages.map(stage => (
            <div className="card" key={stage} style={{ minHeight: 300 }}>
              <div style={{ fontWeight: 700, textTransform: "capitalize", marginBottom: 8 }}>{stage} ({byStage[stage]?.length || 0})</div>
              <VirtualizedCandidateList
                scrollParentRef={containerRef}
                items={byStage[stage] || []}
                renderItem={(c) => (
                <li key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10, background: "var(--bg)", height: 88, boxSizing: 'border-box' }} draggable onDragStart={(e) => e.dataTransfer.setData('id', String(c.id))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => move(Number(e.dataTransfer.getData('id')), stage)}>
                    <div style={{ fontWeight: 600 }}><Link to={`/candidates/${c.id}`}>{c.name}</Link></div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.email}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {STAGES.filter(s => s !== stage).map(s => (
                        <button key={s} className="icon-btn" style={{ width: "auto", padding: "0 8px" }} onClick={() => move(c.id, s)}>{s}</button>
                      ))}
                    </div>
                  </li>
                )}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${visibleStages.length}, 1fr)`, gap: 12 }}>
          {visibleStages.map(stage => (
            <div className="card" key={stage} style={{ minHeight: 300 }}>
              <div style={{ fontWeight: 700, textTransform: "capitalize", marginBottom: 8 }}>{stage} ({byStage[stage]?.length || 0})</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {(byStage[stage] || []).map(c => (
                  <li key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10, background: "var(--bg)" }} draggable onDragStart={(e) => e.dataTransfer.setData('id', String(c.id))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => move(Number(e.dataTransfer.getData('id')), stage)}>
                    <div style={{ fontWeight: 600 }}><Link to={`/candidates/${c.id}`}>{c.name}</Link></div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.email}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {STAGES.filter(s => s !== stage).map(s => (
                        <button key={s} className="icon-btn" style={{ width: "auto", padding: "0 8px" }} onClick={() => move(c.id, s)}>{s}</button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        <button className="icon-btn" style={{ width: "auto", padding: "0 10px" }} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <button className="icon-btn" style={{ width: "auto", padding: "0 10px" }} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
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
  const mentionOptions = ["@Alice", "@Bob", "@Carol", "@David", "@Eve"];
  useEffect(() => {
    fetch(`/candidates?search=&page=1&pageSize=1&id=${id}`);
    fetch(`/candidates`).then(r => r.json()).then(p => {
      const all = Array.isArray(p.data) ? p.data : p; // compatibility
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
    }
  };
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
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <input className="search" placeholder="Write a note with @mentions" value={text} onChange={e=>setText(e.target.value)} list="mentions" />
          <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={addNote}>Add</button>
          <datalist id="mentions">
            {mentionOptions.map(o => <option key={o} value={o} />)}
          </datalist>
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
  const ITEM_HEIGHT = 96; // include margins
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
