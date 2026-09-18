# Postman Collection Guide: Gemini AI Clone API

This directory contains the ready-to-import Postman Collection and Environment for testing the Gemini AI Clone Express backend and Google Gemini API integration.

## Files Included

1. **`Gemini_AI_Clone.postman_collection.json`** - Full collection of endpoints:
   - `GET /api/health` - Health check & server API key configuration status.
   - `GET /api/models` - List of supported Gemini models (`gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro-preview`).
   - `POST /api/chat` - Standard JSON chat completion with system instructions and temperature.
   - `POST /api/chat/stream` - Server-Sent Events (SSE) streaming chat completion.
   - `GET /api/assistants` - List preset and user-created custom AI assistants.
   - `POST /api/assistants` - Create a custom AI assistant persona.
   - `DELETE /api/assistants/:id` - Delete a custom AI assistant persona.

2. **`Gemini_AI_Clone.postman_environment.json`** - Pre-configured variables:
   - `base_url`: `http://localhost:5000`
   - `gemini_api_key`: Your Google Gemini API Key.

---

## How to Import & Use in Postman

### Step 1: Import Files into Postman
1. Open the Postman desktop application or web app.
2. Click **Import** in the top-left corner.
3. Drag and drop both `Gemini_AI_Clone.postman_collection.json` and `Gemini_AI_Clone.postman_environment.json` into Postman.

### Step 2: Select Environment & Configure API Key
1. In the top-right environment dropdown, select **Gemini AI Clone - Local Environment**.
2. Click the quick look (eye icon) next to the environment dropdown, or open Environments.
3. In the `gemini_api_key` variable value, paste your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/)).
4. Save the environment changes.

### Step 3: Run the Backend
Ensure the Express backend is running:
```bash
npm --prefix server run dev
```

### Step 4: Execute Requests
1. Run **Check Server Health & API Key Status** to confirm `status: healthy`.
2. Run **Chat Completion (Non-Streaming)** to see Gemini AI answer your prompt.
3. Run **Chat Completion (SSE Streaming)** to see real-time streaming chunks!
