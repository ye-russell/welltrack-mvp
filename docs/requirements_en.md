# WellTrack MVP — Technical Specification (English Version)

## 1. Overview
**WellTrack** is an internal web application for managing well operations data — including organizations, projects (fields), wells, stages, and events. The system allows users to record, view, and manage historical activity data, attach files (daily drilling reports, logs, etc.), and visualize progress via a timeline or calendar interface.

The MVP version focuses on **manual data input and structured file storage** — without LLM-based or automated parsing.

---

## 2. System Goals
- Centralize operational data for wells and related activities.
- Provide collaboration between engineers and managers within organizations.
- Allow secure file uploads, event creation, and historical browsing.
- Enable structured and scalable storage on AWS (S3, DynamoDB).
- Establish a base for future AI and parsing integrations.

---

## 3. Actors and Roles
| Role | Description |
|------|--------------|
| **Owner** | Creator of an organization, full permissions. |
| **Admin** | Manages organization settings, projects, and members. |
| **Engineer / Editor** | Creates and edits wells, stages, and events. Uploads files. |
| **Viewer** | Read-only access to data, timeline, and files. |

---

## 4. Core Entities
| Entity | Description |
|--------|--------------|
| **Organization** | Represents a company or group; contains projects and users. |
| **Project (Field)** | Belongs to an organization; groups wells by geographical location. |
| **Well** | The primary operational unit; contains metadata, stages, and files. |
| **Stage** | Represents a phase of work (e.g., drilling, completion). |
| **Event** | Describes an activity within a stage — either a moment or a time range. |
| **File** | Uploaded document related to a well, stage, or event. |

---

## 5. Functional Requirements (MVP)
### Core Features
1. **Authentication** — Email/password login and registration.
2. **Organizations & Access Control** — RBAC with invitations via email.
3. **CRUD Operations:**
   - Organizations, Projects, Wells, Stages, and Events.
4. **File Uploads (AWS S3)** —
   - Files are attached to wells, stages, or events.
   - System automatically creates an event: *“File uploaded.”*
5. **File Management:**
   - View all files per well/stage/date.
6. **Timeline / Calendar View:**
   - Daily, weekly, and monthly display of stages and events (like Google Calendar).
7. **Activity History & Audit Log:**
   - Track who created or modified data.

---

## 6. Non-Functional Requirements
| Category | Requirement |
|-----------|--------------|
| **Scalability** | Support hundreds of organizations and thousands of wells. |
| **Performance** | Querying a well’s daily events should respond in <200ms (with caching). |
| **Security** | RBAC, HTTPS, encrypted S3 buckets, JWT or Cognito authentication. |
| **Availability** | Internal testing phase SLA → 99.5% uptime target. |
| **Monitoring** | CloudWatch (logs, metrics) or similar setup. |

---

## 7. Suggested Architecture & Tech Stack
### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** TailwindCSS, shadcn/ui, React Query
- **Features:** Calendar (react-big-calendar or FullCalendar), forms, file uploads

### Backend
- **Implementation:** Next.js API routes or AWS Lambda handlers
- **Runtime:** Node.js 20+
- **Database:** DynamoDB (NoSQL)
- **File Storage:** AWS S3 (presigned URLs for uploads)
- **Auth:** NextAuth.js or AWS Cognito
- **Infrastructure:** AWS API Gateway + Lambda, Terraform or Serverless Framework

---

## 8. API Endpoints (Draft)
| Endpoint | Method | Description |
|-----------|---------|--------------|
| `/api/orgs` | POST | Create organization |
| `/api/orgs/:id` | GET | Get organization details |
| `/api/orgs/:id/invite` | POST | Invite user by email |
| `/api/projects` | POST | Create project |
| `/api/projects` | GET | List projects (by organization) |
| `/api/wells` | POST | Create well |
| `/api/wells` | GET | List wells (by project) |
| `/api/stages` | POST | Create stage |
| `/api/events` | POST | Create event |
| `/api/events` | GET | List events (by well or date range) |
| `/api/files/upload` | POST | Upload file (returns presigned URL) |
| `/api/files` | GET | List files (by well/stage/date) |

---

## 9. UX / UI Key Screens
1. **Dashboard (Organization level)** — Overview of projects, wells, and recent activity.
2. **Project / Field View** — Map and list of wells.
3. **Well View** — Metadata, list of stages, and timeline.
4. **Stage View** — Stage-specific events and file list.
5. **Event Editor** — Create or edit event (instant or range).
6. **File Manager** — Uploads, filters (by type, date, stage).
7. **Calendar / Timeline** — Google Calendar-like display for events.

---

## 10. MVP Development Backlog
### Epic 1 — Authentication & Organizations
- User registration and login
- Organization CRUD and invitations
- Role-based access control (RBAC)

### Epic 2 — Core Data Entities
- Projects, Wells, Stages, and Events CRUD
- Basic UI for creation and editing

### Epic 3 — File Management
- Presigned upload to S3
- Display list of uploaded files
- Auto-create “File uploaded” event

### Epic 4 — Timeline & Calendar
- Implement day/week/month timeline view
- Event color-coding and stage grouping

### Epic 5 — Audit & Logs
- Store activity metadata (who/when)
- Display simple change log per well

---

## 11. Acceptance Criteria (Examples)
- A user can create an organization and invite another user via email.
- A user can create a well, add a stage, and attach events.
- A file uploaded to S3 appears in the well’s file list within 10 seconds.
- Uploading a file automatically generates an event: *“File uploaded.”*
- The timeline view correctly shows events in chronological order.

---

## 12. Risks and Notes
- Variability in file formats may require flexible metadata handling.
- Sensitive industrial data must be encrypted and access-controlled.
- AWS costs (storage, Lambda execution) should be monitored from the start.

---

## 13. Next Steps
1. Define minimal set of fields for wells, events, and files (to finalize DB schema).
2. Initialize DynamoDB tables and S3 bucket.
3. Implement `/api/orgs` and `/api/files/upload` endpoints first.
4. Create Figma or wireframe prototype for the core pages.
5. Deploy MVP to AWS or Vercel for internal testing.

---

**Author:** Adapted from original Russian specification (Yerassyl & collaborator)  
**Focus:** MVP version — no AI or parsing modules included yet.