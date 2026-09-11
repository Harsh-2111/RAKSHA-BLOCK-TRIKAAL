RAKSHA-BLOCK 🚦
AI-assisted block planning and corridor maintenance coordination for Indian Railways.

RAKSHA-BLOCK gives Engineering, S&T, and TRD departments a shared workspace to request track/traffic/power maintenance blocks, and gives Section Controllers a single dashboard to review, bundle, approve, and publish coordinated schedules — with a constraint-solver co-pilot doing the heavy lifting of finding safe, non-conflicting combinations.

Live demo: https://raksha-block-trikaal.vercel.app/

Table of Contents:-
# Why RAKSHA-BLOCK
# Key Features
# Tech Stack
# Getting Started
# Environment Variables
# Available Scripts
# Login Credentials (Demo)
# Application Workflow
# Enabling Cross-Device Live Sync
# Cross-Device Testing
# Project Structure
# Security Notes
# Roadmap Ideas

Why RAKSHA-BLOCK
Coordinating engineering blocks across departments today is largely manual — paper requests, phone calls, and spreadsheets — which makes it hard to spot two departments that could safely share a single block window instead of taking the section twice. RAKSHA-BLOCK digitizes that request → review → approve → execute → clear pipeline and adds an optimizer that proposes bundled windows, cutting total traffic block time and giving controllers a clear, auditable trail.

Key Features
For Department Officers (Engineering / S&T / TRD)

Submit structured block requests: section, chainage (start/end KM), line type, work category, machinery deployed, requested date/time window, and priority (Routine / Priority / Critical Emergency).
Live train-impact estimate per request — projected passenger delay, trains rerouted, freight delay, and freight trains held, calculated from the requested duration.
Track request status in real time (Pending / Approved / Modified & Approved / Rejected / Completed).
Complete post-block safety checkout/clearance once work is done.
Shadow-block opportunity detection — surfaces other requests your department could piggyback on.
For the Section Controller (Admin)

Unified dashboard of every pending/active request across all three departments.
Approve, modify, or reject requests with a reasoned audit trail.
AI Co-Pilot — a recommendation panel that suggests night-shift shifts, TSR (temporary speed restriction) attachments, and bundling opportunities for a given request.
AI Optimizer (CP-SAT) — a Google OR-Tools constraint-programming service that automatically finds groups of compatible requests (same section, same date, same line type, non-conflicting machinery, adjacent time windows) and proposes a single bundled block, reporting the time saved versus running them separately.
Interactive Gantt chart of the day's schedule and a live analytics map (Leaflet) of zonal activity across Indian Railways zones.
Publish coordinated, multi-department schedules once approved.
In-app notification center and an audio alert chime for new/urgent requests.
Export requests/schedules to CSV and generate PDF reports.
Platform-wide

Realtime sync across devices via Supabase (with 5-second polling as a fallback).

Responsive layout — usable on desktop and mobile control-room devices alike.

Zone selector covering Indian Railways zones (NR, WR, CR, ER, SR, …) with division-level context.

The frontend is a single-page React app; department and admin dashboards are different views over the same block_requests data.

server/cp_sat_server.py runs a small local HTTP service that solves a bundling/optimization problem with OR-Tools' CP-SAT solver and returns candidate bundles with time-saved metrics.

Supabase provides persistence, and Realtime pushes new requests and controller decisions to every open client; a 5-second polling loop is a recovery path if a Realtime event is missed.

Tech Stack Layer-	
Frontend	-React 19, TypeScript, Vite 6, Tailwind CSS 4
Maps	-Leaflet
Charts / Gantt-	Custom React components
PDF / CSV export-	jsPDF, html2canvas
Auth (demo)	bcryptjs-hashed role credentials
Realtime data	Supabase (PostgreSQL + Realtime)
Optimization engine	Python, Google OR-Tools (CP-SAT)
Deployment	Vercel
Getting Started
Prerequisites
Node.js 18+ and npm
Python 3.10+ and pip
Installation
git clone <this-repo-url>
cd RAKSHA-BLOCK-TRIKAAL-main
npm install
pip install -r requirements.txt
Run the app
The optimizer service and the frontend run as two separate processes:

