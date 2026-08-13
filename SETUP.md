# Setup Guide — MeetPulse

**GitHub Repository:** [https://github.com/Nithilaa0305/MeetPulse/tree/main](https://github.com/Nithilaa0305/MeetPulse/tree/main)

This document covers everything needed to run MeetPulse locally and deploy it to production.

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- A [Supabase](https://supabase.com) account (free tier is sufficient)
- API keys for at least one AI provider (OpenRouter or OpenAI, and Google Gemini)

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Nithilaa0305/MeetPulse.git
cd MeetPulse
```

### 2. Install Dependencies

Install frontend dependencies from the root:

```bash
npm install
```

Install backend dependencies separately (the server has its own `package.json`):

```bash
npm install --prefix server
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying the example below. Do not commit this file — it is already listed in `.gitignore`.

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=sk-or-v1-your_openrouter_or_openai_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SOCKET_URL=http://localhost:3001
```

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → `anon` public key |
| `VITE_OPENAI_API_KEY` | [OpenRouter](https://openrouter.ai/keys) (keys start with `sk-or-v1-`) or [OpenAI](https://platform.openai.com/api-keys) (keys start with `sk-`) |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_SOCKET_URL` | `http://localhost:3001` for local development |

### 4. Configure Supabase

#### Run the Database Schema

In your Supabase project, go to **SQL Editor** and run the contents of `supabase/schema.sql`. This creates all required tables, Row-Level Security policies, and triggers.

#### Create the Storage Bucket

In your Supabase project, go to **Storage** and create a new bucket named exactly `Materials`. Set it to **Public** so uploaded files are accessible via URL.

### 5. Start the Development Servers

```bash
npm run dev
```

This runs both services concurrently:

- **Frontend**: [http://localhost:5173](http://localhost:5173) (Vite)
- **Backend**: [http://localhost:3001](http://localhost:3001) (Socket.IO)

---

## Supabase: Enable Account Deletion (Optional)

The Settings page allows users to delete their account. This requires a Postgres function. Run the following in the Supabase SQL Editor if you want to enable this feature:

```sql
CREATE OR REPLACE FUNCTION delete_user()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;
```

---

## Production Deployment

MeetPulse is split into two services that must be deployed separately.

### Frontend — Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Use the following build settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. Add all `VITE_*` environment variables in the Vercel project settings (Project → Settings → Environment Variables). Set `VITE_SOCKET_URL` to your deployed backend URL.

The `vercel.json` file at the project root already includes the SPA rewrite rules required for React Router to work correctly on Vercel.

### Backend — Render / Railway / Fly.io

The `server/` directory is a self-contained Node.js application and can be deployed to any always-on hosting platform.

> **Important:** Vercel Serverless Functions do not support persistent WebSocket connections. The Socket.IO backend must be deployed on a separate, always-on service.

#### Deploying to Render (recommended for simplicity)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set the **Root Directory** to `server`.
3. Use the following settings:

| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `node index.js` |
| Environment | Node |

4. Once deployed, copy the service URL (e.g. `https://meetpulse-backend.onrender.com`).
5. Set this URL as `VITE_SOCKET_URL` in your Vercel project environment variables and redeploy the frontend.

---

## Project Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build the frontend for production |

---

## Common Issues

### "Cannot find package 'express'" on `npm run dev`

The backend dependencies have not been installed. Run:

```bash
npm install --prefix server
```

### Build fails with "Could not resolve ../lib/socket"

The `src/lib/socket.ts` file may be excluded from Git due to a `lib/` entry in `.gitignore`. Ensure the `.gitignore` entry reads `/lib/` (root-anchored) rather than `lib/` (which would match `src/lib/` as well). Then add and commit the file:

```bash
git add .gitignore src/lib/socket.ts
git commit -m "fix: track src/lib/socket.ts"
git push origin main
```

### AI features return fallback/simulated content

Check that your `VITE_OPENAI_API_KEY` and `VITE_GEMINI_API_KEY` are valid and have available credits. The platform falls back to static placeholder content if both providers fail.
