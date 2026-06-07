# 🤖 Tutor Robot — AI-Powered Kids Learning App

An interactive, robot-guided educational platform for children in Grades 5–6. The robot tutor features expressive personality animations, structured video lessons, voice-simulated quizzes, a progress tracker, and a full parent dashboard with subscription-gated content.

---

## ✨ Features

### 👶 Child Experience
| Feature | Description |
|---|---|
| **Grade & Subject Menu** | D-pad navigation through grades, subjects, and topics |
| **Video Lessons** | Auto-gated video player with play/pause/replay via the control bar |
| **Voice Quiz** | Microphone UI with text-input simulation; checks answers and shows feedback |
| **Progress Screen** | Personal scorecard showing videos watched, quizzes completed, and overall % |
| **Robot Personality** | 7 animated eye states: Idle, Listening, Thinking, Correct, Incorrect, Completed, Video |

### 👨‍👩‍👧 Parent Portal
| Feature | Description |
|---|---|
| **PIN Login** | 4-digit PIN pad overlay (default: `1234`) to access parent area |
| **Dashboard** | Live stats: videos watched, quizzes done, total topics |
| **Grade Subscriptions** | View free/premium grade access; one-tap "Unlock" for premium grades |
| **Progress Detail** | Per-topic video + quiz scores across all subjects |

### 🔒 Content Management
- Premium grades are flagged `isPremium: true` in `mockContent.ts`
- Locked grades show a child-friendly "Ask your parent" screen
- Unlocked grade IDs persist in `localStorage`

---

## 📁 Folder Structure

```
Robo/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/               # Static images
│   ├── components/
│   │   ├── ControlBar.tsx    # D-pad navigation UI
│   │   ├── EyeSection.tsx    # Robot eye animations (7 states)
│   │   ├── StomachSection.tsx# Main content display area
│   │   ├── parent/
│   │   │   ├── ParentAuthScreen.tsx  # PIN pad login
│   │   │   └── ParentDashboard.tsx   # Stats + grade unlock UI
│   │   └── screens/
│   │       ├── MenuScreen.tsx        # Reusable list navigation
│   │       ├── TopicActionScreen.tsx # Video/Quiz chooser
│   │       ├── VideoScreen.tsx       # Embedded video player
│   │       ├── QuizScreen.tsx        # Quiz + voice input UI
│   │       ├── ProgressScreen.tsx    # Child progress view
│   │       └── LockedScreen.tsx      # Premium content gate
│   ├── data/
│   │   └── mockContent.ts    # Grades, subjects, topics, quiz questions
│   ├── hooks/
│   │   └── useTutorState.ts  # Central state machine (navigation, quiz, video)
│   ├── types/
│   │   ├── content.ts        # Grade, Subject, Topic, QuizQuestion types
│   │   └── progress.ts       # TopicProgress, ProgressData types
│   ├── utils/
│   │   └── storage.ts        # localStorage helpers (progress, subscriptions, PIN)
│   ├── App.tsx               # Root component — layout + modals
│   ├── App.css               # Global layout + gear button styles
│   ├── index.css             # Design system tokens + mobile breakpoints
│   └── main.tsx              # React entry point
├── dist/                     # Production build output
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Output is in `dist/` — deploy this folder to any static hosting provider.

### Deployment Options

| Platform | Command / Notes |
|---|---|
| **Vercel** | `npx vercel --prod` or connect GitHub repo |
| **Netlify** | Drag & drop `dist/` to Netlify dashboard |
| **GitHub Pages** | Add `"homepage"` to `package.json`, run `npm run build` |
| **Firebase Hosting** | `firebase deploy` after `firebase init hosting` |

---

## 🔑 Parent Portal

- Access: Tap the **⚙️ gear icon** in the top-right corner of the robot
- Default PIN: **`1234`**
- To change PIN: Update via `setParentPin(newPin)` in `src/utils/storage.ts` (UI for this coming in a future release)

---

## 📊 Progress & Storage

All progress and subscription data is stored in the browser's `localStorage`:

| Key | Purpose |
|---|---|
| `tutor_robot_progress` | Video completion + quiz scores per topic |
| `tutor_robot_subscriptions` | List of unlocked premium grade IDs |
| `tutor_robot_parent_pin` | Hashed/stored parent PIN |

> ⚠️ **Note:** `localStorage` is per-device and per-browser. Data is not synced across devices in this MVP. See the Backend Integration Plan below for the path to cloud sync.

---

## 🏗️ Future Backend Integration Plan

### Overview

The current MVP uses `localStorage` and `mockContent.ts` as a local-first data layer. The architecture is designed to make swapping in a real backend straightforward.

### Recommended Stack

| Layer | Technology |
|---|---|
| **API** | Node.js + Express or Next.js API Routes |
| **Database** | PostgreSQL (relational) via **Prisma ORM** |
| **Auth** | JWT tokens for parents; session tokens for children |
| **File Storage** | AWS S3 / Cloudflare R2 for video assets |
| **Hosting** | Railway, Render, or AWS (backend); Vercel (frontend) |

---

### Database Schema (Prisma)

```prisma
model Parent {
  id        String   @id @default(cuid())
  email     String   @unique
  pinHash   String
  children  Child[]
  createdAt DateTime @default(now())
}

