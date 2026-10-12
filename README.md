# ExamPro — Online Examination Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application for managing
online examinations end to end: admins create exams and questions, students take
timed exams, and results are scored, stored and reviewed automatically.

The app ships with role-based dashboards (Admin / Student), a live notification
bell, exam availability gating, in-app popups (no native browser dialogs), and a
full answer-review screen after each attempt.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Business Rules](#business-rules)
- [Getting Started](#getting-started)
- [Usage Walkthrough](#usage-walkthrough)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Security Notes & Limitations](#security-notes--limitations)
- [License](#license)

---

## Overview

ExamPro models a real exam workflow:

1. An **admin** creates an examination with a duration, total marks and an exam date.
2. The admin adds questions to that exam until the questions' marks add up to the
   exam's total marks — only then does the exam become **published**.
3. A **student** registers, sees only published exams (future exams show as
   *"Coming Soon"*), and takes an exam under a countdown timer.
4. On submit (or when time runs out) the attempt is **auto-scored**, stored as a
   result, and the student can review every question — their answer, whether it was
   right or wrong, and the correct answer for the ones they missed.

---

## Features

### Admin

- **Dashboard** — totals for exams, questions, students and results, average/pass
  metrics, recent activity feed, and quick actions.
- **Exam management** — create, edit and delete exams. Each exam shows a status
  badge: **Draft**, **Coming Soon**, or **Published**.
- **Question management** — pick an exam once and add questions in a continuous
  flow. Questions are filtered to the selected exam, numbered (`Q1`, `Q2`, …), and
  fully validated.
- **Marks criteria enforcement** — the sum of a question set must equal the exam's
  `totalMarks`. The UI warns when it is short and blocks questions that would
  overshoot the total.
- **Student management** — list, search, edit and delete student accounts.
- **Result management** — view all results with score, percentage and status, and
  delete individual results.
- **System settings** — configure passing percentage, default exam duration,
  default total marks, and toggle student self-registration.

### Student

- **Dashboard** — available exams, completed results, average score and pass rate.
- **Exam availability gating** — only published exams can be started. Upcoming
  (future-dated) exams display as **Coming Soon** with the exam name only, and
  cannot be opened.
- **Timed exams** — a live countdown; the exam auto-submits when time reaches zero.
- **Automatic scoring** — score, percentage and Pass/Fail status are computed on
  submit using the admin's configured passing percentage.
- **Answer review** — after an attempt, a detailed review shows the chosen answer,
  marks it correct/incorrect, and reveals the correct answer for wrong ones.
- **Profile & password settings** — update personal details and change password.

### Shared

- **Role-based layouts** — `AdminLayout` and `StudentLayout` with sidebar nav.
- **Notification bell** — derives notifications from live data (new exams,
  completed exams, registered students) with an unread badge persisted in
  `localStorage`.
- **In-app popups** — `NoticeModal` and `ConfirmModal` replace native `alert()` and
  `window.confirm()` throughout the app.
- **Accurate relative times** — "x minutes ago" labels use real timestamps, with a
  MongoDB ObjectId fallback so older records remain correct (see
  [Business Rules](#business-rules)).

---

## Tech Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Frontend       | React 19, React Router DOM 7, Create React App (`react-scripts` 5)      |
| Styling        | Plain CSS (`src/index.css`, `src/App.css`) + inline SVG `Icons`         |
| Backend        | Node.js, Express 5                                                      |
| Database       | MongoDB via Mongoose 9                                                  |
| Middleware     | CORS, `express.json()`                                                  |
| Tooling        | npm, Git                                                                |

---

## Architecture

### High-level

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│      React SPA (Browser)    │         │      Express REST API       │
│      http://localhost:3000  │  HTTP   │      http://localhost:5000  │
│                             │ ──────► │                             │
│  Pages ─ Layouts ─ Modals   │  JSON   │  routes ─ models (Mongoose) │
│  NotificationBell, utils    │ ◄────── │                             │
└─────────────────────────────┘         └──────────────┬──────────────┘
                                                        │ Mongoose ODM
                                                        ▼
                                             ┌─────────────────────┐
                                             │       MongoDB       │
                                             │  db: "examination"  │
                                             └─────────────────────┘
```

### Request flow

1. The React SPA calls the REST API with `fetch` (the base URL
   `http://localhost:5000` is referenced directly in the page components).
2. Express routes (`backend/routes/*`) validate input and delegate to Mongoose
   models.
3. Mongoose reads/writes MongoDB (`mongodb://localhost:27017/examination`).
4. Exam endpoints enrich each document with computed fields (`isPublished`,
   `isUpcoming`, `isAvailable`, `questionCount`, `questionsTotalMarks`) **before**
   responding — see [Business Rules](#business-rules).

### Frontend architecture

- **Routing** (`src/App.js`) — public routes (`/` login, `/register`), admin routes
  (`/admin-dashboard`, `/exam-management`, `/question-management`,
  `/student-management`, `/result-management`, `/admin-settings`), and student
  routes (`/student-dashboard`, `/exam/:examId`, `/result/:id`,
  `/student-settings`).
- **Layouts** (`AdminLayout`, `StudentLayout`) — shared shell with sidebar,
  greeting and the notification bell; used by the dashboard-style pages.
- **Reusable UI** — `Modal.js` (base), `NoticeModal.js`, `ConfirmModal.js`,
  `Icons.js` (inline SVG set), `NotificationBell.js`.
- **Utilities** — `src/utils/time.js` centralises timestamp parsing and relative
  time formatting.
- **Session state** — `userId`, `username` and `usertype` are stored in
  `localStorage` after login and used for role gating and API calls.

### Backend architecture

- **Entry point** (`backend/server.js`) — bootstraps Express, enables CORS + JSON
  body parsing, mounts the routers under `/api/*`, and connects to MongoDB.
- **Routers** (`backend/routes/*`) — one router per resource
  (`login`, `users`, `exams`, `questions`, `results`, `settings`).
- **Models** (`backend/model/*`) — Mongoose schemas with `timestamps: true` for
  audit fields (`createdAt` / `updatedAt`).

---

## Project Structure

```
Online Exam Management/
├── backend/
│   ├── server.js                 # Express app + MongoDB connection
│   ├── seed.js                   # Creates the default admin account
│   ├── package.json
│   ├── model/
│   │   ├── loginmodel.js         # Authentication accounts
│   │   ├── usermodel.js          # User profiles (Admin / Student)
│   │   ├── exammodel.js          # Examinations
│   │   ├── questionmodel.js      # Exam questions
│   │   ├── resultmodel.js        # Student attempts / results
│   │   └── settingmodel.js       # Global system settings
│   └── routes/
│       ├── loginRoutes.js        # Register / login / password
│       ├── userRoutes.js         # User profiles (CRUD)
│       ├── examRoutes.js         # Exams (CRUD + publish status)
│       ├── questionRoutes.js     # Questions (CRUD)
│       ├── resultRoutes.js       # Results (CRUD)
│       └── settingRoutes.js      # Global settings
│
└── frontend/
    ├── public/
    │   └── index.html            # App title: "ExamPro"
    ├── package.json
    └── src/
        ├── App.js                # Route definitions
        ├── index.js / index.css
        ├── components/
        │   ├── AdminLayout.js
        │   ├── StudentLayout.js
        │   ├── Modal.js          # Base modal
        │   ├── NoticeModal.js    # Replaces alert()
        │   ├── ConfirmModal.js   # Replaces window.confirm()
        │   ├── NotificationBell.js
        │   └── Icons.js
        ├── pages/
        │   ├── Login.js / Register.js
        │   ├── AdminDashboard.js / StudentDashboard.js
        │   ├── ExamManagement.js / QuestionManagement.js
        │   ├── StudentManagement.js / ResultManagement.js
        │   ├── ExamPage.js       # Exam taking + auto scoring
        │   ├── ResultPage.js     # Result + answer review
        │   ├── AdminSettings.js / StudentSettings.js
        └── utils/
            └── time.js           # Timestamp + relative time helpers
```

---

## Data Models

### Login (`logins`)

| Field      | Type   | Notes                          |
| ---------- | ------ | ------------------------------ |
| `username` | String | Required, unique               |
| `password` | String | Required (stored in plain text)|
| `usertype` | String | `"Admin"` or `"Student"`       |
| timestamps | Date   | `createdAt`, `updatedAt`       |

### User (`users`)

| Field         | Type   | Notes                                |
| ------------- | ------ | ------------------------------------ |
| `username`    | String | Required, unique                     |
| `name`        | String | Required                             |
| `email`       | String | Required, unique, lowercased         |
| `phoneNumber` | String | Required                             |
| `gender`      | String | Required                             |
| `usertype`    | String | Default `"Student"`                  |
| timestamps    | Date   | `createdAt`, `updatedAt`             |

### Exam (`exams`)

| Field         | Type   | Notes                                                   |
| ------------- | ------ | ------------------------------------------------------- |
| `examName`    | String | Required                                                |
| `description` | String | Required                                                |
| `duration`    | Number | Required, minutes                                       |
| `totalMarks`  | Number | Required                                                |
| `createdDate` | String | Required, `YYYY-MM-DD` (sent by the form; true creation time is `createdAt`) |
| `examDate`    | String | Required, `YYYY-MM-DD` (scheduled availability date)    |
| timestamps    | Date   | `createdAt`, `updatedAt`                                |

> Exam endpoints also return **computed** fields that are not stored:
> `questionCount`, `questionsTotalMarks`, `isPublished`, `isUpcoming`, `isAvailable`.

### Question (`questions`)

| Field           | Type     | Notes                                  |
| --------------- | -------- | -------------------------------------- |
| `examId`        | ObjectId | Ref → `Exam`, required                 |
| `question`      | String   | Required                               |
| `options`       | Object   | `{ A, B, C, D }`, all required strings |
| `correctAnswer` | String   | Required (`"A"`–`"D"`)                 |
| `marks`         | Number   | Required                               |
| timestamps      | Date     | `createdAt`, `updatedAt`               |

### Result (`results`)

| Field         | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| `userId`      | ObjectId | Ref → `User`, required                   |
| `examId`      | ObjectId | Ref → `Exam`, required                   |
| `answers`     | Object   | Map of `{ questionId: chosenOption }`    |
| `score`       | Number   | Required                                 |
| `totalMarks`  | Number   | Required                                 |
| `percentage`  | Number   | Required                                 |
| `status`      | String   | `"Pass"` or `"Fail"`                     |
| `submittedAt` | Date     | Defaults to submission time              |
| timestamps    | Date     | `createdAt`, `updatedAt`                 |

### Setting (`settings`)

A single global document (`key: "global"`).

| Field                 | Type    | Default | Notes                          |
| --------------------- | ------- | ------- | ------------------------------ |
| `key`                 | String  | global  | Unique                         |
| `passingPercentage`   | Number  | 40      | Pass threshold (0–100)         |
| `defaultExamDuration` | Number  | 60      | Pre-filled in new exams        |
| `defaultTotalMarks`   | Number  | 100     | Pre-filled in new exams        |
| `allowRegistration`   | Boolean | true    | Allow student self-registration|
| timestamps            | Date    | —       | `createdAt`, `updatedAt`       |

---

## API Reference

Base URL: `http://localhost:5000`

### Auth — `/api/login`

| Method | Endpoint                      | Description                                        |
| ------ | ----------------------------- | -------------------------------------------------- |
| POST   | `/register`                   | Create a student account (respects `allowRegistration`) |
| POST   | `/login`                      | Authenticate; returns `usertype`, `username`, `userId`  |
| GET    | `/check-username/:username`   | Check whether a username is available              |
| PUT    | `/password`                   | Change password (requires current password)        |
| GET    | `/`                           | List login accounts                                |
| DELETE | `/:id`                        | Delete a login account                             |

### Users — `/api/users`

| Method | Endpoint                     | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/`                          | Create a user profile                        |
| GET    | `/?usertype=Student`         | List users (optional `usertype` filter)      |
| GET    | `/username/:username`        | Get a user by username                       |
| GET    | `/:id`                       | Get a user by id                             |
| PUT    | `/:id`                       | Update profile (name, email, phone, gender)  |
| PUT    | `/username/:username`        | Update profile by username                   |
| DELETE | `/:id`                       | Delete user **+ their login + their results**|

### Exams — `/api/exams`

| Method | Endpoint | Description                                                          |
| ------ | -------- | ------------------------------------------------------------------- |
| POST   | `/`      | Create an exam (starts as a **draft**)                              |
| GET    | `/`      | List exams with publish/availability status                         |
| GET    | `/:id`   | Get one exam with publish/availability status                       |
| PUT    | `/:id`   | Update an exam                                                      |
| DELETE | `/:id`   | Delete exam **+ its questions + all its results** (returns counts)  |

### Questions — `/api/questions`

| Method | Endpoint          | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| POST   | `/`               | Add a question                            |
| GET    | `/`               | List all questions (with populated exam)  |
| GET    | `/exam/:examId`   | List questions for one exam               |
| GET    | `/:id`            | Get one question                          |
| PUT    | `/:id`            | Update a question                         |
| DELETE | `/:id`            | Delete a question                         |

### Results — `/api/results`

| Method | Endpoint          | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| POST   | `/`               | Save a result (submitted by the exam page)   |
| GET    | `/`               | List all results (populated user + exam)     |
| GET    | `/user/:userId`   | Results for one student (populated exam)     |
| GET    | `/exam/:examId`   | Results for one exam (populated student)     |
| GET    | `/:id`            | Get one result (populated user + exam)       |
| DELETE | `/:id`            | Delete a result                              |

### Settings — `/api/settings`

| Method | Endpoint | Description                              |
| ------ | -------- | ---------------------------------------- |
| GET    | `/`      | Get global settings (created if missing) |
| PUT    | `/`      | Update global settings (validated)       |

---

## Business Rules

### Exam publishing (computed, not stored)

`isPublished`, `isUpcoming` and `isAvailable` are derived on every exam request:

```
isPublished = questionCount > 0  AND  questionsTotalMarks == exam.totalMarks
isUpcoming  = exam.examDate > today  (server local date, "YYYY-MM-DD")
isAvailable = isPublished AND NOT isUpcoming
```

- A **new exam starts as a Draft** and is not auto-published.
- Editing questions or the exam date automatically flips availability — no stored
  flag to drift out of sync.
- Date comparisons use plain `YYYY-MM-DD` strings (local server date) to avoid
  timezone bugs.

### Availability gating

- Students only see **published** exams on their dashboard and in notifications.
- **Upcoming** exams show as *"Coming Soon"* with the exam name only — the
  description, details and Start button are hidden.
- `ExamPage` blocks direct navigation: unpublished exams show an "unavailable"
  message, and upcoming exams return before any questions are fetched.

### Marks criteria

- The sum of a question set must equal the exam's `totalMarks`.
- The question editor shows a live criteria panel: it warns when the total is
  **short** and blocks adding/updating a question that would **overshoot**.

### Scoring

Computed on the client at submit time (`ExamPage`) and stored with the result:

```
score       = Σ marks of correctly answered questions
percentage  = round((score / totalMarks) * 100, 2)
status      = percentage >= passingPercentage ? "Pass" : "Fail"
```

- The exam auto-submits when the timer hits `0:00`; a guard prevents double
  submission (timer + click).

### Cascading deletes

Deleting a record cleans up everything that depends on it:

| Delete        | Also removes                                  |
| ------------- | --------------------------------------------- |
| An **exam**   | its questions and all of its student results  |
| A **student** | their login account and all of their results  |

### Timestamps

- All models use Mongoose `timestamps: true` (`createdAt` / `updatedAt`).
- Results use `submittedAt` as the attempt time.
- Relative labels ("x minutes ago") prefer real timestamps and fall back to the
  **MongoDB ObjectId timestamp**, so records created before timestamps were added
  still display the correct time. See `frontend/src/utils/time.js`.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended) and **npm**
- **MongoDB** running locally on `mongodb://localhost:27017`

### 1. Backend

```bash
cd backend
npm install

# Create the default admin account (run once)
npm run seed

# Start the API server (http://localhost:5000)
npm start
```

You should see `Connected to MongoDB` and `Server running on port 5000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install

# Start the React dev server (http://localhost:3000)
npm start
```

The browser opens at `http://localhost:3000`.

### Default credentials

After running `npm run seed`:

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| Admin | `admin`  | `admin@123`|

Students can also self-register from the **Register** page (when
`allowRegistration` is enabled).

> If the seed does not create the admin in your environment, you can register a
> normal account and adjust its `usertype` to `Admin` directly in MongoDB.

---

## Usage Walkthrough

### As an admin

1. Log in with `admin` / `admin@123`.
2. **Manage Exams** → create an exam (name, description, duration, total marks,
   exam date). It is saved as a **Draft**.
3. **Manage Questions** → select the exam, then add questions until the marks
   total equals the exam's total marks. The exam becomes **Published** (or
   **Coming Soon** if the exam date is in the future).
4. **Manage Students** → review, edit or remove student accounts.
5. **Results** → monitor every attempt; **Settings** → tune passing percentage,
   defaults and registration.

### As a student

1. **Register** (or log in with existing credentials).
2. From the dashboard, start an available exam and answer under the timer.
3. Submit manually, or let the timer auto-submit.
4. Review the result page: score, percentage, Pass/Fail, and the answer review
   showing your choices and the correct answers for missed questions.

---

## Available Scripts

### Backend (`backend/`)

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm start`    | Run the API server (`node server.js`)        |
| `npm run seed` | Seed the default admin account (`node seed.js`) |

### Frontend (`frontend/`)

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `npm start`     | Run the dev server at `http://localhost:3000`   |
| `npm run build` | Production build into `frontend/build`          |
| `npm test`      | Run tests in watch mode                         |
| `npm run eject` | Eject CRA config (irreversible)                 |

---

## Configuration

| Setting        | Where                                             | Value                              |
| -------------- | ------------------------------------------------- | ---------------------------------- |
| API base URL   | Hardcoded in frontend `fetch` calls               | `http://localhost:5000`            |
| Backend port   | `backend/server.js`                               | `5000`                             |
| Mongo URI      | `backend/server.js`, `backend/seed.js`            | `mongodb://localhost:27017/examination` |
| CORS           | `backend/server.js` (`cors()`)                    | Enabled for all origins            |
| Global options | Admin **Settings** page / `settings` collection   | passing %, defaults, registration  |

---

## Security Notes & Limitations

This project is intended for **learning / demonstration** purposes. Before any
production use, consider the following:

- **Passwords are stored in plain text** — use a hashing library (e.g. `bcrypt`)
  and never return them in responses.
- **No token-based auth** — the session is client-side (`localStorage`) and API
  routes are not protected server-side. Add JWT/session middleware and route
  guards for real deployments.
- **Hardcoded URLs/ports** — move the API base URL and Mongo URI into environment
  variables (`.env`) rather than source code.
- **Client-side timing only** — the exam timer runs in the browser; a hardened
  system should also enforce time limits server-side.
- **CORS is fully open** — restrict allowed origins in production.
- `Exam.examDate` / `createdDate` are stored as `YYYY-MM-DD` strings; availability
  logic relies on the server's local date.

---

## License

This project is provided for educational purposes. Add a license of your choice
(e.g. MIT) if you plan to distribute it.
