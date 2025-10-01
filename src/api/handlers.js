import { http, HttpResponse, delay } from "msw";
import localforage from "localforage";

// Enhanced persistence helpers with IndexedDB fallback
const load = async (key, fallback) => {
  try {
    // First try localStorage (fast synchronous access)
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    
    // Fallback to IndexedDB if localStorage is empty
    const indexedValue = await localforage.getItem(key);
    if (indexedValue !== null) {
      // Restore to localStorage for future fast access
      localStorage.setItem(key, JSON.stringify(indexedValue));
      return indexedValue;
    }
    
    return fallback;
  } catch {
    return fallback;
  }
};

const save = async (key, value) => {
  try {
    // Primary storage: localStorage for fast access
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  
  try {
    // Write-through to IndexedDB for persistence
    await localforage.setItem(key, value);
  } catch {}
};

// Synchronous version for compatibility with existing code
const loadSync = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// Seed data generation
// const JOB_STATUSES = ["active", "archived"]; // Unused, commented out to fix lint error
const CANDIDATE_STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function generateJobs(count = 25) {
  const titles = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Engineer",
    "Product Designer",
    "DevOps Engineer",
    "QA Engineer",
    "Data Scientist",
    "Mobile Developer",
    "Project Manager",
    "Technical Writer",
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `${titles[i % titles.length]} ${i + 1}`,
    status: i % 7 === 0 ? "archived" : "active",
    tags: ["Remote", i % 3 === 0 ? "Urgent" : ""].filter(Boolean),
    order: i + 1,
    createdAt: Date.now() - i * 86400000,
  }));
}

function generateCandidates(jobs, count = 1000) {
  const first = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack", "Kathy", "Leo", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Ruth", "Sam", "Tina", "Uma", "Viktor", "Wendy", "Xavier", "Yara", "Zack"];
  const last = ["Johnson", "Smith", "Brown", "Lee", "Taylor", "Davis", "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright"]; 
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    name: `${first[i % first.length]} ${last[i % last.length]}`,
    email: `user${i + 1}@example.com`,
    stage: CANDIDATE_STAGES[i % CANDIDATE_STAGES.length],
    jobId: jobs[(i * 3) % jobs.length].id,
    createdAt: Date.now() - i * 43200000,
  }));
}

