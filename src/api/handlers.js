import { http, HttpResponse, delay } from "msw";
import localforage from "localforage";

const load = async (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    const indexedValue = await localforage.getItem(key);
    if (indexedValue !== null) {
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  try {
    await localforage.setItem(key, value);
  } catch {}
};

const loadSync = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const CANDIDATE_STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function generateJobs(count = 25) {
  const jobTypes = [
    {
      title: "Frontend Developer",
      skills: ["React", "JavaScript", "HTML", "CSS"],
      description: "Build user interfaces and web applications"
    },
    {
      title: "Backend Developer", 
      skills: ["Node.js", "Python", "Database", "API"],
      description: "Develop server-side applications and APIs"
    },
    {
      title: "Fullstack Engineer",
      skills: ["React", "Node.js", "JavaScript", "Database"],
      description: "Work on both frontend and backend development"
    },
    {
      title: "Product Designer",
      skills: ["UI/UX", "Figma", "Design", "Prototyping"],
      description: "Design user experiences and interfaces"
    },
    {
      title: "DevOps Engineer",
      skills: ["AWS", "Docker", "CI/CD", "Kubernetes"],
      description: "Manage infrastructure and deployment pipelines"
    },
    {
      title: "QA Engineer",
      skills: ["Testing", "Automation", "Selenium", "Quality"],
      description: "Ensure software quality through testing"
    },
    {
      title: "Data Scientist",
      skills: ["Python", "Machine Learning", "Analytics", "Statistics"],
      description: "Analyze data and build predictive models"
    },
    {
      title: "Mobile Developer",
      skills: ["React Native", "iOS", "Android", "Mobile"],
      description: "Develop mobile applications"
    },
    {
      title: "Project Manager",
      skills: ["Agile", "Scrum", "Leadership", "Planning"],
      description: "Manage projects and coordinate teams"
    },
    {
      title: "Technical Writer",
      skills: ["Documentation", "Writing", "Technical", "Communication"],
      description: "Create technical documentation and guides"
    },
    {
      title: "Senior Frontend Developer",
      skills: ["React", "TypeScript", "Next.js", "GraphQL"],
      description: "Lead frontend development with advanced frameworks"
    },
    {
      title: "Senior Backend Developer",
      skills: ["Node.js", "PostgreSQL", "Redis", "Microservices"],
      description: "Architect scalable backend systems"
    },
    {
      title: "UI/UX Designer",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      description: "Create intuitive user interfaces and experiences"
    },
    {
      title: "Machine Learning Engineer",
      skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
      description: "Build and deploy machine learning models"
    },
    {
      title: "Cloud Architect",
      skills: ["AWS", "Azure", "GCP", "Terraform"],
      description: "Design cloud infrastructure solutions"
    },
    {
      title: "Security Engineer",
      skills: ["Cybersecurity", "Penetration Testing", "OWASP", "Compliance"],
      description: "Ensure application and infrastructure security"
    },
    {
      title: "Site Reliability Engineer",
      skills: ["Kubernetes", "Monitoring", "Incident Response", "Automation"],
      description: "Maintain system reliability and performance"
    },
    {
      title: "Product Manager",
      skills: ["Strategy", "Roadmapping", "Analytics", "Stakeholder Management"],
      description: "Drive product vision and strategy"
    },
    {
      title: "Business Analyst",
      skills: ["Requirements Analysis", "Process Modeling", "SQL", "Reporting"],
      description: "Analyze business processes and requirements"
    },
    {
      title: "Scrum Master",
      skills: ["Agile", "Scrum", "Facilitation", "Team Coaching"],
      description: "Facilitate agile development processes"
    },
    {
      title: "Database Administrator",
      skills: ["MySQL", "PostgreSQL", "MongoDB", "Performance Tuning"],
      description: "Manage and optimize database systems"
    },
    {
      title: "Network Engineer",
      skills: ["Networking", "Cisco", "Security", "Troubleshooting"],
      description: "Design and maintain network infrastructure"
    },
    {
      title: "Systems Administrator",
      skills: ["Linux", "Windows Server", "Virtualization", "Backup"],
      description: "Manage server infrastructure and operations"
    },
    {
      title: "Sales Engineer",
      skills: ["Technical Sales", "Solution Architecture", "Presentations", "CRM"],
      description: "Provide technical expertise in sales processes"
    },
    {
      title: "Customer Success Manager",
      skills: ["Customer Relations", "Account Management", "Analytics", "Communication"],
      description: "Ensure customer satisfaction and retention"
    }
  ];
  
  return Array.from({ length: count }).map((_, i) => {
    const jobType = jobTypes[i % jobTypes.length];
    return {
      id: i + 1,
      title: jobType.title,
      description: jobType.description,
      skills: jobType.skills,
      status: i % 7 === 0 ? "archived" : "active",
      tags: ["Remote", i % 3 === 0 ? "Urgent" : ""].filter(Boolean),
      order: i + 1,
      createdAt: Date.now() - i * 86400000,
    };
  });
}

function generateCandidates(jobs, count = 1000) {
  const first = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack", "Kathy", "Leo", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Ruth", "Sam", "Tina", "Uma", "Viktor", "Wendy", "Xavier", "Yara", "Zack", "Alex", "Beth", "Chris", "Dana", "Ethan", "Fiona", "George", "Helen", "Ian", "Julia", "Kevin", "Laura", "Mark", "Nina", "Oscar", "Penny", "Quincy", "Rachel", "Steve", "Tracy", "Ursula", "Victor", "Wanda", "Xander", "Yvonne", "Zoe"];
  const last = ["Johnson", "Smith", "Brown", "Lee", "Taylor", "Davis", "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Rodriguez", "Wilson", "Moore", "Miller", "Lopez", "Gonzalez", "Hernandez", "Perez", "Sanchez", "Ramirez", "Cruz", "Flores", "Gomez", "Morales", "Reyes", "Gutierrez", "Ortiz"]; 
  
  const candidatesPerJob = 40;
  const candidates = [];
  
  jobs.forEach((job, jobIndex) => {
    for (let i = 0; i < candidatesPerJob; i++) {
      const candidateIndex = jobIndex * candidatesPerJob + i;
      const firstNameIndex = candidateIndex % first.length;
      const lastNameIndex = Math.floor(candidateIndex / first.length) % last.length;
      const nameVariant = candidateIndex > (first.length * last.length) ? ` ${Math.floor(candidateIndex / (first.length * last.length)) + 1}` : '';
      
      candidates.push({
        id: candidateIndex + 1,
        name: `${first[firstNameIndex]} ${last[lastNameIndex]}${nameVariant}`,
        email: `${first[firstNameIndex].toLowerCase()}.${last[lastNameIndex].toLowerCase()}${nameVariant ? candidateIndex : ''}@example.com`,
        stage: CANDIDATE_STAGES[candidateIndex % CANDIDATE_STAGES.length],
        jobId: job.id,
        jobTitle: job.title,
        appliedFor: job.title,
        createdAt: Date.now() - candidateIndex * 43200000,
      });
    }
  });
  
  return candidates;
}

