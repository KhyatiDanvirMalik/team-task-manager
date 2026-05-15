# Team Task Manager

## Table of Contents


---

## Project Overview

It is a full-stack Team Task Management Web Application built as part of a coding assignment. It allows multiple users to collaborate on projects, assign and track tasks, and monitor team progress — inspired by tools like Trello and Asana.

The application supports two roles — **Admin** and **Member** — with distinct permissions for managing projects and tasks. It is fully deployed on **Railway** with a React frontend and a Node.js/Express backend connected to **MongoDB Atlas**.

---

## Live Demo

- **Frontend (Live App):** https://team-task-manager-application.up.railway.app
- **Backend API:** https://best-team-task-manager.up.railway.app

---

## Tech Stack

**Frontend**
- React 18 (with Vite)
- React Router v6
- Axios (HTTP client)
- Tailwind CSS
- Context API (global auth state)

**Backend**
- Node.js + Express.js
- MongoDB Atlas (NoSQL database)
- Mongoose (ODM)
- JSON Web Tokens (JWT) for authentication
- bcryptjs (password hashing)
- express-validator (input validation)
- CORS

**Deployment**
- Railway (both frontend and backend hosted as separate services)
- MongoDB Atlas (cloud database)

---

## Features

### Authentication
- Signup with Name, Email, Password
- Login with JWT-based authentication (token expires in 7 days)
- Password hashed using bcrypt (salt rounds: 10)
- Protected routes — unauthenticated users are redirected to login
- Token stored in localStorage; auto-cleared on 401 response

### Project Management
- Create projects with a name, description, and color tag
- Project creator is automatically assigned as **Admin**
- Admin can add members to a project by searching via email
- Admin can remove members (cannot remove themselves)
- Admin can update or delete the project (deleting a project also deletes all its tasks)
- Members can only view projects they are part of

### Task Management
- Create tasks with: Title, Description, Due Date, Priority (Low / Medium / High)
- Assign tasks to any project member
- Update task status: To Do → In Progress → Done
- Edit task details (Admin only)
- Delete tasks (Admin only)
- Tasks have a virtual `isOverdue` field — automatically computed based on due date and status

### Dashboard
- Summary cards: Total tasks, To Do, In Progress, Done, Overdue
- Tasks grouped by status
- Tasks per user (workload view)
- Overdue task highlight

### Role-Based Access
- **Admin:** Full control — create/edit/delete tasks, manage members, update project settings
- **Member:** Can view assigned tasks and update their status only

---

## Project Structure

```
team-task-manager/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT protect middleware
│   ├── models/
│   │   ├── User.js              # User schema (name, email, password, avatar)
│   │   ├── Project.js           # Project schema (name, admin, members, color)
│   │   └── Task.js              # Task schema (title, status, priority, dueDate, assignedTo)
│   ├── routes/
│   │   ├── auth.js              # Signup, Login, /me
│   │   ├── projects.js          # CRUD for projects + member management
│   │   ├── tasks.js             # CRUD for tasks
│   │   └── dashboard.js         # Aggregated dashboard stats
│   ├── .env                     # Environment variables (not committed to git)
│   ├── server.js                # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable UI components
    │   │   ├── CreateProjectModal.jsx
    │   │   ├── CreateTaskModal.jsx
    │   │   ├── EditTaskModal.jsx
    │   │   ├── DashboardPanel.jsx
    │   │   ├── MembersPanel.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── Layout.jsx
    │   │   └── Modal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state (login, logout, user)
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProjectDetail.jsx
    │   ├── utils/
    │   │   └── api.js           # Axios instance with base URL + auth interceptor
    │   ├── App.jsx              # Routes definition
    │   └── main.jsx             # React entry point
    ├── vite.config.js
    └── package.json
```

---

## Database Design

Three MongoDB collections with the following relationships:

**User**
```
_id, name, email, password (hashed), avatar (auto-generated), createdAt, updatedAt
```

**Project**
```
_id, name, description, color,
admin → ref: User,
members: [ { user → ref: User, role: "Admin" | "Member" } ],
createdAt, updatedAt
```

**Task**
```
_id, title, description, status ("To Do" | "In Progress" | "Done"),
priority ("Low" | "Medium" | "High"), dueDate,
project → ref: Project,
assignedTo → ref: User,
createdBy → ref: User,
virtual: isOverdue (computed),
createdAt, updatedAt
```

> Relationships: A Project has many Tasks. A Task belongs to one Project and is assigned to one User. A Project has many Users (members).

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT |
| GET | `/me` | Yes | Get current logged-in user |

### Project Routes — `/api/projects`

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/` | Yes | Any member | Get all projects for current user |
| POST | `/` | Yes | Any | Create a new project |
| GET | `/:id` | Yes | Member of project | Get single project |
| PUT | `/:id` | Yes | Admin | Update project details |
| DELETE | `/:id` | Yes | Admin | Delete project + all its tasks |
| POST | `/:id/members` | Yes | Admin | Add a member by email |
| DELETE | `/:id/members/:userId` | Yes | Admin | Remove a member |

### Task Routes — `/api/tasks`

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/project/:projectId` | Yes | Member | Get all tasks of a project |
| POST | `/` | Yes | Admin | Create a task |
| PUT | `/:id` | Yes | Admin / Assignee | Update task (status for member, full edit for admin) |
| DELETE | `/:id` | Yes | Admin | Delete a task |

### Dashboard Routes — `/api/dashboard`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Yes | Get task stats — total, by status, by user, overdue |

---

## Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Update / Delete project | ✅ | ❌ |
| Add / Remove members | ✅ | ❌ |
| Create task | ✅ | ❌ |
| Edit task details | ✅ | ❌ |
| Delete task | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| View project & tasks | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## Local Setup & Installation

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas account (free tier works)

### Step 1 — Clone the repository

```bash
git clone https://github.com/KhyatiDanvirMalik/team-task-manager.git
cd team-task-manager
```

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend will run at `http://localhost:5000`

### Step 3 — Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

### Step 4 — Open in browser

Go to `http://localhost:5173`, sign up for a new account, and start using the app.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `mysecretkey` |
| `CLIENT_URL` | Frontend URL (used for CORS) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Full backend URL (no trailing slash) | `http://localhost:5000` |

> **Important:** Vite only exposes variables prefixed with `VITE_` to the browser. Never prefix sensitive secrets with `VITE_`.

---

## Deployment on Railway

Both the frontend and backend are deployed as **separate services** on Railway.

### Backend Deployment

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select the `backend/` folder as the root directory (configure in Railway settings)
3. Set the **Start Command** to: `node server.js`
4. Add the following environment variables in Railway → Variables tab:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend.up.railway.app
PORT=5000
```

5. Railway will assign a public URL like `https://your-backend.up.railway.app`

### Frontend Deployment

1. Add a second service in the same Railway project → from GitHub repo
2. Set the root directory to `frontend/`
3. Set **Build Command:** `npm run build`
4. Set **Start Command:** `npm run preview`
5. Add the following environment variable:

```env
VITE_API_URL=https://your-backend.up.railway.app
```

6. In `vite.config.js`, ensure the `allowedHosts` array includes your Railway frontend domain.

> **Note:** `VITE_API_URL` must be set **before** the build step runs, because Vite bakes environment variables into the bundle at build time — not at runtime.

### MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Under **Network Access**, add `0.0.0.0/0` to allow Railway's dynamic IPs
4. Under **Database Access**, create a user with read/write permissions
5. Copy the connection string and use it as `MONGO_URI`
