# Naturals AI — Project Summary
## Intelligent Salon Operations Platform

---

## Overview

Naturals AI is a full-stack-style React SPA built for an Indian salon chain. It is a multi-role operational platform that combines AI-powered hair analysis, guided service workflows, style previews, and a live manager intelligence dashboard — all in a single unified application with shared real-time state.

The app is designed around two user roles: **Stylists** (who use AI tools during client services) and **Managers** (who monitor all live activity across the salon floor).

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework, component tree |
| Vite | 5.0 | Dev server, bundler, env variable handling |
| React Router DOM | 7.x | Client-side routing, nested routes |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4 | Utility-first styling |
| PostCSS + Autoprefixer | — | CSS processing pipeline |
| Custom design tokens | — | Obsidian, gold, cream, warm, sage, ruby color palette |

Custom Tailwind tokens defined in `tailwind.config.js`:
- `obsidian` (#0D0C0A) — app background
- `gold` / `gold-muted` / `gold-light` (#C9A84C) — primary accent
- `cream-200 / cream-300` — text on dark backgrounds
- `warm-300 / warm-600 / warm-700 / warm-900` — muted text hierarchy
- `sage` (#4A7055) — manager/secondary accent
- `ruby` — error states

### Animation
| Technology | Version | Purpose |
|---|---|---|
| Framer Motion | 10.x | Page transitions, card animations, AnimatePresence |

Used for: page enter/exit transitions (y-axis slide + opacity), modal overlays, staggered card lists, heading rotations, progress bar fills, category flash effects in GuidedService.

### Data & Charts
| Technology | Version | Purpose |
|---|---|---|
| Recharts | 2.10 | Revenue area chart in Analytics and Manager Dashboard |
| localStorage | — | Client records persistence via clientStore |

### HTTP
| Technology | Version | Purpose |
|---|---|---|
| Axios | 1.x | Replicate API calls in AI Try-On (StylePreview) |
| fetch (native) | — | Gemini API calls in gemini.js |

### AI Integrations
| Service | Model | Usage |
|---|---|---|
| Google Gemini 2.0 Flash | `gemini-2.0-flash` | Text Q&A (AIChat), hair image analysis (HairAnalysis), revenue projection (Analytics) |
| Replicate / SDXL | `stability-ai/sdxl` | Hairstyle image-to-image generation (StylePreview) |
| Pollinations.ai | Flux model | Free fallback for style previews when Replicate token not set |

### Testing
| Technology | Version | Purpose |
|---|---|---|
| Vitest | 4.x | Test runner (Vite-native) |
| jsdom | 29.x | DOM environment for unit tests |
| @testing-library/react | 16.x | React component testing utilities |
| @testing-library/jest-dom | 6.x | Custom DOM matchers |

### Icons
- **Lucide React** 0.300 — all UI icons (consistent stroke-based icon set)

---

## Application Architecture

```
src/
├── main.jsx                  # App entry point, wraps in BrowserRouter
├── App.jsx                   # Route definitions, StylistShell component
├── index.css                 # Global styles, custom tokens, scrollbar
│
├── context/
│   └── SalonContext.jsx      # Centralized shared state (sessions, auth, activity log)
│
├── pages/
│   ├── RoleSelect.jsx        # Landing screen — choose Stylist or Manager portal
│   ├── StylistLogin.jsx      # Stylist profile picker + login form
│   ├── ManagerLogin.jsx      # Manager credentials login
│   ├── ManagerDashboard.jsx  # Live salon intelligence dashboard (manager view)
│   ├── Dashboard.jsx         # Stylist workspace overview (stylist view)
│   ├── HairAnalysis.jsx      # AI-powered hair consultation with image upload
│   ├── GuidedService.jsx     # Step-by-step service workflow with timers
│   ├── StylePreview.jsx      # AI hairstyle & color try-on
│   ├── Analytics.jsx         # Revenue charts, staff performance, AI projections
│   └── Login.jsx             # Legacy (unused, superseded by role-based login)
│
├── components/
│   ├── AIChat.jsx            # Floating AI assistant chat panel
│   └── ClientSelector.jsx    # Modal overlay for searching/adding clients
│
├── services/
│   ├── gemini.js             # Gemini 2.0 Flash API — text + vision, with offline fallback
│   ├── clientStore.js        # localStorage CRUD for client records
│   └── aiTryOn.js            # Replicate/Pollinations image generation
│
└── test/
    ├── setup.js              # jest-dom setup
    └── clientStore.test.js   # 15 unit tests for client data store
```

---

## Routing Structure

```
/                     → RoleSelect (portal selection)
/stylist              → StylistLogin (select profile + login)
/manager              → ManagerLogin
/manager/dashboard    → ManagerDashboard (protected, requires managerLoggedIn)
/*                    → StylistShell (protected, requires loggedInStylist)
  /dashboard          → Dashboard
  /analysis           → HairAnalysis
  /service            → GuidedService
  /style              → StylePreview
  /analytics          → Analytics
```

Route protection is enforced via `useEffect` guards that redirect to the login page if the auth state is missing from context.

---

## Shared State — SalonContext

Central React Context (`SalonProvider`) wraps the entire app and exposes:

### State
| Key | Type | Description |
|---|---|---|
| `loggedInStylist` | Object \| null | Currently authenticated stylist object |
| `managerLoggedIn` | boolean | Manager authentication flag |
| `sessions` | `{ [stylistId]: Session[] }` | Live service sessions per stylist |
| `activityLog` | ActivityEntry[] | Rolling log of salon events (max 25) |

### Stylists
Three pre-configured stylists with unique accent colors:
- **Aisha** (s1) — Senior Colorist, Balayage & Color Correction, gold (#C9A84C)
- **Priya** (s2) — Style Specialist, Hair Spa & Treatments, sage-green (#A0B89A)
- **Kavya** (s3) — Master Stylist, Precision Cuts & Blowouts, slate-blue (#7BA7BC)

### Functions
- `logActivity(stylist, text, type)` — appends to activity log with timestamp
- `updateSession(stylistId, sessionId, updates)` — update any session fields
- `completeSession(stylistId, sessionId)` — mark session done, 100% progress
- `addSession(stylistId, session)` — create a new session
- `getKPIs()` — derives live metrics: active clients, services running, avg progress, active stylists

---

## Features by Page

### RoleSelect
- Animated landing screen with two portal cards (Stylist / Manager)
- Hover lift + glow effects, arrow appears on hover
- Ambient radial background glows per role color

### StylistLogin
- Three stylist profile cards — click to select, highlights with accent color ring
- CheckCircle2 indicator on selected card
- Animated shift info strip appears on selection (AnimatePresence)
- Any username + password accepted (demo mode)
- Sets `loggedInStylist` in context, navigates to /dashboard

### ManagerLogin
- Sage color scheme with enterprise branding
- Live stats preview: Stylists Online, Active Services, Avg Completion
- Any credentials accepted, sets `managerLoggedIn`, navigates to /manager/dashboard

### Manager Dashboard
- Sticky topbar with logout
- Rotating contextual headings (8-second interval, AnimatePresence slide)
- **KPI cards**: Active Clients, Services Running, Avg Progress, Completed Today — live from `getKPIs()`
- **Stylist Workload Cards**: per-stylist session list with animated progress bars
- **Live Activity Feed**: real-time log with AnimatePresence, color-coded by type (service/step/ai)
- **Revenue sparkline**: Recharts AreaChart with custom tooltip
- **SOP Compliance**: per-stylist compliance score with motion-animated bars + AI note

### Stylist Dashboard
- Dynamic rotating headings (5 options, 8-second interval)
- Subtitle adapts: shows active session count if sessions exist
- AI Insight panel personalised to logged-in stylist's specialization
- **Today's Schedule**: shows stylist's own sessions from SalonContext with progress bars; falls back to clientStore clients if no sessions
- KPI row: Active Sessions, Clients, Revenue, Total Visits

### Hair Analysis (AI Consultation)
- Upload or drag-drop a hair photo
- Sends base64 image to **Gemini Vision** with client context (color history, allergies)
- Returns structured JSON: hair type, porosity, damage level, recommendations, color suggestion
- Loading state shows animated skeleton cards (animate-pulse)
- Client selector integration — pulls preferences/history to personalise the AI prompt
- Falls back gracefully if API is offline

### Guided Service
- Step-by-step workflow cards, one step visible at a time
- **Four workflow categories** with different step sequences:
  - **Color** (4 steps): Consultation → Application → Processing → Rinse & Style
  - **Bleach** (5 steps): Consultation → Strand Test → Application → Processing → Rinse & Tone
  - **Treatment** (4 steps): Consultation → Preparation → Application → Processing
  - **Other** (4 steps): Consultation → Assessment → Service → Finishing
- **Timer presets**: grouped by category (Color, Bleach, Treatment, Finishing), each with a specific duration
- Selecting a preset from a different category **switches the entire workflow** — steps reset, step card re-animates (keyed on `${category}-${step}`)
- Timer ring stroke color matches the active category color
- Category badge in header animates on switch (AnimatePresence)
- Progress bar fills with category color
- Logs activity to SalonContext on step advance

### Style Preview (AI Try-On)
- Upload a photo or use a sample
- Select hairstyle + color from preset grids
- Sends to **Replicate SDXL** (img2img) if token set, else **Pollinations.ai** (free, no key)
- Real-time generation with animated status states
- Shows before/after comparison
- Client selector integration

### Analytics
- Revenue area chart (Recharts) with weekly data
- Service breakdown bar showing top services
- Staff performance table: Aisha, Priya, Kavya — revenue and SOP score per stylist
- **AI Revenue Projection**: calls Gemini on mount with the week's revenue array, shows real AI projection text with a loading spinner

### AI Chat (Floating)
- Collapsible chat panel fixed to bottom-right
- Sends questions to **Gemini 2.0 Flash** with a salon-expert system prompt
- Keyword-based offline fallback (10 topic areas: toner, bleach, porosity, developer, grey coverage, etc.)
- Header indicator: grey dot = untested, green Wifi = Live AI, red WifiOff = Offline Mode
- Status updates after each message via `getApiStatus()`

### Client Selector
- Modal overlay with backdrop blur
- Real-time search against clientStore
- Add new client inline (name + phone)
- Selected client shown as badge in topbar and card in sidebar

---

## Client Data Store

localStorage-backed CRUD system (`salonpilot_clients_v2`):

**Seed clients** (Indian names):
- **Meera Kapoor** — 3 visits, Balayage history, sensitive scalp, Aisha's client
- **Rohan Verma** — 1 visit, PPD sensitivity, Priya's client
- **Sana Iyer** — 1 visit, extensions, going lighter

**API**:
- `getAllClients()` — returns all clients
- `getClient(id)` — single client lookup
- `searchClients(query)` — name search
- `addClient({ name, phone, email })` — creates new client with auto-initials
- `addVisit(clientId, visit)` — prepends a visit record
- `updatePreferences(clientId, prefs)` — merge preference updates
- `saveAnalysis(clientId, analysis)` — stores latest AI analysis result
- `isNewClient(id)` / `getVisitCount(id)` — utility helpers

---

## AI & Offline Behaviour

The Gemini integration is designed to degrade gracefully:
- Module-level `_apiStatus` flag (null / true / false) tracks live API state
- If API returns an error or network fails → keyword matching across 10 topic areas returns a curated expert answer
- AIChat header reflects current status visually
- Style Preview has a dual-path architecture: Replicate (premium) → Pollinations (free fallback)

---

## Environment Variables

```env
VITE_GEMINI_API_KEY=        # Google Gemini API key (required for live AI)
VITE_REPLICATE_TOKEN=       # Replicate.com token (optional, Style Preview)
```

---

## Tests

15 unit tests in `src/test/clientStore.test.js` covering:
- `getAllClients` — returns array, includes seed data
- `addClient` — creates client with correct fields, auto-generates initials
- `getClient` — lookup by id, returns null for unknown id
- `searchClients` — case-insensitive name search, empty query returns all
- `addVisit` — records visit, stores service name, returns null for unknown client
- `saveAnalysis` — stores analysis result, attached to correct client

Run with: `npm test`

---

## Scripts

```bash
npm run dev          # Start dev server (Vite, port 5173)
npm run build        # Production build to /dist
npm run preview      # Serve production build locally
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode
npm run test:ui      # Vitest browser UI
```

---

## Design System

All colours, spacing, and component classes are defined through Tailwind custom tokens and a global `index.css` utility layer:

- `.section-label` — uppercase tracking-widest muted label
- `.section-label-gold` — gold version of above
- `.badge` / `.badge-gold` — pill tags
- `.transition-base` — `transition-all duration-200`
- `.custom-scrollbar` — styled thin scrollbar for dark theme
- `.shadow-card-hover` — gold glow shadow on card hover
- `.text-2xs` — 10px text for secondary info
- `.tracking-luxury` — extra-wide letter spacing for badges

Font: system `font-display` stack for headings (serif-adjacent), system sans for body.
