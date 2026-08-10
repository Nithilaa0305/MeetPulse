# Tech Stack — MeetPulse

This document describes the technical architecture and technology choices behind MeetPulse.

---

## Architecture Overview

MeetPulse is split into two independently deployable services:

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│      Frontend (Vite/React)  │         │   Backend (Node.js / Express) │
│      Deployed on Vercel     │◄───────►│   Deployed on Render/Railway  │
└─────────────────────────────┘         └──────────────────────────────┘
              │                                         │
              └──────────────┬──────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │         Supabase             │
              │  Auth · PostgreSQL · Storage │
              └─────────────────────────────┘
```

**Frontend** handles all UI, routing, state, and AI API calls. It connects to the backend via Socket.IO for real-time session events.

**Backend** is a stateful Node.IO server that manages real-time session rooms. It holds in-memory session state (current slide, live transcript, poll state) so that participants who join late are immediately synced.

**Supabase** provides authentication, a hosted PostgreSQL database for persistent data (sessions, attendance), and object storage for uploaded materials.

---

## Frontend

| Concern | Technology |
|---|---|
| Framework | React 18 with TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Component Library | shadcn/ui (Radix UI primitives) |
| Animation | Motion (Framer Motion) |
| State Management | Zustand |
| Routing | React Router v7 |
| Form Handling | React Hook Form + Zod |
| Charts | Recharts |
| PDF Generation | jsPDF, @react-pdf/renderer |
| PPTX Rendering | @aiden0z/pptx-renderer |
| DOCX Rendering | docx-preview |
| PDF Parsing | pdfjs-dist |
| QR Codes | qrcode.react, html5-qrcode |

---

## Backend

| Concern | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| HTTP Server | Express 5 |
| WebSocket | Socket.IO 4 |
| CORS | cors |

The backend is intentionally minimal. It does not connect to a database. Its sole responsibility is routing real-time events between session participants in the correct Socket.IO room.

---

## Database — Supabase (PostgreSQL)

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles, extending Supabase `auth.users`. Stores role, org_type, and organisation name. |
| `organizations` | Organisation records for education or business contexts. |
| `groups` | Courses (education) or departments (business) belonging to an organisation. |
| `meetings` | Session records including title, status, presenter, materials (JSONB), and platform link. |
| `attendance` | Per-user attendance records for each meeting, including engagement score and join/leave times. |

Row-Level Security (RLS) is enabled on all tables.

### Storage

Materials uploaded by presenters (PDFs, PPTX files, DOCX files) are stored in a Supabase Storage bucket named `Materials` with public read access.

---

## AI Integrations

All AI calls are made directly from the frontend using `VITE_*` API keys. There is no AI proxy server.

| Feature | Primary Provider | Fallback Provider |
|---|---|---|
| Lecture summaries | OpenRouter (Gemma 4 31B) | Google Gemini |
| Study notes | OpenRouter (Gemma 4 31B) | Google Gemini |
| Quiz generation | OpenRouter (Gemma 4 31B) | Google Gemini (static fallback) |
| Question grouping (deduplication) | OpenRouter (Gemma 4 31B) | Google Gemini |
| In-session AI chatbot | Google Gemini | — |
| Speech-to-text (transcription) | Browser Web Speech API | — |

OpenRouter keys beginning with `sk-or-v1-` are detected automatically. Standard OpenAI keys (`sk-...`) are also supported and route directly to `api.openai.com`.

---

## Real-Time Event Model

All real-time communication uses Socket.IO rooms keyed by `sessionId`. The server stores the current state of each session in memory so late-joining participants receive an immediate sync on connection.

### Events (Presenter → Participants)

| Event | Payload | Description |
|---|---|---|
| `slide-change` | `sessionId, currentSlide, currentDocumentName` | Presenter moved to a new slide |
| `materials-update` | `sessionId, materials` | Presenter uploaded or changed materials |
| `transcription-status` | `sessionId, status` | Transcription started, paused, or stopped |
| `transcript-segment` | `sessionId, segment` | A new transcription segment was captured |
| `launch-poll` | `sessionId, question, options` | Presenter started a poll |
| `close-poll` | `sessionId` | Presenter closed the active poll |
| `launch-quiz` | `sessionId, quiz` | Presenter launched a quiz |
| `pulse-check` | `sessionId` | Presenter requested a pulse check |
| `student-alert` | `sessionId, type, studentName` | A student raised an alert |

### Events (Participants → Presenter)

| Event | Payload | Description |
|---|---|---|
| `submit-poll-vote` | `sessionId, optionIndex` | Participant cast a vote |
| `submit-quiz-answer` | `sessionId, questionId, isCorrect` | Participant answered a quiz question |
| `submit-pulse` | `sessionId, score` | Participant submitted a pulse score |
| `ask-question` | `sessionId, question` | Participant submitted a Q&A question |
| `send-reaction` | `sessionId, reactionType` | Participant sent an emoji reaction |

---

## State Management

Three Zustand stores manage application state:

| Store | Responsibility |
|---|---|
| `useAuthStore` | User identity, role (`superadmin`, `admin`, `presenter`, `participant`), org type (`education`, `business`), Supabase session |
| `useMeetingStore` | Live session state: current slide, transcript, questions, reactions, polls, quiz, pulse score, alerts |
| `useDataStore` | Persistent data fetched from Supabase: sessions, students, lecturers, courses, employees |

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deployed from `main` branch. `vercel.json` includes SPA rewrite rules. |
| Backend | Render / Railway / Fly.io | Any always-on Node.js host. Vercel Serverless Functions do not support persistent WebSocket connections. |
| Database | Supabase | Managed PostgreSQL, globally distributed. |
| Storage | Supabase Storage | Uploaded presentation materials. |
