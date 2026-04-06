# FinLedger — Finance Dashboard Backend

A backend API for a finance dashboard system with role-based access control, built with Node.js, Express, and SQLite.

## Live Demo
Open `http://localhost:3000` after running the server.

## Tech Stack
- Runtime: Node.js
- Framework: Express.js
- Database: SQLite via sql.js
- Auth: JWT (JSON Web Tokens)
- Password Hashing: bcryptjs
- Validation: express-validator

## Roles
| Role | Permissions |
|---|---|
| Viewer | View records and dashboard only |
| Analyst | View + create and edit records |
| Admin | Full access including user management |

## Setup

### 1. Clone the repository
git clone https://github.com/jaiswaldivya417/finance-backend.git
cd finance-backend

### 2. Install dependencies
npm install

### 3. Create .env file
PORT=3000
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

### 4. Start the server
npm run dev

### 5. Open the frontend
http://localhost:3000

## Default Admin
Email: admin@finance.com  
Password: admin123

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |

### Records
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | /api/records | List all records | Any |
| GET | /api/records?type=income | Filter by type | Any |
| GET | /api/records?category=salary | Filter by category | Any |
| GET | /api/records?startDate=2026-01-01 | Filter by date | Any |
| POST | /api/records | Create record | Admin, Analyst |
| PATCH | /api/records/:id | Update record | Admin, Analyst |
| DELETE | /api/records/:id | Delete record (soft) | Admin |

### Users
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | /api/users | List all users | Admin |
| GET | /api/users/:id | Get user by id | Admin |
| PATCH | /api/users/:id | Update role/status | Admin |
| DELETE | /api/users/:id | Delete user | Admin |

### Dashboard
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/dashboard/summary | Total income, expenses, balance | Any |
| GET | /api/dashboard/categories | Category wise totals | Any |
| GET | /api/dashboard/trends | Monthly trends | Any |
| GET | /api/dashboard/recent | Recent transactions | Any |

## Project Structure
finance-backend/
├── src/
│   ├── config/
│   │   └── database.js       # SQLite setup and helpers
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── roleGuard.js      # Role-based access control
│   ├── routes/               # Express route definitions
│   ├── controllers/          # Request/response handlers
│   ├── services/             # Business logic layer
│   └── validators/           # Input validation rules
├── public/
│   └── index.html            # Frontend dashboard
├── server.js                 # Entry point
├── .env                      # Environment variables (not committed)
└── package.json

## Assumptions
- sql.js used instead of better-sqlite3 for Windows compatibility
- Soft delete used for records (is_deleted flag)
- Self-registered users get viewer role by default
- Admins can upgrade roles via the Users management page
