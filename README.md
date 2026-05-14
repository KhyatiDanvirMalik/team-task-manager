# TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication** – JWT-based signup/login
- **Projects** – Create projects, manage members, color-coded organization
- **Tasks** – Kanban board with To Do / In Progress / Done columns
- **Role-based access** – Admin manages everything; Members update only their assigned tasks
- **Dashboard** – Completion ring, priority breakdown, per-member task progress
- **Real-time feedback** – Toast notifications, optimistic UI

## 🛠 Tech Stack

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS    |
| Backend   | Node.js, Express.js             |
| Database  | MongoDB Atlas (Mongoose ORM)    |
| Auth      | JWT (JSON Web Tokens)           |
| Deployment| Railway                         |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── models/         # Mongoose schemas (User, Project, Task)
│   ├── routes/         # Express route handlers
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Route-level pages
    │   ├── context/    # React context (Auth)
    │   └── utils/      # Axios API instance
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### Step 1 – Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### Step 2 – Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=any_long_random_string_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev    # uses nodemon (hot reload)
# OR
npm start      # plain node
```

Backend runs at `http://localhost:5000`

### Step 3 – Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

For local development, the Vite dev server proxies `/api` to `localhost:5000` automatically — no need to set `VITE_API_URL` locally.

Start frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🌐 Deployment on Railway

### Step 1 – Create MongoDB Atlas cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Add a database user (username + password)
4. Allow network access: `0.0.0.0/0` (allow all IPs for Railway)
5. Copy the connection string:  
   `mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager`

### Step 2 – Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo → set **Root Directory** to `backend`
4. Go to **Variables** tab and add:
   ```
   PORT=5000
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<random secret>
   JWT_EXPIRE=7d
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.railway.app
   ```
5. Railway auto-detects Node.js and deploys. Copy the generated URL (e.g. `https://taskflow-backend.railway.app`)

### Step 3 – Deploy Frontend to Railway
1. Click **New Service → Deploy from GitHub repo** (same repo)
2. Set **Root Directory** to `frontend`
3. Go to **Variables** tab and add:
   ```
   VITE_API_URL=https://taskflow-backend.railway.app/api
   ```
4. Railway runs `npm run build` and serves the `dist/` folder

### Step 4 – Final check
- Visit your frontend Railway URL
- Sign up, create a project, add tasks — everything should work!

---

## 🔌 API Reference

### Auth
| Method | Endpoint          | Description       | Auth |
|--------|-------------------|-------------------|------|
| POST   | /api/auth/signup  | Create account    | ❌   |
| POST   | /api/auth/login   | Login             | ❌   |
| GET    | /api/auth/me      | Get current user  | ✅   |

### Projects
| Method | Endpoint                          | Description          | Role   |
|--------|-----------------------------------|----------------------|--------|
| GET    | /api/projects                     | List my projects     | Any    |
| POST   | /api/projects                     | Create project       | Any    |
| GET    | /api/projects/:id                 | Get project          | Member |
| PUT    | /api/projects/:id                 | Update project       | Admin  |
| DELETE | /api/projects/:id                 | Delete project       | Admin  |
| POST   | /api/projects/:id/members         | Add member by email  | Admin  |
| DELETE | /api/projects/:id/members/:userId | Remove member        | Admin  |

### Tasks
| Method | Endpoint                     | Description       | Role          |
|--------|------------------------------|-------------------|---------------|
| GET    | /api/tasks/project/:id       | Get project tasks | Member        |
| POST   | /api/tasks                   | Create task       | Admin         |
| PUT    | /api/tasks/:id               | Update task       | Admin/Assignee|
| DELETE | /api/tasks/:id               | Delete task       | Admin         |

### Dashboard
| Method | Endpoint                  | Description      | Auth |
|--------|---------------------------|------------------|------|
| GET    | /api/dashboard/:projectId | Project stats    | ✅   |

---

## 🔐 Role Permissions Summary

| Action                   | Admin | Member |
|--------------------------|-------|--------|
| Create/delete tasks      | ✅    | ❌     |
| Assign tasks to users    | ✅    | ❌     |
| Update task status       | ✅    | ✅ (own tasks only) |
| Add/remove members       | ✅    | ❌     |
| View project & tasks     | ✅    | ✅     |
| View dashboard           | ✅    | ✅     |

---

## 🎬 Demo Video Script (2–5 min)

1. **Intro (30s)** – Briefly explain the app: "A team task manager with role-based access built using React, Express, and MongoDB, deployed on Railway."
2. **Sign up & login (30s)** – Create a new account, log in
3. **Create project (30s)** – Show the project creation with colors
4. **Add tasks (1min)** – Create multiple tasks with priorities, due dates, assignments
5. **Kanban board (30s)** – Change task statuses, show columns updating
6. **Dashboard (30s)** – Show the stats: completion ring, per-user breakdown
7. **Members tab (30s)** – Add a member by email, show role difference
8. **Quick code walkthrough (1min)** – Show JWT middleware, Task model, one API route

---

## 🧑‍💻 Explaining Your Code

Be ready to explain:
- **Why JWT?** – Stateless, works well with REST APIs, no session storage needed on server
- **Why Mongoose?** – Schema validation + easy relationships via `.populate()`
- **Role enforcement** – Checked in every route via `isAdmin()` helper, not just frontend
- **Error handling** – Centralized Express error handler + per-route try/catch
- **CORS** – Configured with specific `CLIENT_URL` origin in production
