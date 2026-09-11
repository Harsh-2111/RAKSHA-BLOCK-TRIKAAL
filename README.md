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

## Enable Cross-Device Live Sync

Run [`supabase/realtime_setup.sql`](supabase/realtime_setup.sql) once in the Supabase Dashboard SQL Editor. It enables `block_requests` in the `supabase_realtime` publication and adds the read/write RLS policies required by the current anon-key demo login. Reload both devices after running it; new requests and controller decisions will then arrive through Realtime, with five-second polling as a recovery path.

For a production deployment, replace the public policies in that script with policies tied to Supabase Auth users and department claims. The current project uses demo role credentials in the browser, so strict per-department database isolation cannot be enforced securely until those users are migrated to Supabase Auth.

## Login Credentials

| Portal | Username | Password |
|---|---|---|
| Engineering | `eng` | `eng@1234` |
| S&T | `st` | `st@1234` |
| TRD | `trd` | `trd@1234` |
| Admin / Section Controller | `admin` | `admin@1234` |

## Application Workflow

1. Open the application and sign in using one of the credentials above.
2. Department officers create and submit block requests for their department.
3. The Admin / Section Controller reviews requests from all departments.
4. The controller can approve, modify, reject, or publish coordinated block schedules.
5. Department officers can complete safety clearance after an approved block.
6. Supabase Realtime synchronizes new requests, decisions, schedules, notifications, and safety updates across open devices. Five-second polling provides a recovery path if Realtime is temporarily unavailable.

## Cross-Device Testing

Open the application on both a laptop and a mobile device. Log in as a department officer on one device and as Admin on the other. Submit a request on the department device, then approve or reject it from Admin and confirm that the status updates on the department device without a page refresh.

## Live App

https://raksha-block-trikaal.vercel.app/

Vercel project: https://vercel.com/harsh-2111s-projects/raksha_block_trikaal
