# Supabase Setup Guide: Gemini AI Clone

This project uses **Supabase** for:
- **User Authentication**: Sign Up, Sign In, Sign Out, and User Profiles (via Supabase Auth).
- **PostgreSQL Database**: Persistent chat conversations, message history, and custom AI assistant personas.
- **Row Level Security (RLS)**: Enforces that each user only sees and modifies their own conversations and messages.

> **Note**: The web app includes a built-in **Guest / Local Mode**. It will work right away even before you configure Supabase! Once you link your Supabase project, your chats will automatically sync to your database.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New Project**, choose an organization, project name (e.g. `gemini-ai-clone`), and database password.
3. Wait ~1-2 minutes for your project to provision.

---

## 2. Run the SQL Migration

1. In your Supabase Dashboard, navigate to **SQL Editor** from the left sidebar.
2. Click **New Query**.
3. Copy the full contents of [`supabase/schema.sql`](file:///c:/Users/LENOVO/OneDrive/Documents/Antigrivity/supabase/schema.sql).
4. Paste it into the SQL Editor and click **Run** (or press Ctrl + Enter).
5. You should see `Success. No rows returned`.
6. Verify under **Table Editor** that you now have:
   - `conversations`
   - `messages`
   - `custom_assistants`

---

## 3. Retrieve Your Supabase API Keys

1. In your Supabase project dashboard, click the gear icon (**Project Settings**) in the left sidebar.
2. Navigate to **API** under Configuration.
3. Find:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys**: Copy the `anon` / `public` key.

---

## 4. Connect to the Gemini AI Clone App

You can connect your Supabase project in two easy ways:

### Option A: Via the Web UI Settings (Recommended & Instant)
1. Launch the web application (`npm run dev`).
2. Click the ⚙️ **Settings** button in the top-right corner.
3. Paste your **Supabase Project URL** and **Supabase Anon Key** into the Supabase configuration section.
4. Click **Save Settings**.
5. Click **Sign In** in the top bar to create an account or log in!

### Option B: Via `.env` File
Create or update `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000
```
