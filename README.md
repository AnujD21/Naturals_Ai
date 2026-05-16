# Naturals AI — Salon Pilot Platform

A full-stack salon management PWA built for **Naturals Salon**, powered by **Google Gemini 2.5 Flash**. Designed for stylists and managers to run smarter, faster, and more profitably — on any device.

---

## Screenshots

> Live at: [github.com/AnujD21/Naturals_Ai](https://github.com/AnujD21/Naturals_Ai)

---

## Features

### For Stylists
| Feature | Description |
|---|---|
| **Overview Dashboard** | Live KPIs — active sessions, revenue, clients, visits. Real-time session tracking per stylist. |
| **AI Hair Consultation** | Upload or capture a photo via live camera. Gemini Vision analyses hair type, porosity, damage level, and recommends treatments. |
| **Guided Service Workflow** | Step-by-step protocols for Color, Bleach, and Treatment services with built-in countdown timer and safety checklist. |
| **Style Preview** | 25 AI-generated combinations of 5 hairstyles × 5 colors — let clients see their look before committing. |
| **AI Chat Assistant** | Multi-turn Gemini-powered Q&A for formulas, color correction, toner selection, and product advice. |
| **Weekly Training** | 6 professional courses covering Color Theory, Balayage, Hair Health, Client Consultation, Bleaching Safety, and Scalp Treatments — each with an interactive 5-question quiz. |

### For Managers
| Feature | Description |
|---|---|
| **Manager Dashboard** | Stylist workload cards, SOP compliance scores, real-time activity log, weekly revenue chart. |
| **Intelligence Analytics** | 7-day revenue trends, top services breakdown, staff performance leaderboard, AI-generated business projection. |
| **Revenue Tracking** | Automatic pricing per completed service — reflected per stylist and in store totals. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3, Framer Motion |
| Charts | Recharts |
| AI (text + vision) | Google Gemini 2.5 Flash |
| Routing | React Router DOM 6 |
| Database | Supabase (PostgreSQL) with localStorage fallback |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key — [get one free at aistudio.google.com](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/AnujD21/Naturals_Ai.git
cd Naturals_Ai

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Open .env and paste your Gemini key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

```env
# Required — Google Gemini API key
VITE_GEMINI_API_KEY=your_key_here

# Optional — Supabase for persistent DB (works without it using localStorage)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> `.env` is git-ignored. Never commit your API keys.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Login Credentials

| Role | Username | Password |
|---|---|---|
| Stylist | Select any stylist on the login screen | — |
| Manager | `manager` | `naturals2024` |

---

## Project Structure

```
src/
├── components/
│   ├── AIChat.jsx              # Floating multi-turn Gemini chat widget
│   └── ClientSelector.jsx      # Client search, add & history panel
├── context/
│   └── SalonContext.jsx        # Global state — sessions, revenue, activity log
├── pages/
│   ├── RoleSelect.jsx          # Entry screen — Stylist or Manager
│   ├── StylistLogin.jsx        # Stylist login
│   ├── ManagerLogin.jsx        # Manager login (Supabase-validated)
│   ├── Dashboard.jsx           # Stylist overview — KPIs, schedule, quick actions
│   ├── HairAnalysis.jsx        # Gemini Vision hair diagnostics + live camera
│   ├── GuidedService.jsx       # Step-by-step service workflow with timer
│   ├── StylePreview.jsx        # AI hairstyle try-on (25 combinations)
│   ├── Analytics.jsx           # Manager revenue & performance intelligence
│   ├── ManagerDashboard.jsx    # Manager ops view — workload, compliance, log
│   └── Training.jsx            # Weekly courses + interactive quiz system
└── services/
    ├── gemini.js               # Gemini API — chat, vision analysis
    ├── pricing.js              # Service price lookup (50+ services)
    ├── clientStore.js          # Async client DB (Supabase + localStorage)
    ├── db.js                   # Supabase operations
    └── supabase.js             # Supabase client initialisation

supabase/
└── schema.sql                  # Full DB schema with seed data
```

---

## Database Setup (Optional)

Without Supabase, the app runs fully on localStorage. To enable persistent data:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in your Supabase SQL editor
3. Add your project URL and anon key to `.env`

---

## Training Module

6 weekly courses, auto-rotated by current week of the year:

| Week | Course | Category |
|---|---|---|
| 1 | Color Theory Fundamentals | Color |
| 2 | Balayage & Freehand Techniques | Color |
| 3 | Hair Health & Damage Assessment | Treatment |
| 4 | Client Consultation Mastery | Consult |
| 5 | Bleaching Safety & Protocols | Bleach |
| 6 | Scalp Treatments & Retail | Treatment |

Each course includes 4 content sections with professional tips and a 5-question quiz (60% pass mark). Progress is saved per stylist.

---

## Responsive Design

Fully optimised for mobile and desktop:

- **Mobile** — bottom tab navigation, slide-in drawer sidebar, stacked layouts
- **Desktop** — fixed sidebar, full-width content, multi-column grids

---

## License

MIT
