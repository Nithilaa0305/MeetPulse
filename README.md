# MeetPulse

**GitHub Repository:** [https://github.com/Nithilaa0305/MeetPulse/tree/main](https://github.com/Nithilaa0305/MeetPulse/tree/main)
**Video Submission:** [https://youtu.be/-z7bS4OsIfM](https://youtu.be/-z7bS4OsIfM)

**MeetPulse** is an AI-powered meeting intelligence platform that transforms presentations into interactive, measurable, and data-driven conversations. It works alongside the video conferencing tools your organisation already uses — Zoom, Microsoft Teams, or Google Meet — and adds the intelligence layer that those platforms are missing.

---

## What is MeetPulse?

Most presentations are one-way broadcasts. Engagement is guessed at, not measured. Questions get lost. Nobody knows if the audience actually understood the material.

MeetPulse solves this by running alongside your existing meeting. Presenters share their slides through MeetPulse, participants join with a QR code or meeting ID — no account required — and everything that happens during the session is captured, measured, and analysed in real time.

After the session, MeetPulse generates AI summaries, study notes, action items, and analytics reports that would otherwise take hours to produce manually.

---

## Who is it for?

MeetPulse serves two distinct contexts:

### Education

For universities, colleges, and training institutions where lecturers present to classes of students.

- **Administrators** manage students, lecturers, and courses. They monitor institution-wide attendance and engagement, compare lecturer performance, and export analytical reports.
- **Lecturers / Presenters** run live sessions with real-time slide control, audience engagement tools, AI transcription, and post-session summaries.
- **Students / Participants** follow live slides, ask questions, respond to polls and quizzes, and receive AI-generated study notes after class.

### Business

For organisations where managers and team leads present to employees in meetings, town halls, or training sessions.

- **Administrators** oversee department-level participation and task engagement metrics.
- **Presenters** run structured meetings with live engagement features identical to the education context.
- **Employees** participate in the session and access post-meeting summaries and action items.

---

## Core Features

### Authentication & Access Control

Account creation is restricted to ensure organizational security. A person can sign up for an account (as a presenter or administrator) **only if they have been explicitly added to the system by an admin**. Participants joining a live session do not need an account.

### Real-Time Presentation Engine

Presenters upload their materials — PDF, PPTX, or DOCX — and MeetPulse renders them inside the platform. Slide navigation is broadcast live to all participants, who follow in real time. Participants can temporarily detach from the presenter's view to review an earlier slide and re-sync with one click.

### Live Audience Engagement

During a session, the presenter has access to:

- **Live Q&A** — Participants submit questions at any time. MeetPulse uses AI to automatically group similar questions together so the presenter is not overwhelmed by duplicates.
- **Polls** — The presenter launches a poll mid-session to gather immediate feedback. Votes are collected and displayed in real time.
- **Quizzes** — AI-generated multiple-choice quizzes, derived automatically from the session's transcript and presentation materials, are sent to participants to test comprehension. Results are reported to the presenter immediately.
- **Pulse Checks** — Quick comprehension checks that surface confusion or confidence levels across the audience.
- **Reactions** — Participants send emoji reactions that appear on the presenter's view, providing instant ambient feedback.

### AI Transcription and Summaries

MeetPulse captures a live transcript of the session using the browser's speech recognition API. At the end of the session:

- A **lecture summary** is generated — a structured, readable recap of what was covered.
- **Study notes** are generated for participants — formal definitions, key concepts, and examples based on the material presented.
- An **AI chatbot** is available to participants during the session. It actively reads the uploaded PDF materials and session transcript to accurately answer specific questions about the presentation content in real time.

These AI features are powered by OpenRouter (Gemma), OpenAI (GPT-4o-mini), and Google Gemini, with automatic fallback between providers.

### Smart Attendance

Attendance in MeetPulse is not a binary present/absent check. An engagement score is calculated for each participant based on their actual session activity: questions asked, polls responded to, reactions sent, slides interacted with, and time spent active. This gives administrators a far more accurate picture of who was genuinely engaged versus who simply had the tab open.

### Analytics

Session analytics are available to both presenters and administrators:

- Engagement trend charts over the course of a session
- Per-slide attention heatmaps
- Q&A and poll response breakdowns
- Lecturer performance comparison (education)
- Department participation tracking (business)
- Exportable PDF reports

---

## How Participants Join

Participants do not need a MeetPulse account. They join a session by:

1. Scanning a QR code displayed by the presenter, or
2. Entering a meeting ID on the join page (`/join`).

They are immediately taken into the live session with full access to slides, Q&A, polls, and reactions.

---

## Hackathon Submission Details

### Tech Stack Used
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand
- **Backend:** Node.js, Express, Socket.IO
- **Database & Auth:** Supabase (PostgreSQL, Storage)
- **AI Integrations:** OpenRouter (Gemma 4), Google Gemini, Web Speech API

### Deployment Details
- **Frontend:** Local Development (Vite)
- **Backend:** Local Development (Node.js/Socket.IO)
- **Database:** Supabase Managed PostgreSQL (Note: Live deployment via Vercel was omitted due to synchronization limitations with serverless websockets).

### Architecture / System Overview
```text
┌─────────────────────────────┐         ┌──────────────────────────────┐
│      Frontend (Vite/React)  │         │   Backend (Node.js / Express) │
│          (Local)            │◄───────►│          (Local)              │
└─────────────────────────────┘         └──────────────────────────────┘
              │                                         │
              └──────────────┬──────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │         Supabase             │
              │  Auth · PostgreSQL · Storage │
              └─────────────────────────────┘
```
The application uses a separated architecture where the frontend handles all UI, state, and direct AI API calls. The backend acts as a minimal stateful WebSocket server for real-time synchronization between presenters and participants. Supabase provides persistent storage and authentication. We do not use hardware/IoT input; all interactions occur via the web application.

### Technical Challenges & Creative Solutions
- **Real-Time Synchronization:** Ensuring late-joining participants sync perfectly to the ongoing session. We solved this by using an in-memory session state on the backend to immediately broadcast current state upon connection.
- **AI Provider Resiliency:** Relying on single AI providers can lead to failure. We implemented an automatic fallback mechanism between OpenRouter and Google Gemini to guarantee summary generation.
- **Meaningful Attendance:** Traditional attendance is a binary state. We engineered an engagement score algorithm that evaluates actual interaction (polls, Q&A, reactions) for a richer participation metric.
- **Client-Side Document Rendering:** Processing PDFs and slides on the server is expensive. We leveraged `pdfjs-dist` and other client-side libraries to render materials directly in the browser, minimizing server cost and latency.

### Scope Delivered
- **Fully Implemented:** Real-time presentation engine, live audience engagement tools, AI transcription & summaries, smart attendance, role-based dashboards.
- **Partially Implemented:** Native PPTX/DOCX rendering is functional but may have formatting limitations on complex files (converted to PDF/Canvas when needed).
- **Not Implemented by Choice:** Integration with external calendar systems (e.g., Google Calendar) was omitted to focus entirely on the live session experience.
- **Future Implementation:** In-app video calling to remove the need for external tools like Zoom or Google Meet entirely.

### Anything Else Judges Should Note
- **API Keys:** The AI features (summaries, chatbot, quizzes) require valid OpenRouter or Gemini API keys configured in the `.env` file to function completely. The app falls back to mocked content if keys are invalid or missing.
- **Microphone Permissions:** Presenters must grant microphone access for the live transcription engine to capture spoken content.

---

## Further Documentation

- [SETUP.md](./SETUP.md) — Local development setup, environment variables, Supabase configuration, and deployment instructions.
- [TECH_STACK.md](./TECH_STACK.md) — Architecture overview and technology choices.

---

## License

Copyright (c) 2024 IdeaXecution. All rights reserved.

This software and its source code are proprietary and confidential. No part of this software may be copied, modified, distributed, sublicensed, or used in any form without the express prior written permission of IdeaXecution.

Unauthorised use, reproduction, or distribution of this software, in whole or in part, may result in civil and criminal penalties and will be prosecuted to the maximum extent permitted by law.
