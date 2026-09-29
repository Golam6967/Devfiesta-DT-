-- DevFiesta MySQL schema
-- Reverse-engineered from the raw SQL queries in Backend/models/*.js
-- (no schema previously existed in the repo). Loaded automatically by
-- the `mysql` service in docker-compose.yml on first container start.

CREATE DATABASE IF NOT EXISTS devfiesta
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE devfiesta;

-- ============ Core users ============

CREATE TABLE users (
  username      VARCHAR(50)  NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  skills        TEXT,
  interests     TEXT,
  achievement   TEXT,
  bio           TEXT,
  github_link   VARCHAR(255),
  institution   VARCHAR(255),
  phone         VARCHAR(20),
  image         VARCHAR(255),
  PRIMARY KEY (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ============ Hackathon module ============

CREATE TABLE hackathon (
  hackathon_id   INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_name VARCHAR(150) NOT NULL,
  host_username  VARCHAR(50)  NOT NULL,
  duration       VARCHAR(50),
  genre          VARCHAR(100),
  rule_book      TEXT,
  hackathon_image VARCHAR(255),
  starting_date  DATETIME,
  ending_date    DATETIME,
  added_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE judges (
  judge_id       INT AUTO_INCREMENT PRIMARY KEY,
  judge_username VARCHAR(50) NOT NULL,
  hackathon_id   INT NOT NULL,
  UNIQUE KEY uq_judge_hackathon (judge_username, hackathon_id),
  FOREIGN KEY (judge_username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE criterias (
  criteria_id   INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_id  INT NOT NULL,
  criteria_info VARCHAR(255) NOT NULL,
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Shared by both the hackathon flow and the PBL flow (same insert shape
-- in participants.js and pbl.js); association to a hackathon/PBL is via
-- the team_participants / teamXpbl junction tables, not a column here.
CREATE TABLE teams (
  team_id   INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(150) NOT NULL,
  team_info TEXT
) ENGINE=InnoDB;

CREATE TABLE team_participants (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  team_id       INT NOT NULL,
  hackathon_id  INT NOT NULL,
  username      VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_participant_hackathon (username, hackathon_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE marking (
  marking_id     INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_id   INT NOT NULL,
  judge_username VARCHAR(50) NOT NULL,
  team_id        INT NOT NULL,
  criteria_id    INT NOT NULL,
  marks          DECIMAL(5,2) NOT NULL DEFAULT 0,
  comments       TEXT,
  UNIQUE KEY uq_marking (hackathon_id, judge_username, team_id, criteria_id),
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE,
  FOREIGN KEY (judge_username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (criteria_id) REFERENCES criterias(criteria_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ Project showcase ============

CREATE TABLE projects (
  project_id    INT AUTO_INCREMENT PRIMARY KEY,
  project_name  VARCHAR(150) NOT NULL,
  git_repo      VARCHAR(255),
  demo_link     VARCHAR(255),
  overview      TEXT,
  motivation    TEXT,
  features      TEXT,
  project_genre VARCHAR(100),
  project_image VARCHAR(255),
  creation_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE p_u_junction (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  username   VARCHAR(50) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE p_t_junction (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  team_id      INT NOT NULL,
  project_id   INT NOT NULL,
  hackathon_id INT NOT NULL,
  UNIQUE KEY uq_team_project (team_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ PBL (Project-Based Learning) module ============

CREATE TABLE pbl (
  pbl_id             INT AUTO_INCREMENT PRIMARY KEY,
  pbl_name           VARCHAR(150) NOT NULL,
  host_username      VARCHAR(50) NOT NULL,
  pbl_rule_book      TEXT,
  proposal_Date      DATE,
  progress_date      DATE,
  final_presentation DATE,
  student_pass       VARCHAR(100),
  judge_pass         VARCHAR(100),
  supervisor_pass    VARCHAR(100),
  FOREIGN KEY (host_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE judgeXpbl (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id         INT NOT NULL,
  judge_username VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_judge_pbl (pbl_id, judge_username),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (judge_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE studentsXpbl (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id           INT NOT NULL,
  student_id       VARCHAR(50) NOT NULL,
  student_username VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_student_pbl_id (pbl_id, student_id),
  UNIQUE KEY uq_student_pbl_username (pbl_id, student_username),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (student_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE supervisor (
  supervisor_id INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id        INT NOT NULL,
  username      VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_supervisor_pbl (pbl_id, username),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE teamXpbl (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  team_id       INT NOT NULL,
  pbl_id        INT NOT NULL,
  username      VARCHAR(50) NOT NULL,
  supervisor_id INT,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES supervisor(supervisor_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Never populated by any INSERT path found in the code (no admin route
-- exists for it yet) — created here only so the JOINs in pbl.js that
-- reference it don't fail with "table doesn't exist". Seed rows by hand
-- until a real management endpoint is added.
CREATE TABLE pbl_criteria (
  pbl_criteria_id INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id          INT,
  criteria_info   VARCHAR(255),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pbl_markings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id            INT NOT NULL,
  judge_username    VARCHAR(50) NOT NULL,
  student_username  VARCHAR(50) NOT NULL,
  pbl_criteria_id   INT NOT NULL,
  presentation_type INT NOT NULL,
  marks             DECIMAL(5,2) NOT NULL DEFAULT 0,
  comments          TEXT,
  UNIQUE KEY uq_pbl_marking (pbl_id, judge_username, student_username, pbl_criteria_id, presentation_type),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (judge_username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (student_username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (pbl_criteria_id) REFERENCES pbl_criteria(pbl_criteria_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pbl_team_files (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pbl_id            INT NOT NULL,
  team_id           INT NOT NULL,
  presentation_file VARCHAR(255),
  presentation_type INT NOT NULL,
  UNIQUE KEY uq_pbl_team_file (pbl_id, team_id, presentation_type),
  FOREIGN KEY (pbl_id) REFERENCES pbl(pbl_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ Notifications ============

CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  username         VARCHAR(50) NOT NULL,
  hackathon_id     INT,
  message          TEXT NOT NULL,
  is_read          TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathon(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB;
