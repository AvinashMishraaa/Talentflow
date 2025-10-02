import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dragFromOrder = useRef(null);
  const [error, setError] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("pageSize", "10");
    fetch(`/jobs?${params.toString()}`)
      .then(res => res.json())
      .then(data => { setJobs(data.data || []); setTotalPages(data.totalPages || 1); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  const activeCount = useMemo(() => jobs.filter(j => j.status === "active").length, [jobs]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", status: "active", tags: "" });

  const openCreate = () => { setEditing(null); setForm({ title: "", status: "active", tags: "" }); setShowModal(true); };
  const openEdit = (job) => { setEditing(job); setForm({ title: job.title, status: job.status, tags: (job.tags||[]).join(', ') }); setShowModal(true); };

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const validateUniqueSlug = (title, excludeId) => {
    const slug = slugify(title);
    return !jobs.some(j => slugify(j.title) === slug && j.id !== excludeId);
  };

  const saveJob = async () => {
    if (!form.title) { alert('Title required'); return; }
    if (!validateUniqueSlug(form.title, editing?.id)) { alert('Title slug must be unique'); return; }
    const payload = { title: form.title, status: form.status, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
    // server-side slug validation
    const slug = form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const check = await fetch(`/jobs/slug/${slug}?excludeId=${editing?.id||''}`);
    const { exists } = await check.json();
    if (exists) { alert('Title slug already exists'); return; }
    const res = await fetch(editing ? `/jobs/${editing.id}` : "/jobs", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { alert('Server error, try again'); return; }
    // Audit log entry
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      log.unshift({
        action: editing ? "Job Edited" : "Job Created",
        details: `Job '${form.title}' (${editing ? 'ID ' + editing.id : 'new'})`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    setShowModal(false);
    load();
  };

  const archiveJob = async (id) => {
    await fetch(`/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived" }) });
    // Audit log entry
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      log.unshift({
        action: "Job Archived",
        details: `Job ID ${id} archived`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    load();
  };

  const beginDrag = (order, job) => (e) => { 
    dragFromOrder.current = order; 
    setDraggedItem(job.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    dragFromOrder.current = null;
  };

  return (
    <div className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div></div>
        <button onClick={openCreate} className="icon-btn" style={{ width: "auto", padding: "0 12px" }}>+ New Job</button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs" className="search" style={{ flex: 2 }} />
          <select value={status} onChange={e => setStatus(e.target.value)} className="search" style={{ flex: 1 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>{activeCount} active • {jobs.length} shown</div>
      </div>

      <div className="card">
        {loading ? (
          <div className="muted">Loading...</div>
        ) : (
          <ul 
            style={{ listStyle: "none", padding: 0, margin: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              // Find the job being dragged over
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const jobElements = Array.from(e.currentTarget.children);
              let targetJob = null;
              
              for (let i = 0; i < jobElements.length; i++) {
                const jobRect = jobElements[i].getBoundingClientRect();
                const jobY = jobRect.top - rect.top + jobRect.height / 2;
                if (y < jobY) {
                  const jobId = parseInt(jobElements[i].getAttribute('data-job-id'));
                  targetJob = jobs.find(j => j.id === jobId);
                  break;
                }
              }
              
              if (targetJob) {
                setDragOverItem(targetJob.id);
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDragOverItem(null);
              }
            }}
          >
            {jobs.sort((a,b)=>a.order-b.order).map((job, index) => {
              const isDragging = draggedItem === job.id;
              const isDragOver = dragOverItem === job.id;
              return (
              <li
                key={job.id}
                data-job-id={job.id}
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "10px 0", 
                  borderBottom: "1px solid #f1f5f9",
                  opacity: isDragging ? 0.5 : 1,
                  backgroundColor: isDragOver ? '#f0f9ff' : 'transparent',
                  borderLeft: isDragOver ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div 
                    draggable 
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', job.id.toString());
                      beginDrag(job.order, job)(e);
                    }} 
                    onDragEnd={handleDragEnd}
                    style={{ 
                      cursor: 'move', 
                      padding: '4px', 
                      color: '#9ca3af',
                      fontSize: '12px',
                      userSelect: 'none'
                    }}
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      <Link 
                        to={`/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {job.title}
                      </Link>
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{job.tags?.join(", ")}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="muted" style={{ textTransform: "capitalize" }}>{job.status}</span>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(job); }} className="icon-btn" style={{ width: "auto", padding: "0 10px" }}>Edit</button>
                  {job.status === "active" ? (
                    <button onClick={(e) => { e.stopPropagation(); archiveJob(job.id); }} className="icon-btn" style={{ width: "auto", padding: "0 10px" }}>Archive</button>
                  ) : (
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/jobs/${job.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'active' }) });
                      // Audit log entry for unarchive
                      try {
                        const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
                        log.unshift({
                          action: "Job Unarchived",
                          details: `Job '${job.title}' (ID ${job.id}) unarchived`,
                          timestamp: Date.now()
                        });
                        localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
                      } catch {}
                      load();
                    }} className="icon-btn" style={{ width: "auto", padding: "0 10px" }}>Unarchive</button>
                  )}
                </div>
              </li>
            )})}
          </ul>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div className="muted">{error}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" style={{ width: "auto", padding: "0 10px" }} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <div className="muted" style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</div>
          <button className="icon-btn" style={{ width: "auto", padding: "0 10px" }} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: 420, background: 'var(--bg)' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ margin:'0 0 8px 0' }}>{editing ? 'Edit Job' : 'Create Job'}</h3>
            <div style={{ display:'grid', gap:8 }}>
              <input className="search" placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} />
              <select className="search" value={form.status} onChange={e=>setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <input className="search" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({ ...form, tags: e.target.value })} />
              <div className="muted">Slug: {form.title ? form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') : '—'}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
              <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={saveJob}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;

export function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", status: "active", tags: "" });
  useEffect(() => {
    fetch(`/jobs?page=1&pageSize=9999`).then(r=>r.json()).then(p=>{
      const all = p.data || [];
      setJob(all.find(j=>String(j.id)===String(jobId))||null);
    });
  }, [jobId]);
  if (!job) return <div className="content"><div className="muted">Loading...</div></div>;
  const openEdit = () => {
    setForm({ title: job.title, status: job.status, tags: (job.tags||[]).join(', ') });
    setShowModal(true);
  };
  const saveJob = async () => {
    if (!form.title) { alert('Title required'); return; }
    const payload = { title: form.title, status: form.status, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
    const res = await fetch(`/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { alert('Server error, try again'); return; }
    setShowModal(false);
    fetch(`/jobs?page=1&pageSize=9999`).then(r=>r.json()).then(p=>{
      const all = p.data || [];
      setJob(all.find(j=>String(j.id)===String(jobId))||null);
    });
  };
  return (
    <div className="content">
      <h2>{job.title}</h2>
      <div className="card" style={{ maxWidth: 600 }}>
        <div>Status: <strong>{job.status}</strong></div>
        <div className="muted">Tags: {job.tags?.join(', ') || '—'}</div>
        <div className="muted">Order: {job.order}</div>
        <button className="icon-btn" style={{ marginTop: 16 }} onClick={openEdit}>Edit</button>
      </div>
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: 420, background: 'var(--bg)' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ margin:'0 0 8px 0' }}>Edit Job</h3>
            <div style={{ display:'grid', gap:8 }}>
              <input className="search" placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} />
              <select className="search" value={form.status} onChange={e=>setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <input className="search" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({ ...form, tags: e.target.value })} />
              <div className="muted">Slug: {form.title ? form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') : '—'}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
              <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={saveJob}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
