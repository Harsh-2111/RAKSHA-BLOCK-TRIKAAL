<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9f781357-7f65-42b3-a32c-8318d809d142

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CP-SAT optimizer

The optimizer uses Google OR-Tools CP-SAT through a local Python service. Install the solver dependency once:

```bash
pip install -r requirements.txt
```

Run both processes in separate terminals:

```bash
npm run cp-sat
npm run dev
```

The Vite development server proxies `/api/cp-sat/solve` to the solver at `http://127.0.0.1:8000`.
