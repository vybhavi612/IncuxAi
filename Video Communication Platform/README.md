# VibeSync - Enterprise Video Conferencing & Virtual Collaboration Suite

VibeSync is a premium, high-fidelity enterprise-grade virtual meeting and collaboration platform. Built with a sleek, dark-mode-first glassmorphic UI inspired by the Yoom application, it combines real-time video communication, screen sharing, and recording with powerful collaborative utilities (interactive whiteboard, shared notes, live chat, polls, Q&A, and AI-assisted summaries).

---

## 📋 Table of Contents
1. [Introduction](#-introduction)
2. [Tech Stack](#-tech-stack)
3. [Features](#-features)
4. [Project Structure](#-project-structure)
5. [Quick Start](#-quick-start)
6. [Database Sync](#-database-sync)
7. [Visuals & Walkthrough](#-visuals--walkthrough)

---

## 🤖 Introduction
VibeSync provides businesses, educational institutions, and distributed teams with a comprehensive collaborative workspace. Unlike simple video calling apps, VibeSync integrates meeting audio/video streams directly with:
- A real-time vector whiteboard.
- Formatted shared meeting notes.
- Threaded channel chat.
- Live participant polls and Q&A boards.
- An AI-powered transcription, translation, and summary dashboard.

The application works completely out of the box locally, utilizing browser media interfaces, simulated participants, and an embedded SQL database.

---

## ⚙️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & CSS Backdrop Filters
- **Database ORM**: [Prisma Client](https://www.prisma.io/)
- **Database Engine**: [SQLite](https://sqlite.org/) (File-based database `dev.db`, easily upgradable to PostgreSQL)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🔋 Features

### 🔐 User Accounts & Multi-Factor Authentication
- **SSO Simulation**: Sign in instantly using simulated Google or GitHub workspace credentials.
- **Role Hierarchy**: System updates options based on role tiers (`ADMIN`, `ORGANIZER`, `ATTENDEE`).
- **MFA Verification**: Entering emails containing `"mfa"` (e.g. `alex-mfa@company.com`) prompts a verification screen, requiring code `123456` to log in.

### 📅 Yoom-themed Home Dashboard
- **Live Digital Clock**: Real-time ticking system clock and date banner.
- **Meeting Actions**: Quick-start instant meetings, join via code, schedule future calls, or browse the recording vault.
- **Scheduler Modal**: Configure Title, Description, Date/Time, Duration, Passcode, and Waiting Room toggles.
- **Meeting Feed**: Dynamic overview of today's scheduled meetings, with instant startup or deletion triggers.

### 📹 Video Conferencing & Screen Sharing
- **Media Capture**: Hooks up your webcam and microphone using standard browser `navigator.mediaDevices.getUserMedia`.
- **Screen Sharing**: Streams browser windows or full desktop feeds directly using `navigator.mediaDevices.getDisplayMedia`.
- **Webcam Filters**: Applies real-time visual effects (Noir/Grayscale, Blur Background, or Neon glowing borders).
- **Simulated Attendees**: Includes smart bot galleries who talk, trigger mic visualizers, and interact in chat.
- **Session Recorder**: Compiles recorded streams using the `MediaRecorder` API and automatically uploads the compiled video to the Recordings Vault.

### 🎨 Workspace Collaboration Modules
- **Interactive Whiteboard**: Canvas tools supporting Pen, Rectangle, Circle, Line, Eraser, brush thicknesses, color palettes, Undo/Redo queues, and exports to PNG.
- **Shared Notes**: Rich markdown text editor supporting Bold, Italic, Header formatting, clipboard copies, and saves to `.md` files.
- **Live Polls**: Interface to launch polls, register votes, simulate participant distributions, and render progress percentages.
- **Q&A Moderate**: Question feed supporting upvotes, removal, and host answers.
- **AI Copilot**:
  - *Automatic Transcription*: Live chronological transcript with speaker indicators.
  - *Language Translation*: Live translation dropdown mapping transcripts to Spanish, French, or German.
  - *Action Items Checklist*: Extraction of checklist items with marking configurations.

### 💾 Recordings Playback Vault
- Fully featured player showing recorded `.webm` files and sizes.
- **Interactive Transcript Timeline**: Clicking any text line automatically jumps the video player's time (`video.currentTime = X`) to that exact timestamp!

### 📊 Enterprise Administration
- **Animated SVG Charts**: Custom charts showing Daily Active Users (with coordinate tooltips) and department call minutes.
- **User Provisions**: Tables managing roles, statuses (Active, Suspended, Pending), and license billing tiers (Basic, Pro, Enterprise).
- **Audit Logs**: Visual logging database detailing logins, meeting creations, and deletions with simulated IP trails.

---

## 📂 Project Structure
```
src/
├── app/
│   ├── globals.css                # Custom Tailwind imports & glassmorphic system
│   ├── layout.tsx                 # Root layout wrapping AppProvider
│   ├── page.tsx                   # Hero Landing page
│   ├── login/                     # Auth portal (MFA/SSO)
│   ├── dashboard/                 # Scheduling home portal
│   ├── meeting/[id]/              # Video room & collaboration side-drawers
│   ├── chat/                      # Channels & threaded messages
│   ├── recordings/                # Playback player & timestamp syncing
│   └── admin/                     # System analytics & license provision tables
├── components/                    # Core widgets
│   ├── Sidebar.tsx                # Brand sidebar navigator
│   ├── Whiteboard.tsx             # Drawing whiteboard
│   ├── Notes.tsx                  # Notes text formatters
│   ├── ChatPanel.tsx              # Text chat panels
│   ├── AIAssistant.tsx            # Translators & action list items
│   ├── PollsPanel.tsx             # Interactive poll results
│   ├── QAPanel.tsx                # Participant question cards
│   └── AdminCharts.tsx            # Animated SVG chart systems
├── context/
│   └── AppContext.tsx             # Context containing mock database methods
└── lib/
    └── prisma.ts                  # Global Prisma client initializer
prisma/
└── schema.prisma                  # SQLite relational models
```

---

## 🤸 Quick Start

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Generate the Prisma client & sync database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Spin up the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

---

## 💾 Database Sync
To connect the application to your own local database (e.g. PostgreSQL), modify the datasource settings in [schema.prisma](file:///c:/Users/ravik/OneDrive/Desktop/VC2/prisma/schema.prisma):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Then define your environment connection string in a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5400/vibesync?schema=public"
```

---

## 🔬 Visuals & Walkthrough
A detailed architectural breakdown, validation metrics, compile logs, and visual walkthrough steps can be found in the local artifact files:
- [walkthrough.md](file:///C:/Users/ravik/.gemini/antigravity/brain/8fe38901-a5db-4a71-8d0f-3475a2977bca/walkthrough.md)
- [task.md](file:///C:/Users/ravik/.gemini/antigravity/brain/8fe38901-a5db-4a71-8d0f-3475a2977bca/task.md)
