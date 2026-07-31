# 🌱 AgriNova AI — Smart Farming Portal

A startup-quality, AI-powered smart farming portal built for Indian farmers. Real-time weather, AI crop recommendations, plant disease detection, live market prices, an AI farming assistant, government schemes, and more — all in one beautiful, responsive web app.

## Features

- **Authentication** — Email/password and Google login via Supabase Auth, with auto-created user profiles
- **Smart Dashboard** — Live weather, farming advice, today's tasks, market highlights, notifications, and quick actions
- **Real-Time Weather** — Live data from Open-Meteo API with GPS or city search, plus AI farming recommendations
- **Smart Crop Recommendation** — AI suggests the best crop based on state, district, season, soil, water, and budget
- **Plant Disease Detection** — Upload a crop photo for AI disease diagnosis with organic and chemical treatments
- **Live Market Prices** — Daily crop prices with trend charts, best markets, and price history
- **AI Farming Assistant** — ChatGPT-style chat powered by Gemini AI with voice input support
- **Government Schemes** — Latest agriculture schemes with eligibility, benefits, documents, and apply links
- **Farm Calendar** — Month-by-month sowing, irrigation, fertilizer, and harvest activities
- **Irrigation Planner** — Crop-specific irrigation schedules based on soil and weather
- **Fertilizer Advisor** — NPK, organic, and chemical fertilizer recommendations by growth stage
- **Agriculture News** — Latest farming news with categories and search
- **Multi-Language** — English and Hindi with a language switcher
- **Voice Input** — Browser speech recognition for the AI assistant
- **Global Search** — Search across crops, diseases, schemes, market, news, and weather
- **Profile & Settings** — Editable profile, dark mode, notification toggles, language preference
- **Admin Panel** — Manage messages, schemes, news, crop data, and notes
- **Contact** — Working contact form with messages saved to the database

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS with custom glassmorphism theme
- **Animations:** Framer Motion
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Backend:** Supabase (Auth + Firestore-style database + RLS policies)
- **Weather API:** Open-Meteo (free, no key required)
- **AI:** Google Gemini API (with local fallback)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

The following are pre-configured in the Supabase-provisioned environment:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_GEMINI_API_KEY` — (Optional) Google Gemini API key for AI assistant

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/          # Navbar, Footer, Layout
│   ├── ui/              # GlassCard, Skeleton, Spinner, etc.
│   └── ProtectedRoute.tsx
├── context/            # React contexts (Auth, Theme, Language, Toast)
├── hooks/              # Custom hooks (useCountUp, useSpeechRecognition, etc.)
├── lib/                # Supabase client + utilities
├── pages/              # Page components
│   └── auth/            # Login, Signup, ForgotPassword
├── services/           # API services + static data
└── types/              # TypeScript type definitions
```

## Design

Premium glassmorphism with dark green, emerald, and white tones. Fully responsive across desktop, tablet, and mobile. Smooth animations, hover effects, loading skeletons, and beautiful empty states throughout.

## License

Built for AgriNova AI. All rights reserved.
