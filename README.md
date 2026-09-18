# Smart Exam Coordination System — Auth Module

A standalone, feature-based Auth module built with Express.js, Sequelize (MySQL), Joi, bcrypt, and JWT.

## 1. Architecture

```
Route -> Validation (Joi) -> Controller -> Service -> Repository -> Model -> MySQL
```

- **Routes** (`auth.routes.js`): wire URLs to validation + controller.
- **Validation** (`auth.validation.js`): Joi schemas, isolated from business logic.
- **Controller** (`auth.controller.js`): HTTP only — reads `req`, calls the service, writes `res`. No DB queries, no password logic, no JWT logic.
- **Service** (`auth.service.js`): all business logic — password hashing/comparison, JWT generation, token expiry rules, generic forgot-password behavior.
- **Repository** (`auth.repository.js`): only database operations via Sequelize. No `req`/`res`, no HTTP status codes, no business decisions.
- **Model** (`auth.model.js` + `models/*.js`): Sequelize table definitions only, no business logic.

Everything Auth-related lives inside `src/modules/auth/`. Nothing global like `controllers/` or `services/` exists at the project root.

### Why a model file?
The Auth module stores users in the `users` table. Its Sequelize definition lives under `modules/auth/models/`, and `auth.model.js` is the module's model entry point.

### Why a `shared/` folder?
`authenticate.js`, `authorize.js`, and `validate.js` are generic middleware that will be reused by other modules later (students, staff, exams, etc.), so they live outside the Auth module in `src/shared/middleware/`. This is not a global `controllers/services/repositories` structure — it's just cross-cutting middleware, which is standard practice even in a strict feature-based layout.

`src/shared/utils/jwt.util.js` centralizes token signing/verification so both the service and the `authenticate` middleware use identical logic. `ApiError.js` is a tiny custom error class so the service layer can throw `new ApiError(401, "...")` and the central error handler knows the right status code — this keeps HTTP status codes out of the service and repository, per the rules.

## 2. Folder Structure

```
src/
├── server.js
├── config/
│   └── database.js
├── shared/
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── jwt.util.js
│       └── ApiError.js
└── modules/
    └── auth/
        ├── auth.controller.js
        ├── auth.service.js
        ├── auth.repository.js
        ├── auth.model.js
        ├── auth.routes.js
        ├── auth.validation.js
        ├── index.js
        └── models/
          └── user.model.js
```

## 3. Database Design

**users**
| column | type |
|---|---|
| id | INT, PK, auto-increment |
| name | VARCHAR |
| email | VARCHAR, unique |
| password | VARCHAR (bcrypt hash) |
| role | ENUM('ADMIN','STAFF','STUDENT') |
| status | ENUM('ACTIVE','INACTIVE') |
| created_at / updated_at | DATETIME |

## 4. Setup

```bash
npm install
cp .env.example .env   # then fill in real DB credentials and JWT secrets
npm run dev             # or: npm start
```

Sequelize's `sync()` in `server.js` will create the three tables automatically against the MySQL database named in `.env` (create the database itself first: `CREATE DATABASE smart_exam;`).

## 5. Endpoints

All routes are prefixed with `/api/v1/auth`.

| Method | Path | Auth required |
|---|---|---|
| POST | /login | No |
| POST | /change-password | Yes (Bearer access token) |

## 6. Postman Examples

### Login
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

### Change Password
```
POST http://localhost:5000/api/v1/auth/change-password
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "oldPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

## 7. Seeding a Test User

Since only the Auth module exists so far, there's no "register" endpoint yet (not requested). To test login, insert a user manually with a bcrypt hash, e.g. via a quick Node script:

```js
const bcrypt = require("bcrypt");
bcrypt.hash("Admin@123", 10).then(console.log);
```

Then insert into MySQL:

```sql
INSERT INTO users (name, email, password, role, status, created_at, updated_at)
VALUES ('Admin', 'admin@example.com', '<hash_from_above>', 'ADMIN', 'ACTIVE', NOW(), NOW());
```

## 8. What's Intentionally Not Here

No Redis, Docker, message queues, microservices, or global `controllers/services/repositories` folders — per the project constraints. No other modules (students, exams, etc.) — only the Auth module, as requested.

## 9. Bulk Upload Students

Send a `multipart/form-data` request to `POST /api/v1/students/bulk-upload` with an admin bearer token. Attach exactly one CSV file; `file` is the recommended field name.

The CSV must contain these headers:

```csv
usn,name,email,phone,department,semester,section,course
1AB23CS001,Student One,student1@example.com,9876543210,CSE,1,A,Computer Science
```

Uploads are limited to 5 MB. The entire batch is rejected if a required value is missing, a USN/email is duplicated, or a student already exists.
