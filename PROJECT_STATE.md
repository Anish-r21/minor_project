# PROJECT_STATE – Campus Maintenance & Complaint Management System

Context: B.Tech 3rd-year minor project for NIT Jalandhar. Improves the ERP complaint flow with approval, slot booking, worker coordination and accountability.

## Status
**Phase 1 (frontend, mock data) – COMPLETE.** `npm run build` passes (tsc + vite). No backend exists yet.

## Stack
React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, lucide-react, react-router-dom 6 (HashRouter). No UI library, no chart library.

## Folder structure
```
src/
  main.tsx, App.tsx          # HashRouter, route table, role gates (Protected, Gate)
  types.ts                   # all domain types + constants (CATEGORIES, STATUS_LABEL, SLA_DAYS, TIME_SLOTS, LOCATIONS)
  store/AppContext.tsx       # single source of truth: DB state + all actions + toasts (localStorage persisted)
  data/mock.ts               # buildMockDB(): users, 18 complaints, appointments, notifications (dates relative to "today")
  utils/format.ts            # date/time formatting, overdue/SLA, generateSlots(), placeholderPhoto()
  components/
    layout/AppLayout.tsx     # header (demo user switcher, bell panel), sidebar per role, toasts
    ui/                      # Badges, Modal(+ConfirmDialog), Timeline, SlotSelector, Common (PageHeader, StatCard, EmptyState, Field, InfoRow, Toasts)
    complaint/               # ComplaintTable (search/filter/paginate), RequesterPanel, AdminPanel, WorkerPanel
  pages/
    Login, Notifications, Profile, ComplaintDetail (shared by all roles, role-specific panel)
    student/  StudentDashboard, SubmitComplaint, MyComplaints
    admin/    AdminDashboard, AdminList (pending|approved|rejected|overdue|all), ScheduledJobs, Workers
    worker/   WorkerDashboard, Jobs (tabs: assigned|today|upcoming|completed)
```
Routes: `/login`, `/`, `/notifications`, `/profile`; requester: `/complaints`, `/complaints/new`, `/complaints/:id`;
admin: `/admin/{pending,approved,rejected,overdue,all,scheduled,workers}`, `/admin/complaints/:id`; worker: `/jobs?tab=`, `/jobs/:id`.

## Domain model (see types.ts)
- Roles: `student | faculty | admin | worker`. Workers are `User`s with `skills`, `availableDays` (0=Sun), `leaveDates`.
- Complaint status: `pending_review → approved → scheduled → in_progress → work_completed → closed`; side branch `rejected`.
- Priority: low/medium/high/urgent. SLA days: 7/5/3/1. **Overdue** = open (pending/approved/scheduled/in_progress) and now > submittedAt + SLA.
- Appointment: `booked | completed | cancelled`. One active booked appointment per complaint.
- Slots are NOT stored: `generateSlots()` derives them for the next 10 days from worker skills, working days, leave dates, minus booked appointments. Slot times: 09,10,11,14,15,16 (1 hour each).
- Timeline events + notifications are appended by store actions on every state change.

## Key decisions / business rules
- Admin may pre-assign a worker at approval; then the user sees only that worker's slots. Otherwise any worker with the matching skill.
- Reschedule/cancel allowed only until the day before the visit; reschedule is applied immediately (simulated approval) with a required reason. Cancel returns the complaint to `approved`.
- Worker flow: Start work (scheduled→in_progress), notes, Mark completed (needs note) → user confirms. "Not resolved" reopens as `approved`, priority `high`, worker cleared, user rebooks.
- Admin can change priority anytime and reassign worker (blocked if worker already has that slot).
- Photos: up to 3 images, 2 MB each, stored as data URLs (may exceed localStorage quota; persistence failure is swallowed).
- Mock auth: password `demo123`. Session = `currentUserId` in DB state.
- Design: ERP-like (dark-blue header, left sidebar, white tables, slate background). No gradients/animations.
- All state mutations go through `useApp()` actions; pages never mutate state directly.

## Known Phase 1 limitations
- No real auth, file storage, or persistence beyond localStorage. No email/SMS. Reschedule needs no admin approval. No pagination on lists beyond client-side 10/page. No automated tests.

## PHASE 2 – what to build next (Backend + integration)
1. Backend: Node.js + Express (or NestJS) + TypeScript; PostgreSQL with Prisma. Tables: users, complaints, complaint_events, appointments, worker_availability (weekly rules + leave), notifications, attachments.
2. Auth: JWT (httpOnly cookie) with roles; hash passwords; role-based middleware; seed the demo users. Optional later: NITJ ERP SSO.
3. REST API mirroring store actions: `POST /complaints`, `GET /complaints` (role-scoped, filters), `GET /complaints/:id`, `POST /complaints/:id/approve|reject`, `PATCH /complaints/:id/priority|worker`, `GET /slots?category=&workerId=`, `POST /complaints/:id/book|reschedule|cancel`, `POST /jobs/:id/start|complete|notes`, `POST /complaints/:id/confirm`, `GET/PATCH /workers/:id/availability`, `GET /notifications`, `POST /notifications/:id/read`, `GET /admin/stats`.
4. Enforce transactionally: slot double-booking (unique worker+date+time for active appointments), status transition rules, role/ownership checks, reschedule-until-day-before rule.
5. File uploads: multipart to disk/S3-compatible storage, size/type validation, serve signed URLs.
6. Frontend integration: replace `AppContext` action bodies with API calls (React Query recommended), keep types in `types.ts` as the shared contract, add loading/error states, remove localStorage persistence and the demo switcher (or gate it behind a dev flag).
7. Notifications: persisted in DB; optional email via Nodemailer; polling or SSE for the bell.
8. Overdue/SLA: compute server-side; optional scheduled job to flag/notify admins.
9. Quality: validation (zod), tests (Vitest + Supertest), Dockerfile + docker-compose (api, db, web), README deployment notes.
