<div align="center">

# ExamPro

**Online examination management, from exam creation to answer review.**

React 19 · Express 5 · MongoDB · Node 18+

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Data models](#data-models) · [API](#api-reference) · [Rules](#business-rules) · [Setup](#getting-started) · [Security](#security-notes)

</div>

<br>

## Overview

ExamPro is a full-stack MERN application. Admins build exams and question sets, students sit timed exams, and every attempt is scored, stored and open to review.

It includes separate Admin and Student dashboards, a notification bell, exam availability gating, in-app popups instead of native browser dialogs, and a full answer-review screen after each attempt.

### How it works

| Step | Who | What happens |
| :--: | --- | --- |
| 1 | Admin | Creates an exam with a duration, total marks, a start and end date/time, and an optional publish time. |
| 2 | Admin | Adds questions until their marks add up to the exam's total. Only then is the exam **published**. |
| 3 | Student | Registers and sees published exams. Future exams appear as *Coming Soon*. Takes the exam under a countdown. |
| 4 | System | On submit, or when time runs out, the attempt is scored and saved. The student can review every question, including the correct answer for the ones they missed. |

<br>

## Features

### Admin

| Area | What it does |
| --- | --- |
| **Dashboard** | Totals for exams, questions, students and results. Average and pass metrics, a recent activity feed, quick actions. |
| **Exams** | Create, edit and delete. Set start, end and optional publish time. If questions are incomplete at publish time, the exam does not auto-publish. |
| **Questions** | Pick an exam once, then add questions in a continuous flow. Questions are filtered to that exam, numbered `Q1`, `Q2`, … and validated. |
| **Marks criteria** | A question set must sum to the exam's `totalMarks`. The UI warns when it is short and blocks questions that would overshoot. |
| **Students** | List, search, edit and delete accounts. |
| **Results** | All results with score, percentage and status. Individual results can be deleted. |
| **Settings** | Passing percentage, default duration, default total marks, and a toggle for student self-registration. |

Exam status badges:

| Badge | Meaning |
| --- | --- |
| `Draft` | Questions are missing or the marks do not add up yet. |
| `Coming Soon` | Complete, but the start time is still ahead. |
| `Published` | Complete and inside its start/end window. |
| `Ended` | The end time has passed. |

### Student

| Area | What it does |
| --- | --- |
| **Dashboard** | Available exams, completed results, average score and pass rate. |
| **Availability** | Only exams inside their window, with complete questions, can be started. Upcoming exams show *Coming Soon*. Ended exams show *Ended* and cannot be opened. |
| **Timed exams** | Live countdown. The exam submits itself when the timer reaches zero. |
| **Scoring** | Score, percentage and Pass/Fail computed on submit against the configured passing percentage. |
| **Answer review** | Shows the chosen answer, marks it right or wrong, and reveals the correct answer for wrong ones. |
| **Profile** | Update personal details and change password. |

### Shared

- **Role-based layouts.** `AdminLayout` and `StudentLayout`, each with a sidebar.
- **Notification bell.** Built from live data (new exams, completed exams, registered students), with an unread badge kept in `localStorage`.
- **In-app popups.** `NoticeModal` and `ConfirmModal` replace `alert()` and `window.confirm()`.
- **Accurate relative times.** "x minutes ago" uses real timestamps and falls back to the MongoDB ObjectId timestamp for older records. See [Timestamps](#timestamps).

<br>

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router DOM 7, Create React App (`react-scripts` 5) |
| Styling | Plain CSS (`src/index.css`, `src/App.css`) and inline SVG `Icons` |
| Backend | Node.js, Express 5 |
| Database | MongoDB through Mongoose 9 |
| Middleware | CORS, `express.json()` |
| Tooling | npm, Git |

<br>

## Architecture

```
  React SPA                         Express REST API                MongoDB
  localhost:3000                    localhost:5000                  "examination"

  Pages · Layouts · Modals   HTTP   routes ── models (Mongoose)
  NotificationBell, utils   ─────►  validate, enrich, respond  ───►  collections
                            ◄─────
                             JSON
```

### Request flow

1. The React app calls the REST API with `fetch`. The base URL `http://localhost:5000` is written directly in the page components.
2. Express routes in `backend/routes/*` validate input and hand off to Mongoose models.
3. Mongoose reads and writes MongoDB at `mongodb://localhost:27017/examination`.
4. Exam endpoints add computed fields (`isPublished`, `isUpcoming`, `isAvailable`, `questionCount`, `questionsTotalMarks`) before responding. See [Business rules](#business-rules).

### Frontend

| Part | Details |
| --- | --- |
| **Routing** (`src/App.js`) | Public: `/` (login), `/register`.<br>Admin: `/admin-dashboard`, `/exam-management`, `/question-management`, `/student-management`, `/result-management`, `/admin-settings`.<br>Student: `/student-dashboard`, `/exam/:examId`, `/result/:id`, `/student-settings`. |
| **Layouts** | `AdminLayout` and `StudentLayout`: sidebar, greeting and notification bell for the dashboard-style pages. |
| **Reusable UI** | `Modal.js` (base), `NoticeModal.js`, `ConfirmModal.js`, `Icons.js`, `NotificationBell.js`. |
| **Utilities** | `src/utils/time.js` handles timestamp parsing and relative time formatting. |
| **Session** | `userId`, `username` and `usertype` are kept in `localStorage` after login and used for role gating and API calls. |

### Backend

| Part | Details |
| --- | --- |
| **Entry point** (`server.js`) | Starts Express, enables CORS and JSON parsing, mounts routers under `/api/*`, connects to MongoDB. |
| **Routers** | One per resource: `login`, `users`, `exams`, `questions`, `results`, `settings`. |
| **Models** | Mongoose schemas with `timestamps: true` (`createdAt`, `updatedAt`). |

<br>

## Project structure

```
Online Exam Management/
├── backend/
│   ├── server.js                 Express app and MongoDB connection
│   ├── seed.js                   Creates the default admin account
│   ├── package.json
│   ├── model/
│   │   ├── loginmodel.js         Authentication accounts
│   │   ├── usermodel.js          User profiles (Admin / Student)
│   │   ├── exammodel.js          Examinations
│   │   ├── questionmodel.js      Exam questions
│   │   ├── resultmodel.js        Student attempts and results
│   │   └── settingmodel.js       Global system settings
│   └── routes/
│       ├── loginRoutes.js        Register, login, password
│       ├── userRoutes.js         User profiles (CRUD)
│       ├── examRoutes.js         Exams (CRUD and publish status)
│       ├── questionRoutes.js     Questions (CRUD)
│       ├── resultRoutes.js       Results (CRUD)
│       └── settingRoutes.js      Global settings
│
└── frontend/
    ├── public/
    │   └── index.html            App title: "ExamPro"
    ├── package.json
    └── src/
        ├── App.js                Route definitions
        ├── index.js / index.css
        ├── components/
        │   ├── AdminLayout.js
        │   ├── StudentLayout.js
        │   ├── Modal.js              Base modal
        │   ├── NoticeModal.js        Replaces alert()
        │   ├── ConfirmModal.js       Replaces window.confirm()
        │   ├── NotificationBell.js
        │   └── Icons.js
        ├── pages/
        │   ├── Login.js / Register.js
        │   ├── AdminDashboard.js / StudentDashboard.js
        │   ├── ExamManagement.js / QuestionManagement.js
        │   ├── StudentManagement.js / ResultManagement.js
        │   ├── ExamPage.js           Exam taking and auto scoring
        │   ├── ResultPage.js         Result and answer review
        │   └── AdminSettings.js / StudentSettings.js
        └── utils/
            └── time.js               Timestamp and relative time helpers
```

<br>

## Data models

<details>
<summary><b>Login</b> · <code>logins</code></summary>

<br>

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Required, unique |
| `password` | String | Required (stored in plain text) |
| `usertype` | String | `"Admin"` or `"Student"` |
| timestamps | Date | `createdAt`, `updatedAt` |

</details>

<details>
<summary><b>User</b> · <code>users</code></summary>

<br>

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Required, unique |
| `name` | String | Required |
| `email` | String | Required, unique, lowercased |
| `phoneNumber` | String | Required |
| `gender` | String | Required |
| `usertype` | String | Default `"Student"` |
| timestamps | Date | `createdAt`, `updatedAt` |

</details>

<details>
<summary><b>Exam</b> · <code>exams</code></summary>

<br>

| Field | Type | Notes |
| --- | --- | --- |
| `examName` | String | Required |
| `description` | String | Required |
| `duration` | Number | Required, in minutes |
| `totalMarks` | Number | Required |
| `createdDate` | String | Required, `YYYY-MM-DD`. Sent by the form; the true creation time is `createdAt`. |
| `examDate` | String | Required. Legacy, may be date-only or date-time. |
| `examStartDateTime` | String | Optional, `YYYY-MM-DDTHH:mm` |
| `examEndDateTime` | String | Optional, `YYYY-MM-DDTHH:mm` |
| `examEndDate` | String | Optional, `YYYY-MM-DD`. Legacy end date, kept for backward compatibility. |
| `publishAt` | String | Optional, `YYYY-MM-DDTHH:mm`. Scheduled publish time. |
| timestamps | Date | `createdAt`, `updatedAt` |

Exam endpoints also return computed fields that are **not stored**:

`questionCount` · `questionsTotalMarks` · `isPublished` · `isPublishedQuestions` · `isUpcoming` · `isEnded` · `isAvailable` · `publishTimeReached` · `canAutoPublish` · `publishMissed` · `missedPublishReason`

</details>

<details>
<summary><b>Question</b> · <code>questions</code></summary>

<br>

| Field | Type | Notes |
| --- | --- | --- |
| `examId` | ObjectId | Ref to `Exam`, required |
| `question` | String | Required |
| `options` | Object | `{ A, B, C, D }`, all required strings |
| `correctAnswer` | String | Required, `"A"` to `"D"` |
| `marks` | Number | Required |
| timestamps | Date | `createdAt`, `updatedAt` |

</details>

<details>
<summary><b>Result</b> · <code>results</code></summary>

<br>

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId | Ref to `User`, required |
| `examId` | ObjectId | Ref to `Exam`, required |
| `answers` | Object | Map of `{ questionId: chosenOption }` |
| `score` | Number | Required |
| `totalMarks` | Number | Required |
| `percentage` | Number | Required |
| `status` | String | `"Pass"` or `"Fail"` |
| `submittedAt` | Date | Defaults to submission time |
| timestamps | Date | `createdAt`, `updatedAt` |

</details>

<details>
<summary><b>Setting</b> · <code>settings</code></summary>

<br>

A single global document (`key: "global"`).

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `key` | String | `global` | Unique |
| `passingPercentage` | Number | `40` | Pass threshold, 0 to 100 |
| `defaultExamDuration` | Number | `60` | Pre-filled in new exams |
| `defaultTotalMarks` | Number | `100` | Pre-filled in new exams |
| `allowRegistration` | Boolean | `true` | Allows student self-registration |
| timestamps | Date | | `createdAt`, `updatedAt` |

</details>

<br>

## API reference

Base URL: `http://localhost:5000`

<details>
<summary><b>Auth</b> · <code>/api/login</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/register` | Create a student account (respects `allowRegistration`) |
| `POST` | `/login` | Authenticate. Returns `usertype`, `username`, `userId`. |
| `GET` | `/check-username/:username` | Check whether a username is available |
| `PUT` | `/password` | Change password (requires the current one) |
| `GET` | `/` | List login accounts |
| `DELETE` | `/:id` | Delete a login account |

</details>

<details>
<summary><b>Users</b> · <code>/api/users</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Create a user profile |
| `GET` | `/?usertype=Student` | List users, with optional `usertype` filter |
| `GET` | `/username/:username` | Get a user by username |
| `GET` | `/:id` | Get a user by id |
| `PUT` | `/:id` | Update profile (name, email, phone, gender) |
| `PUT` | `/username/:username` | Update profile by username |
| `DELETE` | `/:id` | Delete the user, their login and their results |

</details>

<details>
<summary><b>Exams</b> · <code>/api/exams</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Create an exam (starts as a draft) |
| `GET` | `/` | List exams with publish and availability status |
| `GET` | `/:id` | Get one exam with publish and availability status |
| `PUT` | `/:id` | Update an exam |
| `DELETE` | `/:id` | Delete the exam, its questions and all its results. Returns counts. |

</details>

<details>
<summary><b>Questions</b> · <code>/api/questions</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Add a question |
| `GET` | `/` | List all questions, with the exam populated |
| `GET` | `/exam/:examId` | List questions for one exam |
| `GET` | `/:id` | Get one question |
| `PUT` | `/:id` | Update a question |
| `DELETE` | `/:id` | Delete a question |

</details>

<details>
<summary><b>Results</b> · <code>/api/results</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Save a result (sent by the exam page) |
| `GET` | `/` | List all results, with user and exam populated |
| `GET` | `/user/:userId` | Results for one student, exam populated |
| `GET` | `/exam/:examId` | Results for one exam, student populated |
| `GET` | `/:id` | Get one result, user and exam populated |
| `DELETE` | `/:id` | Delete a result |

</details>

<details>
<summary><b>Settings</b> · <code>/api/settings</code></summary>

<br>

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Get global settings (created if missing) |
| `PUT` | `/` | Update global settings (validated) |

</details>

<br>

## Business rules

### Exam publishing

Publish state is computed on every exam request. Nothing is stored, so it cannot drift out of sync.

```
isPublishedQuestions = questionCount > 0 AND questionsTotalMarks == exam.totalMarks
isPublished          = isPublishedQuestions
isUpcoming           = start time > now          (server local time)
isEnded              = end time   < now          (server local time)
isAvailable          = isPublished
                       AND publish time reached  (if scheduled)
                       AND NOT isUpcoming
                       AND NOT isEnded
```

- A new exam starts as a **Draft**. It is not published until its questions are complete and it is inside its time window.
- If `publishAt` is set and the questions are not complete by then, the exam will not auto-publish (`publishMissed = true`). The admin has to finish the questions.
- Editing questions or exam times changes availability immediately.
- Start, end and publish times are all compared against the server's local time.

### Availability gating

| Exam state | Student sees |
| --- | --- |
| Available | Full details and a Start button. |
| Upcoming | *Coming Soon* with the exam name only. Description, details and Start button are hidden. |
| Ended | *Ended*, with the Start button disabled. |

`ExamPage` also guards direct navigation. Unpublished exams show an "unavailable" message, upcoming exams return before any questions are fetched, and ended exams are blocked.

### Marks criteria

- A question set must sum to the exam's `totalMarks`.
- The question editor shows a live criteria panel. It warns when the total is short and blocks adding or updating a question that would overshoot.

### Scoring

Scoring runs on the client at submit time (`ExamPage`) and the result is stored.

```
score       = sum of marks for correctly answered questions
percentage  = round((score / totalMarks) * 100, 2)
status      = percentage >= passingPercentage ? "Pass" : "Fail"
```

The exam auto-submits when the timer reaches `0:00`. A guard prevents a double submission from the timer and a click.

### Cascading deletes

| Deleting | Also removes |
| --- | --- |
| An **exam** | Its questions and all of its student results |
| A **student** | Their login account and all of their results |

### Timestamps

- All models use Mongoose `timestamps: true` (`createdAt`, `updatedAt`).
- Results use `submittedAt` as the attempt time.
- Relative labels ("x minutes ago") prefer real timestamps and fall back to the MongoDB ObjectId timestamp, so records created before timestamps were added still show the right time. See `frontend/src/utils/time.js`.

<br>

## Getting started

**Prerequisites:** Node.js 18 or newer, npm, and MongoDB running locally on `mongodb://localhost:27017`.

### 1. Start the backend

```bash
cd backend
npm install

npm run seed     # creates the default admin account (run once)
npm start        # API at http://localhost:5000
```

You should see `Connected to MongoDB` and `Server running on port 5000`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm start        # app at http://localhost:3000
```

### 3. Sign in

After `npm run seed`:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin@123` |

Students can register themselves from the Register page while `allowRegistration` is on.

> If the seed doesn't create the admin in your environment, register a normal account and change its `usertype` to `Admin` directly in MongoDB.

<br>

## Usage walkthrough

**As an admin**

1. Sign in with `admin` / `admin@123`.
2. Open **Manage Exams** and create an exam: name, description, duration, total marks, exam date. It is saved as a Draft.
3. Open **Manage Questions**, select the exam, and add questions until the marks equal the exam's total. The exam becomes Published, or Coming Soon if its date is in the future.
4. Use **Manage Students** to review, edit or remove accounts.
5. Use **Results** to monitor attempts and **Settings** to change the passing percentage, defaults and registration.

**As a student**

1. Register, or sign in with an existing account.
2. Start an available exam from the dashboard and answer within the timer.
3. Submit manually, or let the timer submit for you.
4. Open the result page to see your score, percentage and Pass/Fail, along with the answer review.

<br>

## Scripts

| Where | Command | Description |
| --- | --- | --- |
| `backend/` | `npm start` | Run the API server (`node server.js`) |
| `backend/` | `npm run seed` | Seed the default admin (`node seed.js`) |
| `frontend/` | `npm start` | Dev server at `http://localhost:3000` |
| `frontend/` | `npm run build` | Production build into `frontend/build` |
| `frontend/` | `npm test` | Run tests in watch mode |
| `frontend/` | `npm run eject` | Eject CRA config (irreversible) |

## Configuration

| Setting | Location | Value |
| --- | --- | --- |
| API base URL | Hardcoded in frontend `fetch` calls | `http://localhost:5000` |
| Backend port | `backend/server.js` | `5000` |
| Mongo URI | `backend/server.js`, `backend/seed.js` | `mongodb://localhost:27017/examination` |
| CORS | `backend/server.js` (`cors()`) | Open to all origins |
| Global options | Admin Settings page, `settings` collection | Passing %, defaults, registration |

<br>

## Security notes

This project is meant for learning and demonstration. Before any production use:

- **Passwords are stored in plain text.** Hash them (for example with `bcrypt`) and never return them in responses.
- **There is no token-based auth.** The session lives in `localStorage` and API routes are not protected on the server. Add JWT or session middleware and route guards.
- **URLs and ports are hardcoded.** Move the API base URL and Mongo URI into environment variables.
- **The timer is client-side only.** A hardened system should also enforce time limits on the server.
- **CORS is fully open.** Restrict allowed origins.
- **Dates are plain strings.** `Exam.examDate` and `createdDate` are stored as `YYYY-MM-DD` strings, and availability logic depends on the server's local date.

<br>

## License

Provided for educational purposes. Add a license of your choice (for example MIT) if you plan to distribute it.