# RAKSHA-BLOCK

RAKSHA-BLOCK is an Indian Railways automatic block planning and corridor maintenance management system. It allows Engineering, S&T, and TRD departments to submit block requests and enables Section Controllers to review, approve, modify, reject, and publish coordinated maintenance schedules.

## How It Works

- Department officers submit maintenance block requests.
- Requests are synchronized with Supabase PostgreSQL.
- Section Controllers review requests across departments.
- Google OR-Tools CP-SAT creates coordinated maintenance bundles.
- Approved schedules, safety clearances, notifications, and audit records synchronize automatically.
- The interface supports desktop and mobile screens.

## Run Locally

```bash
npm install
pip install -r requirements.txt
```

Start the CP-SAT service and frontend in separate terminals:

```bash
npm run cp-sat
npm run dev
```

Local app: http://localhost:3000/

## Live App

https://raksha-block-trikaal.vercel.app/
