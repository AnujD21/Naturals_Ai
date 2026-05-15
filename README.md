# Naturals AI — Salon Pilot

An intelligent salon operations platform powered by Google Gemini AI. Streamlines client consultations, guided service workflows, AI hair analysis, style previews, and manager analytics — all in a single luxury-themed dashboard.

## Features

- **AI Hair Analysis** — Upload a client photo; Gemini Vision identifies hair type, porosity, damage level, and recommends treatments
- **Guided Service Workflow** — Step-by-step color service guide with built-in timer and audit log
- **Style Preview (AI Try-On)** — Generate hairstyle previews for clients before committing to a look
- **AI Chat Assistant** — In-app Gemini-powered Q&A for formulas, correction techniques, and product advice
- **Intelligence Dashboard** — Revenue charts, top services, staff leaderboard, and live AI projections (Manager role)
- **Client Records** — Searchable client database with visit history, color history, and allergy tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3, Framer Motion |
| Charts | Recharts |
| AI (text + vision) | Google Gemini 2.0 Flash |
| AI (image generation) | Pollinations.ai / Replicate SDXL |
| Routing | React Router DOM 6 |
| Data | localStorage (client-side, demo) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd salon-pilot-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env` file in the project root (never commit this file):

```env
# Required — Google Gemini API key for hair analysis and AI chat
VITE_GEMINI_API_KEY=your_key_here

# Optional — Replicate API token for higher-quality style previews
# Without this, Pollinations.ai is used as a free fallback
VITE_REPLICATE_TOKEN=your_token_here
```

### Build for Production

```bash
npm run build
npm run preview
```

## Roles

| Role | Access |
|---|---|
| **Stylist** | Dashboard, AI Consultation, Guided Service, Style Preview, AI Chat |
| **Director** | All of the above + Intelligence Analytics |

## Running Tests

```bash
npm run test
```

## Project Structure

```
src/
├── components/
│   ├── AIChat.jsx          # Floating Gemini-powered chat widget
│   └── ClientSelector.jsx  # Client search & management modal
├── pages/
│   ├── Login.jsx           # Role-based login
│   ├── Dashboard.jsx       # Overview with live KPIs and schedule
│   ├── HairAnalysis.jsx    # Gemini Vision hair diagnostics
│   ├── GuidedService.jsx   # Step-by-step color service workflow
│   ├── StylePreview.jsx    # AI hairstyle try-on
│   └── Analytics.jsx       # Manager revenue & performance intelligence
└── services/
    ├── gemini.js           # Gemini API integration (text + vision)
    ├── aiTryOn.js          # Style preview image generation
    └── clientStore.js      # localStorage client database
```

## License

MIT
