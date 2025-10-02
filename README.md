````markdown
# TalentFlow - HR Management System  

## 🚀 Setup & Installation  

### Prerequisites  
- Node.js (v14 or higher)  
- npm or yarn package manager  
- Git  

### Installation Steps  
```bash
# Clone the repository
git clone <repository-url>
cd talentflow

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
````

### Environment Configuration

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=your-api-endpoint
```

## 🏗️ Architecture

### Frontend Architecture

* Framework: React 18 with functional components and hooks
* Routing: React Router v6 for client-side navigation
* State Management: React useState and useEffect hooks
* Styling: CSS-in-JS with CSS custom properties for theming
* Build Tool: Create React App with Webpack

### Component Structure

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

### Key Features

* Responsive Design: Mobile-first approach with breakpoints at 768px and 480px
* Dark/Light Theme: CSS custom properties with theme switching
* Drag & Drop: Native HTML5 drag and drop for job and candidate reordering
* Real-time Search: Debounced search with URL parameter persistence
* Audit Logging: Local storage-based activity tracking

## 🐛 Known Issues & Solutions

### 1. Link Navigation vs Drag & Drop Conflict

**Issue**: Clicking on candidate/job names refreshed the page instead of navigating.
**Root Cause**: Drag event handlers on parent elements intercepted click events.
**Solution**:

* Added stopPropagation() to all Link components
* Separated drag handles from clickable content
* Fixed component imports in App.js to use correct exports

### 2. Component Import Mismatch

**Issue**: CandidateProfile and JobDetail components not loading correctly.
**Root Cause**: App.js was importing from separate files instead of the main component files.
**Solution**:

```javascript
// Before (Broken)
import CandidateProfile from './pages/CandidateProfile';
import JobDetail from './pages/JobDetail';

// After (Fixed)
import Candidates, { CandidateProfile } from './pages/Candidates';
import Jobs, { JobDetail } from './pages/Jobs';
```

### 3. ESLint Build Failures

**Issue**: Netlify builds failing due to unused variables and imports.
**Root Cause**: CI environment treats ESLint warnings as errors.
**Solution**: Removed unused imports (useMemo) and variables (setError) to pass build validation.

### 4. Mobile Responsiveness

**Issue**: Poor mobile experience with overlapping elements.
**Solution**:

* Implemented collapsible sidebar with hamburger menu
* Added mobile-specific CSS media queries
* Touch-friendly button sizes and spacing
* Single-column layouts on mobile devices

## 🔧 Technical Decisions

### 1. State Management

**Decision**: Use React's built-in useState and useEffect instead of Redux.
**Rationale**:

* Application complexity doesn't justify Redux overhead
* Local state management sufficient for current scope
* Easier to understand and maintain for team

### 2. Drag & Drop Implementation

**Decision**: Native HTML5 Drag & Drop API instead of third-party libraries.
**Rationale**:

* No additional dependencies
* Better performance
* Full control over drag behavior
* Consistent with web standards

### 3. Styling Approach

**Decision**: CSS-in-JS with inline styles and CSS custom properties.
**Rationale**:

* Component-scoped styling
* Dynamic theming support
* No CSS naming conflicts
* Easy to maintain and modify

### 4. Data Persistence

**Decision**: Local storage for audit logs and temporary data.
**Rationale**:

* No backend database required for demo
* Persistent across browser sessions
* Simple implementation
* Easy to migrate to real database later

### 5. Routing Strategy

**Decision**: Client-side routing with React Router.
**Rationale**:

* Single Page Application (SPA) experience
* Fast navigation between pages
* URL-based state management
* SEO-friendly with proper meta tags

### 6. Component Architecture

**Decision**: Export multiple components from single files.
**Rationale**:

* Related components stay together
* Easier imports and maintenance
* Better code organization
* Shared state between related components

### 7. Mobile-First Design

**Decision**: Responsive design starting from mobile breakpoints.
**Rationale**:

* Better mobile user experience
* Progressive enhancement approach
* Covers majority of users
* Easier to scale up than down

### 8. Build and Deployment

**Decision**: Netlify for hosting with automatic deployments.
**Rationale**:

* Easy CI/CD integration with Git
* Automatic HTTPS and CDN
* Branch previews for testing
* Cost-effective for small projects

```

---

✅ This will render on GitHub with **big bold headings** and clean formatting.  

Do you also want me to add a **table of contents** at the top so users can jump directly to Setup, Architecture, Issues, or Technical Decisions?
```