model Child {
  id        String     @id @default(cuid())
  name      String
  grade     Int
  parent    Parent     @relation(fields: [parentId], references: [id])
  parentId  String
  progress  Progress[]
}

model Subscription {
  id        String  @id @default(cuid())
  parentId  String
  gradeId   String
  unlockedAt DateTime @default(now())
}

model Progress {
  id             String   @id @default(cuid())
  child          Child    @relation(fields: [childId], references: [id])
  childId        String
  topicId        String
  videoCompleted Boolean  @default(false)
  quizScore      Int?
  updatedAt      DateTime @updatedAt
  @@unique([childId, topicId])
}

model Grade {
  id        String    @id
  title     String
  isPremium Boolean   @default(false)
  subjects  Subject[]
}

model Subject {
  id      String  @id
  title   String
  gradeId String
  grade   Grade   @relation(fields: [gradeId], references: [id])
  topics  Topic[]
}

model Topic {
  id        String        @id
  title     String
  videoUrl  String
  subjectId String
  subject   Subject       @relation(fields: [subjectId], references: [id])
  questions Question[]
}

model Question {
  id                 String   @id @default(cuid())
  text               String
  options            String[]
  correctOptionIndex Int
  topicId            String
  topic              Topic    @relation(fields: [topicId], references: [id])
}
```

---

### Migration Path (3 phases)

#### Phase 1 — Auth & Parent API
1. Replace `storage.ts` PIN logic with `/api/auth/parent` (POST) that returns a JWT.
2. Store JWT in `sessionStorage`; attach as `Authorization: Bearer <token>` header.
3. Parent dashboard fetches `/api/parent/children` and `/api/parent/subscriptions`.

#### Phase 2 — Content API
1. Replace `mockContent.ts` with `GET /api/content/grades` (protected; returns grades the child is subscribed to).
2. Video URLs become signed S3/R2 URLs generated server-side.
3. Cache content in `useMemo` / React Query for performance.

#### Phase 3 — Progress Sync
1. Replace `updateTopicProgress()` calls with `POST /api/progress` with debounce/optimistic updates.
2. On app load, fetch child's cloud progress and merge with any offline `localStorage` cache.
3. Add a sync indicator (⟳) in the UI when online sync is pending.

---

### API Endpoints (planned)

```
POST   /api/auth/parent/login          → JWT token
POST   /api/auth/parent/register       → Create account
GET    /api/content/grades             → All grades + isPremium flag
GET    /api/content/grades/:id/topics  → Subjects + topics for grade
POST   /api/subscriptions/unlock       → Unlock a grade for a parent
GET    /api/progress/:childId          → All topic progress
POST   /api/progress                   → Upsert topic progress
GET    /api/parent/dashboard           → Aggregated child stats
```

---

## 🧩 Adding New Content

To add a new subject or topic (current MVP):

1. Open `src/data/mockContent.ts`
2. Add a new `Topic` object inside any `Subject.topics[]` array
3. Include `videoUrl`, `title`, and `questions[]` (min 2 questions recommended)

TypeScript will enforce the correct shape via `src/types/content.ts`.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (custom design system)
- **Fonts**: Inter + Outfit (Google Fonts)
- **State**: React `useState` / `useEffect` + custom `useTutorState` hook
- **Persistence**: Browser `localStorage`
- **No external UI libraries** — fully custom components

---

## 📝 License

MIT — Free to use, modify, and distribute.

---

*Built with ❤️ for curious kids everywhere.*