function generateAssessments() {
  const topics = ["React", "HTML", "CSS", "JavaScript", "Mixed"];
  const bank = {
    React: [
      { q: "React is a?", options: ["Library", "Framework", "Language"], a: 0 },
      { q: "useState returns?", options: ["value only", "value and setter", "setter only"], a: 1 },
      { q: "Keys help with?", options: ["Styles", "Reconciliation", "Routing"], a: 1 },
      { q: "useEffect runs?", options: ["During render", "After paint", "Before render"], a: 1 },
      { q: "Context is for?", options: ["Global state", "CSS", "Testing"], a: 0 },
      { q: "Memoization hook?", options: ["useMemo", "useRef", "useId"], a: 0 },
      { q: "List rendering uses?", options: ["map", "forEach", "reduce"], a: 0 },
      { q: "Suspense helps with?", options: ["Data fetching", "Events", "CSS"], a: 0 },
      { q: "Portals render to?", options: ["Another DOM node", "Same node", "Shadow DOM only"], a: 0 },
      { q: "Pure component avoids?", options: ["Re-renders", "Mount", "Unmount"], a: 0 },
    ],
    HTML: [
      { q: "Semantic tag for navigation?", options: ["nav", "div", "section"], a: 0 },
      { q: "Best heading for main title?", options: ["h3", "h1", "h6"], a: 1 },
      { q: "Accessible image needs?", options: ["alt", "style", "data-id"], a: 0 },
      { q: "Form groups with?", options: ["fieldset", "div", "span"], a: 0 },
      { q: "Table header tag?", options: ["th", "td", "tr"], a: 0 },
      { q: "Metadata goes in?", options: ["head", "body", "footer"], a: 0 },
      { q: "Link tag attribute for URL?", options: ["href", "src", "rel"], a: 0 },
      { q: "Input type for email?", options: ["text", "email", "url"], a: 1 },
      { q: "Button default type?", options: ["button", "submit", "reset"], a: 1 },
      { q: "ARIA improves?", options: ["Accessibility", "Security", "SEO only"], a: 0 },
    ],
    CSS: [
      { q: "Flex axis controlled by?", options: ["flex-direction", "justify-items", "position"], a: 0 },
      { q: "Center with flex uses?", options: ["justify-content & align-items", "top & left", "grid"], a: 0 },
      { q: "Specificity order?", options: ["id > class > element", "class > id > element", "element > id > class"], a: 0 },
      { q: "Variable syntax?", options: ["var(--x)", "var(x)", "$x"], a: 0 },
      { q: "Position fixed relative to?", options: ["viewport", "parent", "document"], a: 0 },
      { q: "Grid columns set by?", options: ["grid-template-columns", "columns", "flex-columns"], a: 0 },
      { q: "Units responsive?", options: ["rem", "px", "pt"], a: 0 },
      { q: "Pseudo-class hover applies to?", options: [":hover", "::hover", "hover()"], a: 0 },
      { q: "Z-index works with?", options: ["positioned elements", "all", "none"], a: 0 },
      { q: "Media query keyword?", options: ["@media", "@query", "@screen"], a: 0 },
    ],
    JavaScript: [
      { q: "typeof null?", options: ["object", "null", "undefined"], a: 0 },
      { q: "Array immutably add uses?", options: ["concat", "push", "splice"], a: 0 },
      { q: "Promise resolves with?", options: ["then", "catch", "finally"], a: 0 },
      { q: "NaN === NaN is?", options: ["false", "true", "error"], a: 0 },
      { q: "Map vs Object: Map preserves?", options: ["insertion order", "keys order random", "size 0"], a: 0 },
      { q: "Closure captures?", options: ["lexical scope", "this", "DOM only"], a: 0 },
      { q: "Strict equality operator?", options: ["===", "==", "=~"], a: 0 },
      { q: "Spread on arrays does?", options: ["copies items", "binds this", "sorts"], a: 0 },
      { q: "setTimeout 0 runs?", options: ["after current task", "immediately", "before"], a: 0 },
      { q: "JSON.parse expects?", options: ["string", "object", "array only"], a: 0 },
    ],
  };
  const makeAssessment = (topic, id) => ({
    id,
    name: `${topic} Assessment`,
    tags: [topic],
    createdAt: Date.now() - id * 172800000,
    questions: (topic === "Mixed" ? [...bank.React, ...bank.HTML].slice(0,5).concat([...bank.CSS, ...bank.JavaScript].slice(0,5)) : bank[topic]).map((item, i) => ({
      id: `q${i + 1}`,
      type: "single",
      text: item.q,
      options: item.options,
      answerIndex: item.a,
      required: true,
    })),
  });
  return topics.map((t, idx) => makeAssessment(t, idx + 1));
}

const SEED_VERSION = 3;

// Initialize data stores - will be populated asynchronously
let jobsData = null;
let candidatesData = null;
let assessmentsData = null;
let timelines = null;
let notesStore = null;
let seedVersion = 0;
let assignedStore = null;
let dataInitialized = false;

