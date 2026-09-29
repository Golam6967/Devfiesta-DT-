# 🚀 DevFiesta

DevFiesta is a premium, full-stack collaborative platform designed to empower developers, students, instructors, and event organizers. It facilitates the end-to-end lifecycle of **Hackathons**, **Project Showcases**, and **Project-Based Learning (PBL)** modules. Developed as a software project lab (SPL) platform, it bridges the gap between learning and building by bringing students, hosts, supervisors, and judges into a single unified workspace.

---

## 📸 Preview & Branding
<div align="center">
  <img src="./frontend/src/Images/logo.png" alt="DevFiesta Logo" width="180px" style="border-radius: 50%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
  <h3>DevFiesta — Connect, Build, Evaluate</h3>
  <p>An ecosystem built for developers, by developers.</p>
</div>

---

## 🛠️ Technology Stack

DevFiesta is built using a modern, decoupled architecture:

### Frontend
* **Core Framework:** [React 19](https://react.dev/) & [Vite](https://vite.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/vite` plugin for optimal compiler performance)
* **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
* **Routing:** [React Router DOM v7](https://reactrouter.com/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Components & Selectors:** [React Select](https://react-select.com/)

### Backend
* **Runtime Environment:** [Node.js](https://nodejs.org/)
* **Server Framework:** [Express.js v5](https://expressjs.com/)
* **Database Driver:** [MySQL2](https://sidorares.github.io/node-mysql2/) (utilizing high-performance Connection Pooling)
* **Authentication & Security:** JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing
* **Validation:** [Express-Validator](https://express-validator.github.io/)

---

## 🌟 Key Features

### 1. User Authentication & Profile Customization
* **Secure Auth:** Session management via JWT saved securely on the client.
* **Detailed Profiles:** Showcases full name, date of birth, specialized skills, interests, accomplishments, bio, institution name, contact details, profile picture, and link to GitHub.
* **Dynamic Views:** Easily update settings and passwords.

### 2. Project Showcase Directory
* **Project Creation:** Users can publish projects with titles, repository links, overview descriptions, motivations, features, and genre tags.
* **Collaboration & Access:** Link individual users or teams directly to a project.
* **Advanced Queries:** Sort and filter projects by genre or creation date.

### 3. Hackathon Management Suite
* **Hosting Dashboard:** Create hackathons with specific durations, categories, starting/ending dates, customizable rule books, banners, and judges.
* **Evaluation Criteria:** Dynamically define judging criteria per hackathon.
* **Team Registration:** Form teams and sign up for open hackathons.
* **Interactive Marking:** Designated judges rate submissions based on preset criteria with comment support.
* **Leaderboards:** Dynamic SQL ranking computes total marks across judges and presents real-time team standings.

### 4. Project-Based Learning (PBL) System
* **Role-Based Workflows:** Built-in backend workflows for **Hosts**, **Supervisors**, **Judges**, and **Students**.
* **PBL Milestone Tracking:** Track milestones across proposals, progress evaluations, and final presentations.
* **Supervisor Mapping:** Match supervisors to student teams to monitor milestone files.
* **Unified Mark Sheet:** Consolidate judge evaluations and criteria markings for individual students.

---

## 📁 Repository Structure

```filepath
DevFiesta/
├── Backend/                    # Node.js + Express Backend
│   ├── config/                 # Database configuration (MySQL connection pool)
│   ├── controllers/            # Controller layer (auth, projects, hackathons, PBL, etc.)
│   ├── db/schema.sql           # Full MySQL schema, auto-loaded by the Docker MySQL container
│   ├── middleware/             # Express middlewares (authentication, validators)
│   ├── models/                 # Model layer writing raw SQL queries using mysql2/promise
│   ├── routes/                 # Express API route endpoints
│   ├── utils/                  # Helper utilities (JWT, Response Handler, Password Utils)
│   ├── server.js               # Entry point of the backend server
│   ├── package.json            # Backend dependencies & scripts
│   ├── .env.example            # Template for Backend/.env
│   └── .gitignore
│
├── frontend/                   # React + Vite Frontend (hackathon/project platform + PBL module)
│   ├── public/                 # Public assets
│   ├── src/
│   │   ├── assets/             # SVGs and general static files
│   │   ├── components/         # React pages & components (Landing, Signup, Profile, etc.)
│   │   ├── hooks/              # Context Providers (AutoAuth, ProjectContext, HackathonContext)
│   │   ├── layouts/            # Page layouts and containers
│   │   ├── routes/             # Client-side routing configuration (Routing.jsx)
│   │   ├── pbl/                # Project-Based Learning module, mounted at /pbl/*
│   │   │   ├── Pages/          # PBL dashboards (student, supervisor, admin, evaluator, login)
│   │   │   ├── components/     # PBL-specific components (cards, marking form, logo)
│   │   │   ├── Styles/         # PBL page styles
│   │   │   └── routes/         # Nested PBL router (routing.jsx)
│   │   ├── Images/             # Brand logos, landing page backgrounds, team pictures
│   │   ├── App.jsx             # Main App layout & route renderer
│   │   ├── main.jsx            # React root mount point
│   │   └── index.css           # Global styles and tailwind directives
│   ├── vite.config.js          # Vite build configuration
│   ├── eslint.config.js        # Linter rules
│   └── package.json            # Frontend dependencies & scripts
│
├── docker-compose.yml          # MySQL service, seeded from Backend/db/schema.sql
├── .env.example                # Template for docker-compose's DB credentials
└── README.md                   # Main Project Documentation
```

---

## 💾 Database Schema Overview

DevFiesta uses a relational schema in **MySQL** to link projects, teams, users, hackathons, and PBL modules:

* **`users`**: User records, bios, skills, and password hashes.
* **`projects`**: Project titles, repositories, overview, and metrics.
* **`p_u_junction`**: Links users to individual projects.
* **`teams`**: Stores team names and basic metadata.
* **`team_participants`**: Joins `teams`, `users`, and `hackathon` to represent active participants.
* **`hackathon`**: Stores hackathon criteria, durations, rulebooks, host details, and dates.
* **`judges`**: Assigns specific users as judges to a hackathon.
* **`criterias`**: Stores individual rating metrics for hackathons.
* **`marking`**: Captures judging marks and text feedback for teams per criteria.
* **`p_t_junction`**: Associates projects with teams and their target hackathons.
* **`pbl`**: Stores PBL module metadata, host, dates, and student/judge/supervisor passwords.
* **`studentsXpbl` / `judgeXpbl` / `supervisor`**: Core enrollment tables matching users to role permissions inside a specific PBL instance.
* **`teamXpbl`**: Maps student teams, PBL courses, and supervisors together.
* **`pbl_criteria`**: PBL evaluation criteria definitions (no admin route creates these yet — seed rows manually until one exists).
* **`pbl_markings`**: Tracks student markings across milestones per PBL evaluation criteria.
* **`pbl_team_files`**: Stores each team's submitted presentation file link per milestone (proposal/progress/final).

---

## ⚡ API Endpoint Reference

The backend exposes the following RESTful routes:

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Registers a new user account.
* `POST /api/auth/login` — Authenticates user credentials and returns a JWT.
* `GET /api/auth/profile` — Retrieves the authenticated user's profile.
* `PUT /api/auth/profile` — Updates user profile fields.
* `GET /api/auth/users` — Fetches a list of all registered users.

### Projects (`/api/project`)
* `POST /api/project/create` — Creates a new project profile.
* `POST /api/project/create-team` — Submits a project on behalf of a team.
* `GET /api/project/all-projects` — Fetches all showcases.
* `GET /api/project/:project_id` — Retrieves a specific project's details.
* `PUT /api/project/:project_id` — Updates project details.
* `DELETE /api/project/:project_id` — Deletes a project.

### Hackathons (`/api/hackathon`)
* `POST /api/hackathon/host` — Creates/hosts a new hackathon.
* `GET /api/hackathon/all-hackathons` — Gets list of all hosted events.
* `GET /api/hackathon/:hackathon_id` — Gets a single hackathon.
* `GET /api/hackathon/my-hackathons` — Gets hackathons hosted by the current user.
* `GET /api/hackathon/my-judged` — Gets hackathons the current user is judging.
* `GET /api/hackathon/role/:hackathon_id` — Resolves the current user's role (`Host`, `Judge`, `Participant`, `No Role`).

### Participation (`/api/participation`)
* `POST /api/participation/register` — Registers a team for a hackathon.
* `GET /api/participation/teams/:hackathon_id` — Lists all registered teams for a hackathon.
* `POST /api/participation/mark` — Submits judge scores for a team.
* `GET /api/participation/leaderboard/:hackathon_id` — Returns the current leaderboard rankings.

### PBL Modules (`/api/pbl`)
* `POST /api/pbl/host` — Establishes a new PBL module.
* `GET /api/pbl/all` — Returns all active PBL programs.
* `GET /api/pbl/:pbl_id` — Gets specific PBL course metrics.
* `POST /api/pbl/enroll-student` — Registers a student.
* `POST /api/pbl/create-team` — Groups enrolled students into a PBL team under a supervisor.
* `POST /api/pbl/grade` — Allows supervisors/judges to grade milestones.
* `GET /api/pbl/leaderboard/:pbl_id` — Shows student performance charts.

---

## 🚀 Installation & Running Guide

Follow these steps to spin up the development environment on your local machine:

### Prerequisites
* **Node.js** (v18.x or higher recommended)
* **npm** (comes bundled with Node)
* **MySQL Server** (local instance or remote cluster hosted on Aiven/Clever Cloud/Railway)

### Setup Configurations

1. **Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd DevFiesta
   ```

2. **Database Setup (Docker):**
   * A ready-to-run MySQL container is provided via `docker-compose.yml` at the repo root. It automatically creates the `devfiesta` database and all tables from `Backend/db/schema.sql` on first start.
   * Copy the root env file and adjust credentials if you want:
     ```bash
     cp .env.example .env
     ```
   * Start MySQL:
     ```bash
     docker compose up -d
     ```
   * This exposes MySQL on `localhost:3306` (configurable via `DB_PORT` in `.env`). To reset the database from scratch (re-run the schema), stop the container and drop its volume:
     ```bash
     docker compose down -v
     docker compose up -d
     ```

3. **Backend Configuration:**
   * Navigate to the `Backend` directory:
     ```bash
     cd Backend
     ```
   * Install backend packages:
     ```bash
     npm install
     ```
   * Copy the example env file and fill in a JWT secret (the DB credentials already match the Docker MySQL service by default):
     ```bash
     cp .env.example .env
     ```
     ```env
     PORT=4000
     DB_HOST=localhost
     DB_USER=devfiesta
     DB_PASS=devfiesta
     DB_NAME=devfiesta
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRATION=24h
     NODE_ENV=development
     ```
   * Run the Backend Server:
     * In development mode (auto-reloads via Nodemon):
       ```bash
       npm run dev
       ```
     * In production mode:
       ```bash
       npm start
       ```

4. **Frontend Configuration:**
   * Open a new terminal and navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   * Install client packages:
     ```bash
     npm install
     ```
   * Start the Vite Development Server:
     ```bash
     npm run dev
     ```
   * By default, the application will be hosted at `http://localhost:5173`. Open this URL in your web browser to access the DevFiesta client interface.

---

## 🤝 Contribution Guidelines

We welcome contributions to DevFiesta! To contribute:
1. **Fork** the project repository.
2. **Create** a feature branch: `git checkout -b feature/AmazingFeature`.
3. **Commit** your changes: `git commit -m 'Add some AmazingFeature'`.
4. **Push** to the branch: `git push origin feature/AmazingFeature`.
5. **Open** a Pull Request against the main branch.

---

## 📄 License

Distributed under the ISC License. See `package.json` for details.
