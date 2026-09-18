# Gemini AI Clone — Full Stack Web Application

A full-stack, responsive AI web application clone (inspired by Google Gemini and ChatGPT) built with **Vite, React.js, Tailwind CSS, Express.js, Node.js, Google Gemini API, Supabase Auth & Database, and Postman**.

---

## 🌟 Key Features

- **Google Gemini API Integration**: Real-time Server-Sent Events (SSE) streaming with `@google/genai` supporting `gemini-3.8-flash`, `gemini-3.5-flash-lite`, and `gemini-3.1-pro-preview`.
- **API Key Management**: Support for setting your Gemini API key directly in the UI Settings modal (sent securely via `x-gemini-api-key` header) or on the backend via `server/.env`.
- **Make Your Own AI**: Custom AI assistant persona creator with custom system prompts, icons, accent colors, and temperature tuning.
- **Supabase Authentication & Database**: Sign up, Sign in, and sync chat conversations to PostgreSQL with Row Level Security (RLS).
- **Zero-Config Guest / Local Mode**: Works instantly out of the box with local storage fallback if Supabase credentials are not entered yet.
- **Rich Markdown & Code Highlighting**: Code blocks with syntax formatting, language badges, and 1-click copy to clipboard.
- **Postman Collection & Environment**: Ready-to-import Postman v2.1 collection to test health, models, chat completions, streaming, and custom assistants.

---

## 🏗️ Project Architecture

```
Antigrivity/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Header, Sidebar, ChatArea, ChatMessage, ChatInput, Modals
│   │   ├── context/            # AuthContext (Supabase) & ChatContext (Gemini Streaming)
│   │   ├── supabaseClient.js   # Supabase client supporting runtime config & fallback
│   │   ├── App.jsx             # Main app container
│   │   ├── main.jsx            # React root with providers
│   │   └── index.css           # Tailwind directives & typography
│   ├── index.html
│   ├── vite.config.js          # Dev server with /api proxy to port 5000
│   └── package.json
│
├── server/                     # Backend (Node.js + Express.js)
│   ├── src/
│   │   ├── routes/             # chat, models, assistants
│   │   ├── services/gemini.js  # @google/genai SDK integration
│   │   ├── middleware/         # errorHandler
│   │   └── index.js            # Express app & health check
│   ├── .env.example
│   └── package.json
│
├── postman/                    # Postman Testing Suite
│   ├── Gemini_AI_Clone.postman_collection.json
│   ├── Gemini_AI_Clone.postman_environment.json
│   └── README.md
│
├── supabase/                   # Database & Auth
│   ├── schema.sql              # PostgreSQL schema with RLS policies
│   └── README.md
│
└── package.json                # Root monorepo scripts (concurrently)
```

---

## 🚀 Quick Start

### 1. Run Both Frontend and Backend Concurrently
From the root folder:
```bash
npm run dev
```
This runs:
- **Express Backend**: [http://localhost:5000](http://localhost:5000)
- **Vite Frontend**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Supplying Your Gemini API Key

You can configure your Gemini API Key in two ways:

1. **In the Web App UI (Instant)**:
   - Click the **Settings ⚙️** icon in the top-right corner.
   - Paste your API key from [Google AI Studio](https://aistudio.google.com/).
   - Click **Save Changes**.

2. **In `server/.env`**:
   - Create `server/.env`:
     ```env
     PORT=5000
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

---

## ⚡ Supabase Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and execute the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy your **Project URL** and **Anon Key** from Project Settings > API.
4. Paste them into the **Settings ⚙️** modal inside the running web app.

---

## 📮 Postman Collection

1. Open Postman.
2. Click **Import** and select:
   - `postman/Gemini_AI_Clone.postman_collection.json`
   - `postman/Gemini_AI_Clone.postman_environment.json`
3. Set the active environment to **Gemini AI Clone - Local Environment**.
4. Add your `gemini_api_key` variable value and run the requests!
