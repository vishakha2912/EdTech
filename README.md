# ConceptBridge EdTech Platform

ConceptBridge is an AI-powered EdTech SaaS designed for Indian competitive exams like JEE, NEET, UPSC, and MHT-CET. It bridges the gap between identifying mistakes and understanding the underlying concept prerequisites.

## Features
- **AI Tutor Chat**: Personalized 24/7 AI assistance for complex problem solving.
- **Concept Graph**: Interactive visualization of concept dependencies and mastery.
- **Performance Analytics**: Detailed insights into accuracy, time per question, and growth trends.
- **Adaptive Practice**: Personalized practice sessions focusing on identified weak areas.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the Project**:
   ```bash
   npm run dev
   ```

4. **Database Setup**:
   Apply the schema provided in `supabase_schema.sql` to your Supabase project.

## Technologies Used
- **Frontend**: React, Vite, Framer Motion, Tailwind CSS, Lucide React, Recharts, D3.js.
- **Backend**: Supabase (Auth & Database).
- **AI Integration**: Designed for Claude API.

---

Built with ❤️ for aspirants.
