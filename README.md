---

# TalentFlow - HR Management System

🚀 Setup & Installation

Prerequisites

* Node.js (v14 or higher)
* npm or yarn package manager
* Git

Installation Steps

```bash
# Clone the repository
git clone https://github.com/AvinashMishraaa/talentflow
cd talentflow

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

🏗️ Architecture

Frontend Architecture

1 Framework: React 18 with functional components and hooks

2 Routing: React Router v6 for client-side navigation

3 State Management: React useState and useEffect hooks

4 Styling: CSS-in-JS with CSS custom properties for theming

5 Build Tool: Create React App with Webpack

Component Structure

```
src/
├── pages/
│   ├── Landing.js          # Marketing landing page
│   ├── Dashboard.js        # Main dashboard with statistics
│   ├── Jobs.js             # Job management with drag & drop
│   ├── Candidates.js       # Candidate management with stages
│   ├── Assessments.js      # Assessment builder and management
│   └── AuditLog.js         # Activity tracking and logs
├── App.js                  # Main app component with routing
├── App.css                 # Global styles and responsive design
└── index.js                # Application entry point
```

Key Features

i   Responsive Design: Mobile-first approach with breakpoints at 768px and 480px

ii  Dark/Light Theme: CSS custom properties with theme switching

iii Drag & Drop: Native HTML5 drag and drop for job and candidate reordering

iv  Real-time Search: Debounced search with URL parameter persistence

v   Audit Logging: Local storage-based activity tracking

🐛 Known Issues & Solutions

1. Link Navigation vs Drag & Drop Conflict
   Issue: Clicking on candidate/job names refreshed the page instead of navigating.
   Root Cause: Drag event handlers on parent elements intercepted click events.
   Solution:

i   Added stopPropagation() to all Link components

ii  Separated drag handles from clickable content

iii Fixed component imports in App.js to use correct exports

2. Component Import Mismatch
   Issue: CandidateProfile and JobDetail components not loading correctly.
   Root Cause: App.js was importing from separate files instead of the main component files.
   Solution:

```javascript
// Before (Broken)
import CandidateProfile from './pages/CandidateProfile';
import JobDetail from './pages/JobDetail';

// After (Fixed)
import Candidates, { CandidateProfile } from './pages/Candidates';
import Jobs, { JobDetail } from './pages/Jobs';
```

3. ESLint Build Failures
   Issue: Netlify builds failing due to unused variables and imports.
   Root Cause: CI environment treats ESLint warnings as errors.
   Solution: Removed unused imports (useMemo) and variables (setError) to pass build validation.

4. Mobile Responsiveness
   Issue: Poor mobile experience with overlapping elements.
   Solution:

i   Implemented collapsible sidebar with hamburger menu

ii  Added mobile-specific CSS media queries

iii Touch-friendly button sizes and spacing

iv  Single-column layouts on mobile devices

🔧 Technical Decisions

1. State Management
   Decision: Use React's built-in useState and useEffect instead of Redux.
   Rationale:

i   Application complexity doesn't justify Redux overhead

ii  Local state management sufficient for current scope

iii Easier to understand and maintain for team

2. Drag & Drop Implementation
   Decision: Native HTML5 Drag & Drop API instead of third-party libraries.
   Rationale:

i   No additional dependencies

ii  Better performance

iii Full control over drag behavior

iv  Consistent with web standards

3. Styling Approach
   Decision: CSS-in-JS with inline styles and CSS custom properties.
   Rationale:

i   Component-scoped styling

ii  Dynamic theming support

iii No CSS naming conflicts

iv  Easy to maintain and modify

4. Data Persistence
   Decision: Local storage for audit logs and temporary data.
   Rationale:

i   No backend database required for demo

ii  Persistent across browser sessions

iii Simple implementation

iv  Easy to migrate to real database later

5. Routing Strategy
   Decision: Client-side routing with React Router.
   Rationale:

i   Single Page Application (SPA) experience

ii  Fast navigation between pages

iii URL-based state management

iv  SEO-friendly with proper meta tags

6. Component Architecture
   Decision: Export multiple components from single files.
   Rationale:

i   Related components stay together

ii  Easier imports and maintenance

iii Better code organization

iv  Shared state between related components