// Async initialization function
const initializeData = async () => {
  if (dataInitialized) return;
  
  try {
    // Load all data from persistence layer (localStorage -> IndexedDB fallback)
    jobsData = await load("tf_jobs", null);
    candidatesData = await load("tf_candidates", null);
    assessmentsData = await load("tf_assessments", null);
    timelines = await load("tf_timelines", null);
    notesStore = await load("tf_notes", null);
    seedVersion = await load("tf_seed_version", 0);
    assignedStore = await load("tf_assigned", null);
    
    // Generate seed data if needed
    if (!jobsData || !candidatesData || !assessmentsData || !timelines || !notesStore || !assignedStore || seedVersion !== SEED_VERSION || (Array.isArray(assessmentsData) && (assessmentsData.length < 5 || (assessmentsData[0]?.questions?.length || 0) < 10))) {
      console.log('Generating seed data...');
      jobsData = generateJobs(25);
      candidatesData = generateCandidates(jobsData, 1000);
      assessmentsData = generateAssessments();
      timelines = Object.fromEntries(candidatesData.map(c => [c.id, [{ id: `${c.id}-0`, at: Date.now() - 86400000, from: null, to: c.stage }]]));
      notesStore = {};
      assignedStore = {};
      
      // Save all seed data
      await Promise.all([
        save("tf_jobs", jobsData),
        save("tf_candidates", candidatesData),
        save("tf_assessments", assessmentsData),
        save("tf_timelines", timelines),
        save("tf_notes", notesStore),
        save("tf_assigned", assignedStore),
        save("tf_seed_version", SEED_VERSION)
      ]);
    }
    
    // Handle data migrations
    if (Array.isArray(candidatesData)) {
      let changed = false;
      for (const c of candidatesData) {
        if (c.stage === 'interview') { c.stage = 'tech'; changed = true; }
      }
      if (changed) {
        await save("tf_candidates", candidatesData);
      }
    }
    
    if (timelines && typeof timelines === 'object') {
      let changed = false;
      for (const [id, list] of Object.entries(timelines)) {
        if (Array.isArray(list)) {
          for (const entry of list) {
            if (entry.to === 'interview') { entry.to = 'tech'; changed = true; }
            if (entry.from === 'interview') { entry.from = 'tech'; changed = true; }
          }
        }
      }
      if (changed) {
        await save("tf_timelines", timelines);
      }
    }
    
    dataInitialized = true;
    console.log('Data initialization complete. Restored from:', 
      localStorage.getItem('tf_jobs') ? 'localStorage' : 'IndexedDB');
  } catch (error) {
    console.error('Failed to initialize data:', error);
    // Fallback to sync loading if async fails
    jobsData = loadSync("tf_jobs", null) || generateJobs(25);
    candidatesData = loadSync("tf_candidates", null) || generateCandidates(jobsData, 1000);
    assessmentsData = loadSync("tf_assessments", null) || generateAssessments();
    timelines = loadSync("tf_timelines", null) || {};
    notesStore = loadSync("tf_notes", null) || {};
    assignedStore = loadSync("tf_assigned", null) || {};
    dataInitialized = true;
  }
};

// Ensure data is initialized before any API calls
const ensureDataInitialized = async () => {
  if (!dataInitialized) {
    await initializeData();
  }
};

// Data initialization is now handled by the async initializeData() function

function filteredJobs(params) {
  let list = [...jobsData];
  const { search = "", status, tag, order } = params;
  if (status) list = list.filter(j => j.status === status);
  if (tag) list = list.filter(j => j.tags?.includes(tag));
  if (search) list = list.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
  if (order === "desc") list = list.sort((a, b) => b.order - a.order); else list = list.sort((a, b) => a.order - b.order);
  return list;
}

function paginate(list, page = 1, pageSize = 20) {
  const p = Number(page) || 1;
  const s = Number(pageSize) || 20;
  const start = (p - 1) * s;
  const end = start + s;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / s));
  return { data: list.slice(start, end), page: p, pageSize: s, total, totalPages };
}

