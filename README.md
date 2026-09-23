# Smart Exam Coordination and Management System

A full-stack application for planning and coordinating academic examinations. The system provides separate portals for administrators, staff, and students, with role-based access to exam scheduling, room allocation, seating, attendance, notifications, reports, and audit history.

## Project Structure

```text
client/   React 19 frontend built with Vite
server/   Express API backed by Sequelize and MySQL
```

### Client

The frontend uses React, React Router, Redux Toolkit, Axios, and Vite. It includes:

- Admin management for users, departments, courses, subjects, rooms, exams, timetables, allocations, seating, reports, issues, notifications, and audit logs.
- Staff workflows for dashboards, attendance, duties, issues, and notifications.
- Student workflows for dashboards, admit cards, timetables, venue and seat details, and notifications.
- Protected routes and JWT authentication through the shared Axios configuration.

The frontend API contract is documented in [client/API_DOCUMENTATION.md](client/API_DOCUMENTATION.md). It uses `VITE_API_BASE_URL`, which defaults to `http://localhost:5000/api/v1`.

### Server

The backend is organized by feature modules and follows this request flow:

```text
Route -> Joi validation -> Controller -> Service -> Repository -> Sequelize model -> MySQL
```

The server provides JWT authentication, bcrypt password handling, role-based authorization, CSV student bulk upload, PDF/download support, email configuration, request logging, and the following domain areas:

- Authentication and users
- Students and staff
- Departments, courses, and subjects
- Rooms, exams, and timetables
- Room allocations, staff duties, and seating
- Attendance and admit cards
- Notifications, issues, reports, and audit logs

Authentication routes are available under `/api/v1/auth`. Login returns a bearer token used by the frontend for subsequent requests.

## Prerequisites

- Node.js 18 or newer
- MySQL
- A database named `smart_exam` or another database configured in the server environment

## Installation

Install dependencies in both applications:

```bash
cd server
npm install

cd ../client
npm install
```

Create `server/.env` from `server/.env.example` and configure the database, JWT, and optional SMTP values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_exam
DB_USER=root
DB_PASSWORD=your_password
DB_SHOW_SQL=false
DB_DDL_AUTO=none
JWT_ACCESS_SECRET=replace_with_a_secret
JWT_ACCESS_EXPIRES_IN=1d
NODE_ENV=development
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Create `client/.env` with the API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Running the Application

Start the API in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Vite will display the local frontend URL, normally `http://localhost:5173`.

The server's `DB_DDL_AUTO` setting controls Sequelize synchronization:

- `none`: use the default Sequelize synchronization behavior.
- `update`: use `sync({ alter: true })`.
- `create`: recreate tables with `sync({ force: true })`.

Use `create` only for a disposable development database.

## Authentication Example

```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Send the returned token on protected requests:

```http
Authorization: Bearer <access_token>
```

There is currently no registration endpoint. To create a development user, generate a bcrypt hash and insert an `ACTIVE` user with one of the roles `ADMIN`, `STAFF`, or `STUDENT`.

## Student Bulk Upload

Administrators can upload one CSV file using `POST /api/v1/students/bulk-upload` with a bearer token. The file is limited to 5 MB and must contain:

```csv
usn,name,email,phone,department,semester,section,course
1AB23CS001,Student One,student1@example.com,9876543210,CSE,1,A,Computer Science
```

The entire batch is rejected when required values are missing, a USN or email is duplicated, or a student already exists.

## Useful Commands

Frontend:

```bash
npm run dev       # start Vite
npm run build     # create a production build
npm run lint      # run ESLint
npm run preview   # preview the production build
```

Server:

```bash
npm run dev       # start with Nodemon
npm start         # start with Nodemon
```

## Documentation

- [Frontend API contract](client/API_DOCUMENTATION.md)
- [Server architecture and Auth notes](server/README.md)
- [Server change history](server/CHANGES.md)
