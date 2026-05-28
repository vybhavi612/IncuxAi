# WorkPulse - Enterprise Attendance & Productivity Monitoring Suite

**WorkPulse** is a premium, secure, full-stack application built for team managers to track online employee attendance and monitor developer productivity concurrently. It features real-time shift telemetry, role-based JWT authentication, audit logging, customizable policies, and GitHub integration with intelligent simulated activity fallbacks.

---

## ⚡ Quick-Start (Run via Docker)

WorkPulse is completely dockerized. Provision the entire stack (PostgreSQL, NestJS API gateway, and Next.js app client) with a single command:

```bash
docker-compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Gateway**: [http://localhost:3001](http://localhost:3001)
- **Database Engine**: PostgreSQL running on port `5432`

---

## 🔑 Reviewer Credentials Sandbox

The seed script automatically populates the database with default parameters and realistic mock tracking histories:

| Account Type | Email | Password | Assigned GitHub User |
|:---|:---|:---|:---|
| **Sarah Jenkins (Admin)** | `admin@workpulse.com` | `admin123` | *N/A* |
| **Alex Rivera (Developer)** | `dev1@workpulse.com` | `user123` | `alexrivera-dev` |
| **Elena Rostova (Developer)** | `dev2@workpulse.com` | `user123` | `elena-rostova` |

---

## 🛠 Tech Stack Architecture

```
                                +---------------------------+
                                |    Next.js Client (3000)  |
                                +-------------+-------------+
                                              |
                                     Rest API & Socket.io
                                              |
                                +-------------v-------------+
                                |    NestJS Backend (3001)  |
                                +------+--------------+-----+
                                       |              |
                                 Prisma Client   GitHub REST API
                                       |              |
                                +------v------+       v
                                |  Postgres   |  [GitHub Engine]
                                +-------------+
```

### Frontend (`/frontend`)
- **Core**: Next.js 14 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS v3.4 + Glassmorphism Variables
- **Icons**: Lucide React
- **Realtime**: Socket.IO Client

### Backend (`/backend`)
- **Framework**: NestJS (Structured Modular Architecture)
- **ORM**: Prisma Client v5
- **Realtime**: Socket.IO Gateway
- **Auth**: Passport.js + JWT Strategy + Bcrypt Password Hashing
- **Automation**: NestJS Cron Schedulers (Nightly GitHub Sync & Hourly timeout sweeps)

---

## 💾 Core Entity Schemas

1. **User**: Authentication keys, active toggles, role (`ADMIN`, `USER`), and timezone bindings.
2. **Attendance**: Standard server-side logging for checking in/out. Uses server-time as the source of truth to prevent local machine timestamps tampering.
3. **Session**: Active Socket.IO session tracking, browser fingerprints, and client IPs.
4. **Repository**: Codebase links assigned to developers.
5. **GitHubMetric**: Daily chronologies of commits, pull requests, issues, additions, and deletions.
6. **AuditLog**: Chronological security audit logs capturing all admin overrides, setting configurations, and authentication sweeps.
7. **Setting**: Dynamically configurable admin choices (Target hours, timeout sweep triggers, force close defaults).

---

## 🔒 Security Measures

- **Role-Based Access Control (RBAC)**: Custom NestJS `@Roles` decorators intercept non-admin requests to override portals, settings, and user CRUD logs.
- **Server Timestamps Integrity**: Client machine timestamps are stored purely as metadata. Clock-ins are calculated using the isolated server database time.
- **Credential Protection**: Hashed passwords using 10-salt bcrypt rounds.
- **Inactivity Sweeps**: Schedulers automatically close sessions active past threshold limits (e.g. 12 hours) applying configurable statuses (`INCOMPLETE` or `ABSENT`).
- **Session Telemetry Guard**: Real-time broadcasts allow admins to instantly boot unauthorized sessions, terminating authentication tokens immediately.

---

## ⚖ Ethics, Privacy & Consent Disclosures

> [!CAUTION]
> **EMPLOYEE PRIVACY COMPLIANCE DISCLOSURE**
> 1. **Worker Consent**: In many jurisdictions (such as the EU under GDPR or California under CCPA), tracking employees' exact IP addresses, browser fingerprints, and device agent metadata requires formal consent policies or employment contract riders.
> 2. **GitHub API Scope**: When linking a Personal Access Token (PAT) to gather metrics, ensure the token is scoped strictly to `read:user` and `repo:status` to avoid compromising proprietary company codebase access.
> 3. **Ethics Principle**: WorkPulse is designed for aggregate metrics and shift hour compliance. Inactivity alerts and productivity scores are heuristic indicators and should not be used as the sole basis for performance actions without manual oversight.