function shouldFail(probability = 0.08) {
  return Math.random() < probability;
}

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function generateUniqueSlug(title, excludeId) {
  const base = slugify(title);
  let slug = base;
  let i = 1;
  const jobSlugs = jobsData.map(j => (j.slug || slugify(j.title)));
  while (jobSlugs.includes(slug) && jobsData.some(j => j.id !== excludeId)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export const handlers = [
  // Slug existence check
  http.get("/jobs/slug/:slug", async ({ params, request }) => {
    const slug = String(params.slug || '').toLowerCase();
    const url = new URL(request.url);
    const excludeId = Number(url.searchParams.get('excludeId'));
    const exists = jobsData.some(j => (j.slug || slugify(j.title)) === slug && j.id !== excludeId);
    await delay(100);
    return HttpResponse.json({ exists });
  }),
  // Notifications (simulated)
  http.get("/notifications", async () => {
    await delay(200);
    const items = candidatesData.slice(0, 5).map(c => ({ id: `n-${c.id}`, text: `${c.name} applied to Job #${c.jobId}` }));
    return HttpResponse.json(items);
  }),
  // Jobs
  http.get("/jobs", async ({ request }) => {
    await ensureDataInitialized();
    await delay(200);
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const list = filteredJobs(params);
    const page = paginate(list, params.page, params.pageSize);
    return HttpResponse.json(page);
  }),

  http.post("/jobs", async ({ request }) => {
    await ensureDataInitialized();
    const body = await request.json();
    const title = body.title || "Untitled Job";
    const slug = generateUniqueSlug(title);
    const newJob = {
      id: Math.max(0, ...jobsData.map(j => j.id)) + 1,
      title,
      slug,
      status: body.status || "active",
      tags: body.tags || [],
      order: jobsData.length + 1,
      createdAt: Date.now(),
    };
    // occasional failure to test rollback
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    jobsData.push(newJob);
    save("tf_jobs", jobsData);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.patch("/jobs/:id", async ({ params, request }) => {
    await ensureDataInitialized();
    const id = Number(params.id);
    const body = await request.json();
    const idx = jobsData.findIndex(j => j.id === id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    let updated = { ...jobsData[idx], ...body };
    if (body.title && body.title !== jobsData[idx].title) {
      updated.slug = generateUniqueSlug(body.title, id);
    }
    jobsData[idx] = updated;
    save("tf_jobs", jobsData);
    return HttpResponse.json(jobsData[idx]);
  }),

  http.patch("/jobs/:id/reorder", async ({ request }) => {
    await ensureDataInitialized();
    const { fromOrder, toOrder } = await request.json();
    const list = jobsData.sort((a, b) => a.order - b.order);
    const fromIdx = list.findIndex(j => j.order === fromOrder);
    const [moved] = list.splice(fromIdx, 1);
    const toIdx = list.findIndex(j => j.order === toOrder);
    list.splice(toIdx, 0, moved);
    list.forEach((j, i) => (j.order = i + 1));
    if (shouldFail(0.1)) {
      await delay(300);
      return HttpResponse.json({ message: "Reorder failed" }, { status: 500 });
    }
    jobsData = list;
    save("tf_jobs", jobsData);
    return HttpResponse.json({ ok: true });
  }),

  // Candidates
  http.get("/candidates", async ({ request }) => {
    await ensureDataInitialized();
    await delay(200);
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    let list = [...candidatesData];
    if (params.stage) list = list.filter(c => c.stage === params.stage);
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.email.toLowerCase().includes(searchTerm)
      );
    }
    if (params.jobId) list = list.filter(c => String(c.jobId) === String(params.jobId));
    const page = paginate(list, params.page, params.pageSize || 40);
    return HttpResponse.json(page);
  }),

  http.post("/candidates", async ({ request }) => {
    await ensureDataInitialized();
    const body = await request.json();
    const newCandidate = {
      id: Math.max(0, ...candidatesData.map(c => c.id)) + 1,
      name: body.name || "Unnamed Candidate",
      email: body.email || "",
      stage: body.stage || "applied",
      jobId: body.jobId || jobsData[0]?.id,
      createdAt: Date.now(),
    };
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    candidatesData.push(newCandidate);
    save("tf_candidates", candidatesData);
    return HttpResponse.json(newCandidate, { status: 201 });
  }),

  http.patch("/candidates/:id", async ({ params, request }) => {
    await ensureDataInitialized();
    const id = Number(params.id);
    const body = await request.json();
    const idx = candidatesData.findIndex(c => c.id === id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    const before = candidatesData[idx];
    candidatesData[idx] = { ...before, ...body };
    if (body.stage && body.stage !== before.stage) {
      const list = timelines[id] || [];
      list.push({ id: `${id}-${list.length + 1}`, at: Date.now(), from: before.stage, to: body.stage });
      timelines[id] = list;
      save("tf_timelines", timelines);
    }
    save("tf_candidates", candidatesData);
    return HttpResponse.json(candidatesData[idx]);
  }),

  http.get("/candidates/:id/timeline", async ({ params }) => {
    await ensureDataInitialized();
    await delay(150);
    const id = Number(params.id);
    return HttpResponse.json(timelines[id] || []);
  }),

  // Candidate notes
  http.get("/candidates/:id/notes", async ({ params }) => {
    await ensureDataInitialized();
    await delay(120);
    const id = Number(params.id);
    return HttpResponse.json(notesStore[id] || []);
  }),
  http.post("/candidates/:id/notes", async ({ params, request }) => {
    await ensureDataInitialized();
    const id = Number(params.id);
    const body = await request.json();
    const list = notesStore[id] || [];
    const note = { id: `${id}-${Date.now()}`, at: Date.now(), text: body.text || "" };
    list.push(note);
    notesStore[id] = list;
    save("tf_notes", notesStore);
    await delay(120);
    return HttpResponse.json(note, { status: 201 });
  }),

  // Assessments
  http.get("/assessments", async () => {
    await ensureDataInitialized();
    await delay(150);
    return HttpResponse.json(assessmentsData);
  }),

  http.get("/assessments/:jobId", async ({ params }) => {
    await ensureDataInitialized();
    await delay(150);
    const jobId = Number(params.jobId);
    // Only return assessments specifically saved for this jobId.
    // If none exist, return an empty array so the builder starts empty.
    const data = assessmentsData.filter(a => a.jobId === jobId);
    return HttpResponse.json(data);
  }),

  http.post("/assessments", async ({ request }) => {
    const body = await request.json();
    const newAssessment = {
      id: Math.max(0, ...assessmentsData.map(a => a.id)) + 1,
      name: body.name || "New Assessment",
      tags: body.tags || [],
      questions: body.questions || [],
      createdAt: Date.now(),
    };
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    assessmentsData.push(newAssessment);
    save("tf_assessments", assessmentsData);
    return HttpResponse.json(newAssessment, { status: 201 });
  }),

  http.patch("/assessments/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    const idx = assessmentsData.findIndex(a => a.id === id);
    if (idx === -1) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    assessmentsData[idx] = { ...assessmentsData[idx], ...body };
    save("tf_assessments", assessmentsData);
    return HttpResponse.json(assessmentsData[idx]);
  }),

  http.put("/assessments/:jobId", async ({ params, request }) => {
    await ensureDataInitialized();
    const jobId = Number(params.jobId);
    const body = await request.json();
    const idx = assessmentsData.findIndex(a => a.jobId === jobId);
    const payload = { ...body, jobId };
    if (shouldFail()) {
      return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    }
    if (idx === -1) assessmentsData.push(payload); else assessmentsData[idx] = payload;
    save("tf_assessments", assessmentsData);
    return HttpResponse.json(payload);
  }),

  http.post("/assessments/:jobId/submit", async ({ params, request }) => {
    await ensureDataInitialized();
    const jobId = Number(params.jobId);
    const body = await request.json();
    const key = `tf_assessment_submit_${jobId}`;
    const list = loadSync(key, []);
    list.push({ at: Date.now(), ...body });
    await save(key, list);
    await delay(200);
    return HttpResponse.json({ ok: true });
  }),

  // Assign assessments to candidates
  http.post("/assessments/:id/assign", async ({ params, request }) => {
    await ensureDataInitialized();
    const id = Number(params.id);
    const body = await request.json();
    const candidateId = Number(body.candidateId);
    if (!candidateId) return HttpResponse.json({ message: "candidateId required" }, { status: 400 });
    const list = assignedStore[candidateId] || [];
    if (!list.find(a => a.assessmentId === id)) {
      list.push({ assessmentId: id, at: Date.now() });
      assignedStore[candidateId] = list;
      save("tf_assigned", assignedStore);
    }
    await delay(150);
    return HttpResponse.json({ ok: true });
  }),

  http.get("/candidates/:id/assignments", async ({ params }) => {
    await ensureDataInitialized();
    const id = Number(params.id);
    const list = assignedStore[id] || [];
    const detailed = list.map(item => {
      const a = assessmentsData.find(x => x.id === item.assessmentId);
      return { assessmentId: item.assessmentId, name: a?.name || `Assessment ${item.assessmentId}`, at: item.at };
    });
    await delay(120);
    return HttpResponse.json(detailed);
  }),

  // Simple stats endpoint for dashboard
  http.get("/stats", async () => {
    await delay(100);
    const activeJobs = jobsData.filter(j => j.status === "active").length;
    const archivedJobs = jobsData.length - activeJobs;
    const candidates = candidatesData.length;
    const assessments = assessmentsData.length;
    return HttpResponse.json({ activeJobs, archivedJobs, candidates, assessments });
  }),
];
