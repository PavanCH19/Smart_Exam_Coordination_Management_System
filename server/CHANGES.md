# Backend changes — summary

Everything below was verified with `node --check` (syntax) and a custom
require-path resolver across all 141 backend source files — both pass clean.
Neither `npm install` nor a live DB connection was available in this
environment, so this hasn't been runtime-tested against a real MySQL
instance. **Run `npm install` (to pull in the new dependencies) and smoke-test
against your dev DB before deploying.**

## Bugs fixed in your existing modules

- **`auth`**: `POST /auth/change-password` expected `oldPassword`/`newPassword`
  in the request body; the frontend sends `current_password`/`new_password`.
  Fixed the validation schema and service to match. Also added `student_id`
  and `employee_id` columns to the `users` table and included them in the
  login response — the student portal calls student-scoped endpoints
  directly off `user.student_id`, which wasn't available before.
- **`dept_mng`**: Joi validation schemas existed but were never wired into
  the routes (`validate(...)` was missing from every `POST`/`PUT`), so no
  validation was actually running. Also, `GET /departments` returned no
  `pagination` object at all. Both fixed.
- **`staff_mng`**: same two bugs — unwired validation, missing pagination.
  Both fixed.
- **`course_mng`**: bigger mismatch. The model used `department_id` (FK) and
  `duration_semesters`, but the frontend's `CourseForm` sends `department`
  (a plain string, matching the Student/Staff convention) plus
  `duration_years` *and* `total_semesters` separately. Rewrote the model,
  validation, service, and repository to match the real contract, and wired
  validation into the routes.

## New modules built

Following your existing `routes → validation → controller → service →
repository → model` pattern in every case:

| Module | Covers |
|---|---|
| `subject_mng` | Subjects CRUD |
| `room_mng` | Rooms CRUD + `PATCH /rooms/:id/status` |
| `exam_mng` | Exam CRUD, `/timetable` view, `/timetable/generate` (basic date-conflict-avoiding scheduler) |
| `allocation_mng` | Room allocations per exam, with a capacity check and a room-double-booking guard across exams |
| `duty_mng` | Staff duty assignment per exam, "my duties" for the logged-in staff member, duty attendance confirmation, with an availability check and a staff-double-booking guard |
| `seating_mng` | Seat generation (section-interleaved "mixed" mode) and manual save, excluding students already seated in a sibling room for the same exam |
| `admitcard_mng` | Admit card status/generation, **real PDF generation with a QR code** (`pdfkit` + `qrcode` — both added to `package.json`) |
| `attendance_mng` | Exam-day attendance roster and marking, with staff writes scoped to their own assigned room |
| `notification_mng` | Admin send/retract, per-user inbox with read tracking, **plus real email delivery** (see below) |
| `issue_mng` | Staff issue reporting, admin monitoring/status updates (note: status uses the literal string `"IN PROGRESS"` with a space, matching the frontend exactly) |
| `audit_mng` | Read endpoint + a reusable `writeLog()` helper, wired into timetable generation, admit card generation, room/staff-duty removal, and user account changes |
| `report_mng` | All 6 report types (exams, staff-duty, hall-utilization, attendance, issues, admit-cards) with JSON summaries and PDF/CSV export built from real data |
| `user_mng` | Admin CRUD over login accounts, reusing the `User` model from `auth`, with automatic Student/Staff profile-linking by email |
| `dashboard_mng` | All 3 dashboard aggregate endpoints |

Also added the two missing functions the students controller already called
but that didn't exist yet (`getStudentExams`, `getStudentAttendance` in
`students.service.js`) — this was a guaranteed runtime crash before.

## New feature: email

Two things you asked for, both implemented with `nodemailer`:

1. **Auto-provisioned login accounts.** When an admin creates a student or
   staff member (single create **or** CSV bulk upload), a matching `users`
   row is created automatically — role set from context, linked via
   `student_id`/`employee_id`, with a randomly generated password — and an
   email is sent to that person with their login email + temporary password.
   Bulk upload returns `accountsCreated`/`emailsSent` counts alongside the
   usual student list.
2. **Notification emails.** When an admin sends a notification
   (`POST /notifications`), it's saved in-app as before, and the same
   message is also emailed to every student/staff/everyone in the target
   audience (pulled from the `students`/`staff` tables directly).

Both are built on a shared `src/shared/utils/mailer.js` that **never throws**
— if `SMTP_HOST`/`SMTP_USER` aren't set in `.env`, it logs a one-time warning
and skips sending, so the app keeps working in dev without email configured.
Fill in the new `SMTP_*` variables in `.env` (see `.env.example`) to enable
real delivery — Gmail with an App Password is the fastest way to test.

**Architecture note:** the auto-provisioning helper
(`shared/utils/userAccount.util.js`) deliberately depends only on the `auth`
module's `User` model, not on `user_mng`. `user_mng` already depends on
`std_mng`/`staff_mng` to resolve profile links when an admin creates a login
account directly — having `std_mng`/`staff_mng` depend back on `user_mng`
would create a circular require.

## `server.js`

- Wired all 15 new module route trees in.
- Added `PATCH` to the CORS `methods` list — it was missing, and several new
  endpoints need it (room status, duty attendance, attendance marking,
  notification read, issue status).
- **Mount order matters in one place**: `/api/v1/staff/duties` is registered
  *before* `/api/v1/staff`. Express matches `app.use` prefixes in
  registration order, and `staff.routes.js` has a `GET /:id` route — if the
  general `/staff` router were registered first, a request to
  `GET /api/v1/staff/duties` would incorrectly match `/:id` with
  `id="duties"` before ever reaching the duty roster. Every other nested
  mount (exams' sub-resources, room-allocations' seating, etc.) was checked
  and doesn't have this issue, since none of them collide with a
  single-segment `/:id` pattern the way `/staff/duties` did.

## One real association bug caught during review

`seat.model.js` was missing `Seat.belongsTo(RoomAllocation, ...)`, even
though `attendance.service.js`, `admitcard.service.js`, and
`dashboard.service.js` all query `Seat` with
`include: [{ model: RoomAllocation, ... }]`. Without the association,
Sequelize would throw "RoomAllocation is not associated with Seat!" at
request time on any of those three endpoints. Fixed.

## What I could not verify

- No live MySQL connection or `npm install` in this environment — syntax and
  require-path resolution are confirmed clean, but nothing has been
  execution-tested. Please run it against your dev DB before relying on it.
- `pdfkit` and `qrcode` are new dependencies (added to `package.json`) —
  needed for real admit card PDFs with embedded QR codes.
- `nodemailer` is a new dependency — needed for the email features above.
