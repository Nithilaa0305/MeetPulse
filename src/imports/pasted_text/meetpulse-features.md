Suggested Tech Stack
Frontend
---------
Next.js 15
React 19
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
TanStack Query

Backend
--------
Supabase
PostgreSQL
Edge Functions

Realtime
---------
Supabase Realtime

Authentication
--------------
Supabase Auth

AI
--
OpenAI GPT
Whisper

Storage
-------
Supabase Storage

Charts
------
Recharts

PDF
---
React PDF

Deployment
----------
Vercel
Proposed Folder Structure
meetpulse/
│
├── app/
│   ├── (landing)/
│   ├── auth/
│   ├── dashboard/
│   │   ├── education/
│   │   │   ├── admin/
│   │   │   ├── presenter/
│   │   │   └── participant/
│   │   │
│   │   └── business/
│   │       ├── admin/
│   │       ├── presenter/
│   │       └── participant/
│   │
│   ├── session/
│   ├── meetings/
│   ├── analytics/
│   ├── archive/
│   ├── ai/
│   ├── settings/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── meeting/
│   ├── presentation/
│   ├── attendance/
│   ├── analytics/
│   ├── ai/
│   ├── charts/
│   ├── navigation/
│   └── common/
│
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── analytics/
│   ├── attendance/
│   ├── realtime/
│   └── utils/
│
├── hooks/
├── services/
├── types/
├── constants/
├── styles/
├── public/
├── prisma/ (optional)
└── docs/
Summary of MeetPulse Features
Platform Vision

MeetPulse is an AI-powered presentation and meeting intelligence platform that runs alongside Zoom, Google Meet, Microsoft Teams, or physical meetings. It enhances meetings with real-time interaction, AI assistance, analytics, and collaboration without replacing the underlying meeting platform.

Landing & Authentication
Modern SaaS landing page
Organization selection
Education or Business workspace
Role-based login
Google/Microsoft authentication
Email verification
Forgot password
Organization Types
Education

Roles:

Admin
Presenter (Lecturer)
Participant (Student)
Business

Roles:

Admin
Presenter (Manager)
Participant (Employee)
Education Admin
Student management
Lecturer management
Course management
Department management
Attendance reports
Engagement analytics
Institution-wide dashboards
Education Presenter
Create lecture sessions
Upload PDF/PPTX
Generate QR codes
Generate Meeting IDs
Live slide synchronization
Presenter notes
Audience analytics
Poll management
Question management
AI coaching
AI transcription
AI summaries
Education Participant
Join with QR
Join with Meeting ID
View synchronized slides
Anonymous questions
Bookmarks
Personal notes
Poll participation
Live transcript
AI summaries
Attendance status
Learning history
Business Admin
Employee management
Department management
Workspace settings
Organization analytics
Usage reports
Business Presenter
Create meetings
Upload presentations
Invite participants
Live analytics
AI summaries
Action item extraction
Meeting reports
Presenter coaching
Business Participant
Join meetings
View slides
Raise hand
Polls
Notes
Assigned tasks
Meeting history
Action items
Session Management
Create session wizard
Select meeting platform (Zoom, Google Meet, Teams, Physical)
Upload presentation
Generate QR code
Meeting link management
Meeting IDs
Presentation Features
Slide synchronization
Presenter notes
Full-screen mode
Slide thumbnails
AI slide insights
Audience Interaction
Emoji reactions
Confusion indicator
Raise hand
Anonymous questions
Slide-level reactions
Question bookmarking
Polls
Live Q&A
AI Features
Live Transcription
Whisper-based transcription
Searchable transcript
Timestamped transcript
AI Summary
Executive summary
Key discussion points
Important decisions
Next steps
AI Action Items
Task extraction
Owner detection
Deadline extraction
Export
AI Presenter Coach
Speaking pace analysis
Audience engagement analysis
Confusion detection
Timing recommendations
Coaching suggestions
AI Pulse Engine
Understanding checks
Micro quizzes
Confidence ratings
Pace feedback
Attention checks
AI Assistant

Natural language queries such as:

Summarize meetings
Find discussions
Locate slides
Search transcripts
Generate follow-up emails
Smart Attendance

Attendance is based on meaningful participation rather than simple login.

Signals include:

Join time
Leave time
Active duration
Reactions
Poll participation
Questions asked
Pulse check responses
Slide interactions

Outputs:

Attendance score
Engagement score
Participation level
Analytics
Engagement score
Understanding score
Attendance score
Participation trends
Question frequency
Poll results
Slide heatmaps
Most confusing slides
Most engaging slides
Presenter performance
Session timelines
Reports
Attendance reports
AI meeting summaries
Minutes of Meeting
Action item reports
Engagement reports
Analytics reports
Export to PDF
Meeting Archive
Search meetings
Search transcripts
Search slides
Search summaries
Search action items
Timeline view
Filters and tags
Real-Time Features
Slide synchronization
Reactions
Polls
Questions
Notifications
Analytics updates
Live attendance
UI/UX
Dark-first theme
Glassmorphism
Responsive design
Smooth animations
Floating cards
AI widgets
Accessibility support
Empty states
Loading skeletons
Command palette
Search