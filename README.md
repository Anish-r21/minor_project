# Campus Maintenance & Complaint Management System (Phase 1 – Frontend)

React + TypeScript + Vite + Tailwind CSS + Lucide icons. All data is mocked in the browser (no backend yet).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```
Requires Node.js 18+.

## Demo accounts
Open the login page and click a demo card (Student, Faculty, Admin, Worker), or sign in with any demo email/user ID and password `demo123`
(e.g. `aarav.sharma@nitj.ac.in`, `neha.malhotra@nitj.ac.in`, `rajesh.khanna@nitj.ac.in`, `ramesh.kumar@nitj.ac.in`).
While logged in, use **Demo user** in the header to switch users instantly. **Reset demo data** (sidebar) restores the seed data.

## Try the full workflow
1. Student: Submit Complaint.
2. Admin: Pending Review → open the complaint → set priority / pre-assign worker → Approve (or Reject with reason).
3. Student: open the complaint → pick a slot → Book. (Reschedule / cancel are available until the day before the visit.)
4. Worker: Jobs → open job → Start work → add notes → Mark completed.
5. Student: Confirm resolved (closes) or Not resolved (reopens, rebook).

State is saved to `localStorage` (key `campus-maintenance-phase1-v1`).
See `PROJECT_STATE.md` for architecture and the Phase 2 plan.
