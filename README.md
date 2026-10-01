# Number System (Vercel)
1. Push this folder to GitHub, import into Vercel (no build step).
2. Vercel dashboard > Storage/Marketplace > add **Upstash Redis** and connect it to the project (sets KV_REST_API_URL / KV_REST_API_TOKEN).
3. Settings > Environment Variables: add ADMIN_KEY (your delete password). Redeploy.
Without step 2 the site runs in demo mode (data saved only in each browser).
