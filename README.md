# 🧠 Synapse — AI-Powered Code Reviewer

> **Debug the logic, not just the error.**
> Synapse is a Socratic debugging companion for engineers who want to *understand* the bug — not just silence it. Build intuition. Save what you learn.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [Frontend Pages and Components](#frontend-pages-and-components)
7. [Backend API Reference](#backend-api-reference)
8. [Database Models](#database-models)
9. [Authentication Flow](#authentication-flow)
10. [AI Integration (Google Gemini)](#ai-integration-google-gemini)
11. [Design System](#design-system)
12. [Key Features](#key-features)
13. [Scripts](#scripts)

---

## Overview

Synapse is a full-stack web application that lets engineers paste code, receive a structured AI-generated review via **Google Gemini 2.5 Flash**, and save those reviews to a personal, searchable **Bug Library** organised into **Collections**.

Rather than just flagging errors, Synapse guides users through *why* a bug exists — root-cause analysis, hidden assumptions, and corrective intuition — so the same mistake never happens twice.

---

## Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Animation | lottie-react |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Inter, Playfair Display (Google Fonts) |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 8 |
| Authentication | JWT + bcryptjs |
| AI | Google Gemini 2.5 Flash |
| Config | dotenv, cors |

---

## Project Structure

```
synapse/
├── index.html                 # Vite HTML entry point
├── vite.config.js             # Vite + React plugin config
├── package.json               # Frontend dependencies
│
├── src/                       # Frontend source
│   ├── main.jsx               # React root — BrowserRouter + AuthProvider
│   ├── App.jsx                # Route declarations + ProtectedRoute guard
│   ├── config.js              # API base URL constant
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # JWT auth state (login / logout / token hydration)
│   │
│   ├── components/
│   │   ├── Navbar.jsx         # Responsive top navigation
│   │   └── MarkdownRenderer.jsx  # Rich markdown renderer for AI review output
│   │
│   ├── pages/
│   │   ├── Landing.jsx        # Public marketing page (hero, stats, features, CTA)
│   │   ├── Login.jsx          # Login form + JWT persistence
│   │   ├── Signup.jsx         # Register form
│   │   ├── Dashboard.jsx      # Bug Library — search, filter, paginate reviews
│   │   ├── Reviewer.jsx       # Code paste → AI review page
│   │   ├── Collections.jsx    # View and create named Collections
│   │   └── CollectionDetail.jsx  # Individual Collection and its saved reviews
│   │
│   └── styles/
│       ├── global.css         # CSS variables, resets, shared utilities
│       └── landing-hero.css   # Landing page styles (hero, stats, features, CTA)
│
└── server/                    # Backend source
    ├── index.js               # Express app entry, DB connect, route mount
    ├── db.js                  # Mongoose connection helper
    ├── .env                   # Secrets — never commit this file
    ├── package.json           # Backend dependencies
    │
    ├── middleware/
    │   └── auth.js            # JWT verifyToken middleware
    │
    ├── models/
    │   ├── User.js            # User schema
    │   ├── Review.js          # Review schema
    │   └── Collection.js      # Collection schema
    │
    └── routes/
        ├── auth.js            # POST /api/auth/register and /api/auth/login
        ├── reviews.js         # GET / POST / DELETE /api/reviews
        ├── collections.js     # GET / POST / DELETE /api/collections
        └── search.js          # GET /api/search?q=...
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas cloud URI)
- Google Gemini API Key — free at https://aistudio.google.com

### Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/synapse
GEMINI_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key
```

### Running the Backend

```bash
cd server
npm install
npm run dev      # development with nodemon
# or
npm start        # production
```

Backend runs on http://localhost:5000

### Running the Frontend

```bash
# from project root
npm install
npm run dev
```

Frontend runs on http://localhost:5173 (or next available port).

---

## Architecture

```
Browser (React SPA)
        |
        |  HTTP / REST
        v
Express Backend (port 5000)
   |-- /api/auth          JWT register + login
   |-- /api/reviews       CRUD for saved reviews
   |-- /api/collections   CRUD for collections
   |-- /api/search        Library search + StackOverflow + DuckDuckGo
   |-- /review            Proxies code to Google Gemini
        |
        |-- MongoDB (Mongoose)
        |       |-- users
        |       |-- reviews
        |       |-- collections
        |
        |-- Google Gemini 2.5 Flash API
```

---

## Frontend Pages and Components

### Landing.jsx — Public Marketing Page

The landing page is the first thing visitors see. It is built with a dark glassmorphism aesthetic and includes:

- **Hero section**: Full-viewport layout with cursor-driven parallax using `requestAnimationFrame` and linear interpolation. The Lottie "Mapping for Machine Learning" animation renders on the right side over a transparent background, with floating glassmorphism status cards (Debugging, AI Ready, Analyzing, Solved).
- **Stats strip**: Animated row showing key numbers — 100% Responsive, 98% Bug Clarity Rate, 10x Faster Root-Cause, Free Sessions.
- **Features section**: Six-card "Why Synapse" grid covering Socratic Reasoning, Root-Cause Analysis, Persistent Library, Instant AI Review, Smart Collections, and Private and Secure.
- **CTA section**: Conversion-focused bottom section with ambient gradient orbs, a trust strip (Free forever, No credit card, 60s setup), and dual CTAs.

### Login.jsx and Signup.jsx

Standard auth forms. On success the JWT is saved through AuthContext and the user is redirected to `/library`.

### Dashboard.jsx — Bug Library

The `/library` page is a curated, searchable collection of **8 real-world bug patterns** with deep educational analysis. It is not a list of user-submitted reviews — it is a hand-curated reference library built into the app.

Each bug card contains:
- **Title** — a descriptive name (e.g. "The Phantom Re-render", "The N+1 Query")
- **Tags** — technology category (React, JavaScript, Database, Node.js, Networking, CSS, General)
- **Difficulty** — Beginner / Intermediate / Advanced
- **Description** — what the bug looks like in the wild
- **Analysis modal** — clicking a card opens a full deep-dive with:
  - Root Cause explanation
  - Recommended Fix
  - Annotated Code example comparing the broken vs. fixed approach

**Filtering and search:**
- Tag filter bar lets users browse by category
- Search input filters the local cards by title, description, and tags
- Typing a query and pressing **Enter** fires a live web search:
  - StackOverflow — top 8 relevant questions ranked by score and answer count
  - DuckDuckGo Instant Answer — concise summary + source link
  - DuckDuckGo Related Topics — up to 5 topic chips
- When web results are active, local cards switch to compact grid mode so both fit on screen
- A Clear button dismisses the web results and returns to normal card view

### Reviewer.jsx — AI Code Review

A two-panel page that is the core product experience:

**Left panel — Code Input:**
- Monospace textarea for pasting any code snippet
- "Review with Gemini →" button submits to `POST /review`
- Animated loading dots while Gemini processes

**Right panel — Analysis Output:**
- AI review rendered by `MarkdownRenderer` (code blocks, lists, headings)
- A **Save review** button appears after a review is returned (only if logged in)
- Clicking Save reveals a panel with a Collection dropdown (fetched from `/api/collections`)
- User can assign the review to an existing Collection or save it standalone
- On success, a green confirmation badge replaces the save panel

### Collections.jsx and CollectionDetail.jsx

- **Collections**: lists all named groups such as React Bugs or Async Issues. New collections can be created inline.
- **CollectionDetail**: shows all reviews inside a specific collection rendered in full markdown.

### MarkdownRenderer.jsx

A custom React component that parses AI-generated markdown and renders code blocks with syntax awareness, numbered and bulleted lists, bold and italic text, blockquotes, and horizontal rules.

### Navbar.jsx

Responsive navigation bar with links to Library, Reviewer, and Collections. Displays auth state from AuthContext. Collapses on mobile.

---

## Backend API Reference

All protected routes require the header: `Authorization: Bearer <token>`

### Auth — /api/auth

| Method | Endpoint | Protected | Body | Response |
|---|---|---|---|---|
| POST | /api/auth/register | No | email, password | token, user |
| POST | /api/auth/login | No | email, password | token, user |

### Reviews — /api/reviews

| Method | Endpoint | Protected | Body or Params | Response |
|---|---|---|---|---|
| GET | /api/reviews | Yes | — | Array of user reviews |
| POST | /api/reviews | Yes | code, aiReview, collectionId (optional) | Created review |
| DELETE | /api/reviews/:id | Yes | — | Success message |

### Collections — /api/collections

| Method | Endpoint | Protected | Body or Params | Response |
|---|---|---|---|---|
| GET | /api/collections | Yes | — | Array of user collections |
| POST | /api/collections | Yes | name | Created collection |
| DELETE | /api/collections/:id | Yes | — | Success message |

### Search — /api/search

| Method | Endpoint | Protected | Query | Response |
|---|---|---|---|---|
| GET | /api/search | Yes | q=searchterm | stackoverflow[], ddg{}, related[] |

**Response shape:**

```json
{
  "stackoverflow": [
    {
      "title":   "Question title",
      "url":     "https://stackoverflow.com/questions/...",
      "tags":    ["javascript", "react"],
      "score":   42,
      "answers": 7,
      "answered": true,
      "views":   15000
    }
  ],
  "ddg": {
    "text":   "Concise summary from DuckDuckGo",
    "source": "MDN Web Docs",
    "url":    "https://developer.mozilla.org/..."
  },
  "related": [
    { "title": "Related topic text", "url": "https://..." }
  ]
}
```

**Data sources (both free, no API key required):**
- StackOverflow — `api.stackexchange.com/2.3/search/advanced` with relevance sorting, top 8 results
- DuckDuckGo — `api.duckduckgo.com` Instant Answer API for abstract text and related topics

### AI Review — /review

| Method | Endpoint | Protected | Body | Response |
|---|---|---|---|---|
| POST | /review | No | code | review (markdown string) |

---

## Database Models

### User

```js
{
  email:        String, // unique, required
  passwordHash: String, // required
  createdAt:    Date,
  updatedAt:    Date
}
```

### Review

```js
{
  userId:       ObjectId, // ref: User, required
  code:         String,   // required
  aiReview:     String,   // required
  collectionId: ObjectId, // ref: Collection, optional
  createdAt:    Date,
  updatedAt:    Date
}
```

### Collection

```js
{
  userId:    ObjectId, // ref: User, required
  name:      String,   // required
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

```
1. User registers
   → Password hashed with bcryptjs (10 salt rounds)
   → User document saved to MongoDB
   → JWT signed with { userId } payload + JWT_SECRET
   → Token returned to client

2. User logs in
   → Email looked up in database
   → Password compared with bcryptjs.compare()
   → New JWT signed and returned

3. Client stores token in localStorage via AuthContext
   → AuthContext reads from localStorage on app load (token hydration)
   → All Axios requests attach: Authorization: Bearer <token>

4. Protected backend routes run verifyToken middleware
   → JWT decoded → req.user = { userId } attached
   → 401 returned if token is missing or invalid
```

---

## AI Integration (Google Gemini)

Synapse uses **Google Gemini 2.5 Flash** for code review — Google's fast, cost-efficient multimodal model.

**Endpoint:** POST /review

**Prompt:**
```
Review this code:
<user pasted code>
```

The model responds with structured markdown covering:
- Code summary
- Identified bugs and issues
- Root-cause explanation
- Suggested fix
- Best practice recommendations

The markdown string is returned to the client and rendered by MarkdownRenderer.jsx.

**To switch models**, edit `server/index.js`:

```js
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// Options: "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-pro" etc.
```

---

## Design System

The UI uses a centralized CSS variable system defined in `src/styles/global.css`:

```css
:root {
  --bg:      #07071a;           /* Deep navy background */
  --surface: #0d0d2b;           /* Card / surface background */
  --purple:  #7c3aed;           /* Primary brand purple */
  --accent:  #6366f1;           /* Indigo accent */
  --blue:    #2563eb;           /* Secondary blue */
  --text:    #e2e8f0;           /* Primary text */
  --muted:   #94a3b8;           /* Secondary / muted text */
  --border:  rgba(255,255,255,0.08);
}
```

**Visual language highlights:**

- **Glassmorphism** — backdrop-filter blur with semi-transparent surfaces and subtle white borders
- **Mesh gradients** — multi-layered radial gradients for atmospheric depth behind sections
- **Micro-animations** — CSS keyframe animations for floating cards, pulsing glow rings, cursor blink effects
- **Parallax** — JavaScript requestAnimationFrame with lerp-based mouse tracking on the hero
- **Lottie** — lottie-react vector animation for the hero character (transparent background, purple drop-shadow glow)
- **Typography** — Inter for UI and body text, Playfair Display for display headings; clamp() for fluid sizing

---

## Key Features

| Feature | Description |
|---|---|
| AI Code Review | Paste any code snippet and receive an instant Gemini analysis in markdown |
| Save to Library | Save AI reviews to your personal library with optional Collection assignment |
| Curated Bug Library | 8 educational bug patterns with root-cause analysis, fix, and code examples |
| Tag Filtering | Filter the bug library by React, JavaScript, Database, Node.js, CSS, and more |
| Web Search on Enter | Press Enter in the search bar to query StackOverflow + DuckDuckGo instantly |
| Collections | Organise saved reviews by project, language, or topic |
| Full-Text Search | Filter the local bug library by title, description, and tags |
| JWT Authentication | Secure login and register with bcrypt-hashed passwords |
| Markdown Rendering | AI output rendered with code blocks, lists, and headings |
| Premium Landing Page | Dark glassmorphism design with Lottie animation and parallax |
| Fully Responsive | Works across mobile, tablet, and desktop |

---

## Scripts

### Frontend (project root)

```bash
npm run dev       # Start Vite dev server with hot reload
npm run build     # Build production bundle to /dist
npm run preview   # Preview the production build locally
```

### Backend (/server)

```bash
npm run dev       # Start with nodemon (auto-restarts on save)
npm start         # Start with node (production mode)
```

---

## License

MIT

---

Built with React, Express, MongoDB, and Google Gemini.