function generateAssessments(jobs) {
  const questionBanks = {
    "Frontend Developer": [
      { q: "What is React?", options: ["Library", "Framework", "Language"], a: 0 },
      { q: "What does useState return?", options: ["value only", "value and setter", "setter only"], a: 1 },
      { q: "Which HTML tag is semantic for navigation?", options: ["nav", "div", "section"], a: 0 },
      { q: "How do you center content with flexbox?", options: ["justify-content & align-items", "top & left", "grid"], a: 0 },
      { q: "What is the correct CSS variable syntax?", options: ["var(--x)", "var(x)", "$x"], a: 0 },
      { q: "Which JavaScript operator checks strict equality?", options: ["===", "==", "=~"], a: 0 },
      { q: "What does useEffect do in React?", options: ["Manages side effects", "Creates components", "Handles routing"], a: 0 },
      { q: "Which CSS unit is most responsive?", options: ["rem", "px", "pt"], a: 0 },
      { q: "What is the purpose of keys in React lists?", options: ["Styling", "Reconciliation", "Routing"], a: 1 },
      { q: "How do you make an image accessible in HTML?", options: ["alt attribute", "style attribute", "data-id"], a: 0 }
    ],
    "Backend Developer": [
      { q: "What is Node.js?", options: ["JavaScript runtime", "Database", "Framework"], a: 0 },
      { q: "Which HTTP method is used to create resources?", options: ["GET", "POST", "DELETE"], a: 1 },
      { q: "What does API stand for?", options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface"], a: 0 },
      { q: "Which database type is MongoDB?", options: ["SQL", "NoSQL", "Graph"], a: 1 },
      { q: "What is REST?", options: ["Representational State Transfer", "Remote State Transfer", "Relational State Transfer"], a: 0 },
      { q: "Which status code indicates success?", options: ["200", "404", "500"], a: 0 },
      { q: "What is middleware in Express?", options: ["Functions that execute during request-response cycle", "Database layer", "Frontend component"], a: 0 },
      { q: "Which Python framework is popular for web development?", options: ["Django", "NumPy", "Pandas"], a: 0 },
      { q: "What is JWT used for?", options: ["Authentication", "Database queries", "Styling"], a: 0 },
      { q: "Which HTTP header is used for authentication?", options: ["Authorization", "Content-Type", "Accept"], a: 0 }
    ],
    "Fullstack Engineer": [
      { q: "What connects frontend and backend?", options: ["API", "Database", "Server"], a: 0 },
      { q: "Which is a popular React state management library?", options: ["Redux", "Express", "MongoDB"], a: 0 },
      { q: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Cross-Origin Request Security", "Cross-Origin Response Sharing"], a: 0 },
      { q: "Which database query language is most common?", options: ["SQL", "HTML", "CSS"], a: 0 },
      { q: "What is server-side rendering?", options: ["Rendering pages on server", "Rendering pages on client", "Rendering images"], a: 0 },
      { q: "Which tool is used for API testing?", options: ["Postman", "Photoshop", "Excel"], a: 0 },
      { q: "What is a microservice?", options: ["Small, independent service", "Large monolithic app", "Database type"], a: 0 },
      { q: "Which protocol does HTTP use?", options: ["TCP", "UDP", "FTP"], a: 0 },
      { q: "What is GraphQL?", options: ["Query language for APIs", "Database", "Frontend framework"], a: 0 },
      { q: "Which is a popular Node.js framework?", options: ["Express", "React", "Angular"], a: 0 }
    ],
    "Product Designer": [
      { q: "What does UX stand for?", options: ["User Experience", "User Extension", "Universal Experience"], a: 0 },
      { q: "Which tool is popular for UI design?", options: ["Figma", "Excel", "Word"], a: 0 },
      { q: "What is a wireframe?", options: ["Low-fidelity design sketch", "High-fidelity mockup", "Final design"], a: 0 },
      { q: "Which principle focuses on ease of use?", options: ["Usability", "Accessibility", "Scalability"], a: 0 },
      { q: "What is a user persona?", options: ["Fictional user representation", "Real user", "Developer"], a: 0 },
      { q: "Which color model is used for screens?", options: ["RGB", "CMYK", "HSL"], a: 0 },
      { q: "What is A/B testing?", options: ["Comparing two versions", "Testing one version", "Bug testing"], a: 0 },
      { q: "Which typography principle improves readability?", options: ["Hierarchy", "Color", "Animation"], a: 0 },
      { q: "What is the purpose of user research?", options: ["Understand user needs", "Write code", "Test servers"], a: 0 },
      { q: "Which design system is popular?", options: ["Material Design", "Bootstrap", "Tailwind"], a: 0 }
    ],
    "DevOps Engineer": [
      { q: "What does CI/CD stand for?", options: ["Continuous Integration/Continuous Deployment", "Code Integration/Code Deployment", "Central Integration/Central Deployment"], a: 0 },
      { q: "Which platform is AWS?", options: ["Cloud computing", "Database", "Frontend framework"], a: 0 },
      { q: "What is Docker used for?", options: ["Containerization", "Database management", "UI design"], a: 0 },
      { q: "Which tool is used for container orchestration?", options: ["Kubernetes", "Git", "npm"], a: 0 },
      { q: "What is Infrastructure as Code?", options: ["Managing infrastructure through code", "Writing application code", "Database code"], a: 0 },
      { q: "Which monitoring tool is popular?", options: ["Prometheus", "React", "Angular"], a: 0 },
      { q: "What is a load balancer?", options: ["Distributes incoming requests", "Stores data", "Renders UI"], a: 0 },
      { q: "Which version control system is most popular?", options: ["Git", "SVN", "Mercurial"], a: 0 },
      { q: "What is blue-green deployment?", options: ["Deployment strategy with two environments", "Color scheme", "Database strategy"], a: 0 },
      { q: "Which cloud service provides compute instances?", options: ["EC2", "S3", "RDS"], a: 0 }
    ],
    "QA Engineer": [
      { q: "What is unit testing?", options: ["Testing individual components", "Testing entire system", "Testing UI only"], a: 0 },
      { q: "Which tool is used for automated testing?", options: ["Selenium", "Photoshop", "Excel"], a: 0 },
      { q: "What is regression testing?", options: ["Testing after changes", "First-time testing", "Performance testing"], a: 0 },
      { q: "Which type of testing checks user interface?", options: ["UI testing", "Unit testing", "Integration testing"], a: 0 },
      { q: "What is test-driven development?", options: ["Writing tests before code", "Writing code before tests", "No testing"], a: 0 },
      { q: "Which testing pyramid level has most tests?", options: ["Unit tests", "Integration tests", "E2E tests"], a: 0 },
      { q: "What is a test case?", options: ["Specific test scenario", "Bug report", "Code review"], a: 0 },
      { q: "Which testing type checks system performance?", options: ["Load testing", "Unit testing", "Smoke testing"], a: 0 },
      { q: "What is boundary value analysis?", options: ["Testing edge cases", "Testing normal cases", "Testing random cases"], a: 0 },
      { q: "Which bug severity is highest?", options: ["Critical", "Major", "Minor"], a: 0 }
    ],
    "Data Scientist": [
      { q: "Which language is popular for data science?", options: ["Python", "HTML", "CSS"], a: 0 },
      { q: "What is machine learning?", options: ["Algorithms that learn from data", "Manual data entry", "Database design"], a: 0 },
      { q: "Which library is used for data manipulation in Python?", options: ["Pandas", "React", "Express"], a: 0 },
      { q: "What is supervised learning?", options: ["Learning with labeled data", "Learning without data", "Learning with unlabeled data"], a: 0 },
      { q: "Which visualization library is popular in Python?", options: ["Matplotlib", "Bootstrap", "jQuery"], a: 0 },
      { q: "What is a neural network?", options: ["Network of interconnected nodes", "Computer network", "Social network"], a: 0 },
      { q: "Which statistical measure shows central tendency?", options: ["Mean", "Range", "Variance"], a: 0 },
      { q: "What is data preprocessing?", options: ["Cleaning and preparing data", "Storing data", "Visualizing data"], a: 0 },
      { q: "Which algorithm is used for classification?", options: ["Decision Tree", "Linear Regression", "K-means"], a: 0 },
      { q: "What is cross-validation?", options: ["Model evaluation technique", "Data storage method", "Visualization technique"], a: 0 }
    ],
    "Mobile Developer": [
      { q: "Which framework allows cross-platform mobile development?", options: ["React Native", "HTML", "CSS"], a: 0 },
      { q: "What is the native language for iOS development?", options: ["Swift", "Java", "Python"], a: 0 },
      { q: "Which IDE is used for Android development?", options: ["Android Studio", "Visual Studio Code", "Sublime Text"], a: 0 },
      { q: "What is responsive design?", options: ["Adapting to different screen sizes", "Fast loading", "Good performance"], a: 0 },
      { q: "Which store distributes iOS apps?", options: ["App Store", "Google Play", "Microsoft Store"], a: 0 },
      { q: "What is native development?", options: ["Platform-specific development", "Cross-platform development", "Web development"], a: 0 },
      { q: "Which component handles navigation in React Native?", options: ["Navigator", "Router", "Link"], a: 0 },
      { q: "What is the main benefit of hybrid apps?", options: ["Code reuse across platforms", "Better performance", "Smaller size"], a: 0 },
      { q: "Which tool is used for mobile app testing?", options: ["Appium", "Jest", "Mocha"], a: 0 },
      { q: "What is push notification?", options: ["Message sent to device", "Pull request", "Code commit"], a: 0 }
    ],
    "Project Manager": [
      { q: "What is Agile methodology?", options: ["Iterative development approach", "Waterfall approach", "Testing methodology"], a: 0 },
      { q: "Which ceremony is part of Scrum?", options: ["Daily standup", "Code review", "Database backup"], a: 0 },
      { q: "What is a sprint?", options: ["Time-boxed iteration", "Bug fix", "Feature release"], a: 0 },
      { q: "Which tool is used for project tracking?", options: ["Jira", "Photoshop", "Excel"], a: 0 },
      { q: "What is a user story?", options: ["Feature from user perspective", "Bug report", "Technical specification"], a: 0 },
      { q: "Which role owns the product backlog?", options: ["Product Owner", "Scrum Master", "Developer"], a: 0 },
      { q: "What is the purpose of retrospectives?", options: ["Improve team processes", "Plan features", "Fix bugs"], a: 0 },
      { q: "Which chart shows project progress?", options: ["Burndown chart", "Pie chart", "Bar chart"], a: 0 },
      { q: "What is scope creep?", options: ["Uncontrolled expansion of scope", "Reducing scope", "Planning scope"], a: 0 },
      { q: "Which methodology emphasizes documentation?", options: ["Waterfall", "Agile", "Scrum"], a: 0 }
    ],
    "Technical Writer": [
      { q: "What is the primary goal of technical writing?", options: ["Clear communication", "Creative expression", "Entertainment"], a: 0 },
      { q: "Which format is common for API documentation?", options: ["Markdown", "PDF", "Word"], a: 0 },
      { q: "What is user documentation?", options: ["Instructions for end users", "Code comments", "Design specifications"], a: 0 },
      { q: "Which principle improves document readability?", options: ["Clear structure", "Complex vocabulary", "Long paragraphs"], a: 0 },
      { q: "What is a style guide?", options: ["Writing standards document", "Design mockup", "Code repository"], a: 0 },
      { q: "Which tool is popular for documentation sites?", options: ["GitBook", "Photoshop", "Excel"], a: 0 },
      { q: "What is information architecture?", options: ["Organizing content structure", "Building architecture", "Database design"], a: 0 },
      { q: "Which writing style is preferred for technical docs?", options: ["Active voice", "Passive voice", "Complex sentences"], a: 0 },
      { q: "What is a changelog?", options: ["Record of software changes", "User manual", "API reference"], a: 0 },
      { q: "Which element improves document navigation?", options: ["Table of contents", "Images", "Colors"], a: 0 }
    ]
  };

  const assessments = [];
  let assessmentId = 1;

  jobs.forEach(job => {
    const jobQuestions = questionBanks[job.title] || questionBanks["Frontend Developer"];
    
    for (let i = 1; i <= 3; i++) {
      assessments.push({
        id: assessmentId++,
        name: `${job.title} Assessment ${i}`,
        jobId: job.id,
        jobTitle: job.title,
        level: i === 1 ? "Beginner" : i === 2 ? "Intermediate" : "Advanced",
        tags: [job.title, i === 1 ? "Beginner" : i === 2 ? "Intermediate" : "Advanced"],
        createdAt: Date.now() - assessmentId * 172800000,
        questions: jobQuestions.map((item, qIndex) => ({
          id: `q${qIndex + 1}`,
          type: "single",
          text: item.q,
          options: item.options,
          answerIndex: item.a,
          required: true,
        })),
      });
    }
  });

  return assessments;
}

const SEED_VERSION = 7;

let jobsData = null;
let candidatesData = null;
let assessmentsData = null;
let timelines = null;
let notesStore = null;
let seedVersion = 0;
let assignedStore = null;
let dataInitialized = false;

const initializeData = async () => {
  if (dataInitialized) return;
  
  try {
    jobsData = await load("tf_jobs", null);
    candidatesData = await load("tf_candidates", null);
    assessmentsData = await load("tf_assessments", null);
    timelines = await load("tf_timelines", null);
    notesStore = await load("tf_notes", null);
    seedVersion = await load("tf_seed_version", 0);
    assignedStore = await load("tf_assigned", null);
    
    if (!jobsData || !candidatesData || !assessmentsData || !timelines || !notesStore || !assignedStore || seedVersion !== SEED_VERSION || (Array.isArray(assessmentsData) && (assessmentsData.length < 75 || (assessmentsData[0]?.questions?.length || 0) < 10))) {
      console.log('Generating seed data...');
      jobsData = generateJobs(25);
      candidatesData = generateCandidates(jobsData, 1000);
      assessmentsData = generateAssessments(jobsData);
      timelines = Object.fromEntries(candidatesData.map(c => [c.id, [{ id: `${c.id}-0`, at: Date.now() - 86400000, from: null, to: c.stage }]]));
      notesStore = {};
      assignedStore = {};
      
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
      for (const [, list] of Object.entries(timelines)) {
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
    jobsData = loadSync("tf_jobs", null) || generateJobs(25);
    candidatesData = loadSync("tf_candidates", null) || generateCandidates(jobsData, 1000);
    assessmentsData = loadSync("tf_assessments", null) || generateAssessments(jobsData);
    timelines = loadSync("tf_timelines", null) || {};
    notesStore = loadSync("tf_notes", null) || {};
    assignedStore = loadSync("tf_assigned", null) || {};
    dataInitialized = true;
  }
};

const ensureDataInitialized = async () => {
  if (!dataInitialized) {
    await initializeData();
  }
};


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
  http.get("/jobs/slug/:slug", async ({ params, request }) => {
    const slug = String(params.slug || '').toLowerCase();
    const url = new URL(request.url);
    const excludeId = Number(url.searchParams.get('excludeId'));
    const exists = jobsData.some(j => (j.slug || slugify(j.title)) === slug && j.id !== excludeId);
    await delay(100);
    return HttpResponse.json({ exists });
  }),
  http.get("/notifications", async () => {
    await delay(200);
    const items = candidatesData.slice(0, 5).map(c => ({ id: `n-${c.id}`, text: `${c.name} applied to Job #${c.jobId}` }));
    return HttpResponse.json(items);
  }),
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

  http.get("/assessments", async () => {
    await ensureDataInitialized();
    await delay(150);
    return HttpResponse.json(assessmentsData);
  }),

  http.get("/assessments/:jobId", async ({ params }) => {
    await ensureDataInitialized();
    await delay(150);
    const jobId = Number(params.jobId);
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

  http.get("/stats", async () => {
    await delay(100);
    const activeJobs = jobsData.filter(j => j.status === "active").length;
    const archivedJobs = jobsData.length - activeJobs;
    const candidates = candidatesData.length;
    const assessments = assessmentsData.length;
    return HttpResponse.json({ activeJobs, archivedJobs, candidates, assessments });
  }),
];