# Terminal 1 — CP-SAT optimizer service
npm run cp-sat

# Terminal 2 — frontend dev server
npm run dev
Open http://localhost:3000/.

Environment Variables
Copy .env.example to .env and fill in your own values before deploying:


Available Scripts
Script	Description
npm run dev	Start the Vite dev server on port 3000
npm run cp-sat	Start the Python CP-SAT optimizer service
npm run build	Type-check and build the production bundle to dist/
npm run preview	Preview the production build locally
npm run lint	Run tsc --noEmit for type checking
npm run clean	Remove dist/ and server.js
Login Credentials (Demo)
Portal	Username	Password
Engineering	eng	eng@1234
S&T	st	st@1234
TRD	trd	trd@1234
Admin / Section Controller	admin	admin@1234
Application Workflow
Sign in with one of the credentials above.
Department officers create and submit block requests for their department.
The Section Controller reviews requests across all departments on the Admin dashboard.
The controller can approve, modify, reject, or run the AI Co-Pilot / CP-SAT optimizer to bundle compatible requests, then publish the coordinated schedule.
Department officers complete safety clearance once an approved block is finished.
Supabase Realtime pushes new requests, decisions, schedules, notifications, and safety updates to every open device; 5-second polling is the fallback if Realtime is briefly unavailable.
Enabling Cross-Device Live Sync
Run supabase/realtime_setup.sql once in the Supabase Dashboard SQL Editor. It:

Adds block_requests to the supabase_realtime publication.
Adds the read/write RLS policies required by the current anon-key demo login.
Reload both devices after running it — new requests and controller decisions will then arrive via Realtime, with 5-second polling as a recovery path.

Production note: the public RLS policies in that script are scoped for the demo's anon-key login. Before a real deployment, replace them with policies tied to Supabase Auth users and department claims, and migrate the current demo role credentials to Supabase Auth so per-department data isolation is actually enforced at the database level.

Cross-Device Testing
Open the app on both a laptop and a mobile device.
Log in as a department officer on one device and as Admin on the other.
Submit a request on the department device.
Approve or reject it from the Admin device and confirm the status updates on the department device without a page refresh.
Project Structure
RAKSHA-BLOCK-TRIKAAL-main/
├── public/                      # Static assets (logo, etc.)
├── server/
│   └── cp_sat_server.py         # OR-Tools CP-SAT bundling/optimizer service
├── src/
│   ├── components/              # Dashboards, modals, Gantt chart, map, forms
│   ├── data/                    # Zone/division mock data, role definitions
│   ├── lib/
│   │   └── supabase.ts          # Supabase client + realtime + CRUD helpers
│   ├── utils/                   # Audio alerts, CP-SAT client, CSV/PDF export
│   ├── types.ts                 # Shared TypeScript domain types
│   └── App.tsx                  # Top-level app/router logic
├── supabase/
│   └── realtime_setup.sql       # Realtime + RLS setup script
├── requirements.txt             # Python deps for the CP-SAT service
├── vercel.json                  # Vercel build config
└── vite.config.ts
Security Notes
This is currently a demo-grade deployment, not production-hardened:

Demo login credentials are static and shared per role rather than per individual user.
src/lib/supabase.ts ships with a hardcoded fallback Supabase URL/anon key so the app "just works" without a .env file — replace this with your own project's credentials via environment variables before deploying anywhere real, and remove the hardcoded fallback.
RLS policies in supabase/realtime_setup.sql are intentionally permissive for demo purposes; tighten them (Supabase Auth + department claims) before handling real operational data.
Roadmap Ideas
Migrate demo role logins to Supabase Auth with per-department RLS.
Persist AI Co-Pilot / CP-SAT decisions with full audit history in the database.
Add role-based notification preferences.
Expand the optimizer to consider multi-day recurring maintenance windows.
RAKSHA-BLOCK — coordinated corridor maintenance, without the phone tag.
