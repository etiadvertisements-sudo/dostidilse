# Dosti Dil Se — PRD

## Original Problem Statement
Clone https://github.com/etiadvertisements-sudo/dostidilse into /app and make it running.

## Architecture
- Backend: FastAPI (Python) at `/app/backend/server.py`, port 8001 (supervisor-managed)
- Frontend: React 19 + CRACO + Tailwind at `/app/frontend`, port 3000
- DB: MongoDB (local)
- Integrations present in code (currently disabled — keys empty in .env):
  - Razorpay (donations)
  - Resend (thank-you emails)
  - PyOTP (admin 2FA)
  - JWT auth for admin
- Routes: Home, About, Projects, Contact, Admin Login, Admin Dashboard

## Setup Done (Jan 2026)
- Cloned repo into `/app` (preserved `.git`, `.emergent`)
- Created `/app/backend/.env` with MONGO_URL, DB_NAME, JWT_SECRET, ADMIN credentials, RESEND_API_KEY
- Created `/app/frontend/.env` with REACT_APP_BACKEND_URL pointing to preview URL
- Installed Python deps via pip + JS deps via yarn; supervisor RUNNING

## Feature added — Coordinator Applications (Jan 2026)
- Public page at `/join` with hero + multi-section application form (about you, location, story)
- Fields: name, email, phone, city, state, role preference (city/state), occupation, age, profile link, photo, why_join, impact_goal, monthly_hours, past experience, referral source
- Backend: `POST /api/coordinators/apply` (public, with dup-pending guard), admin: list / approve / reject / delete
- Emails (via Resend, fire-and-forget):
  - On submit → acknowledgement email to applicant
  - On admin approval → "Welcome to the family" email
- Admin Dashboard: new "Coordinators" tab with filter (Pending/Approved/Rejected/All), expand-to-view details, Approve / Reject / Delete actions
- "Join Us" link added to main nav (desktop + mobile)

## Default Credentials
- Admin email: `admin@dostidilse.org`
- Admin password: `Dosti@2026`
- (TOTP will be generated on first login — scan QR once with authenticator app)

## Backlog / Next Actions
- P1: Add real Razorpay test keys to backend/.env to enable real donation flow (currently the order endpoint will create a mock order id only when keys absent)
- P1: Add real Resend API key to enable thank-you email delivery
- P2: Add team members via Admin Dashboard so Core Team section becomes visible
- P2: Seed projects so the Projects page has content
