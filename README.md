# 🎓 ConceptBridge — AI-Powered EdTech Platform

> An intelligent learning platform for Indian competitive exam aspirants — powered by Gemini AI and Supabase.

![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-FF6F00?style=flat-square&logo=google)

---

## 📌 About

**ConceptBridge** bridges the gap between identifying mistakes and understanding the underlying concept prerequisites. It helps students preparing for **JEE, NEET, UPSC, MHT-CET, GATE, and CAT** by providing a personalized, AI-driven learning experience.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Tutor Chat** | Ask any topic and get a structured breakdown — definition, explanation, formulas, related topics & practice MCQs |
| 📊 **Performance Analytics** | Track accuracy, streaks, weak topics & score progression with visual charts |
| 📝 **AI Notes Generator** | Auto-generates crystal-clear study notes from your practice mistakes |
| 🧩 **Concept Graph** | Interactive D3.js visualization of concept dependencies and mastery levels |
| 🎯 **Adaptive Practice** | Smart MCQ engine with AI-generated questions tailored to your weak areas |
| 🗺️ **Learning Path** | Personalized step-by-step roadmap with time estimates for any topic |
| 🔐 **Google Auth** | Secure login via Supabase Google OAuth |
| 🌙 **Dark / Light Mode** | Fully theme-aware UI |

---

## 🛠️ Tech Stack

- **Frontend** — React 19, Vite 8, Framer Motion, Tailwind CSS v4
- **Charts & Visuals** — Recharts, D3.js
- **Icons** — Lucide React
- **Auth & Database** — Supabase (Google OAuth + PostgreSQL)
- **AI** — Google Gemini 2.0 Flash API

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/vishakha2912/EdTech.git
cd EdTech
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Set up the database
- Go to your [Supabase Dashboard](https://supabase.com)
- Open the **SQL Editor**
- Run the contents of `supabase_schema.sql`

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
EdTech/
├── public/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # App shell, navbar, sidebar
│   ├── data/
│   │   └── questions.json      # Static question bank (JEE, NEET, etc.)
│   ├── lib/
│   │   ├── ai.js               # Gemini AI integration (tutor, notes, analytics)
│   │   ├── supabase.js         # Supabase client
│   │   └── ThemeContext.jsx    # Dark/light theme context
│   ├── pages/
│   │   ├── Landing.jsx         # Auth / landing page
│   │   ├── Onboarding.jsx      # New user exam selection
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Chat.jsx            # AI Tutor chat
│   │   ├── Practice.jsx        # MCQ practice engine
│   │   ├── Result.jsx          # Post-practice result & analysis
│   │   ├── AINotes.jsx         # AI-generated study notes
│   │   ├── Analytics.jsx       # Performance analytics
│   │   ├── ConceptGraph.jsx    # Concept dependency graph
│   │   ├── StudyMaterial.jsx   # Topic study sheets
│   │   ├── ExamSelector.jsx    # Exam/subject selection
│   │   └── AdminDashboard.jsx  # Admin panel (premium requests)
│   ├── App.jsx                 # Routes
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles & design tokens
├── supabase_schema.sql         # Database schema
├── .env.example                # Environment variable template
├── index.html
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is part of an academic/hackathon submission.

---

Built with ❤️ by [Raj](https://github.com/rajsangle1012)
