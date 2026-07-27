# @bsites/scrape-service
#
# Dedicated Playwright scrape host. The Next.js app on Vercel calls this
# over HTTP — Chromium never runs in serverless.
#
# Setup:
#   cp .env.example .env
#   # set SCRAPE_SERVICE_SECRET to match Next.js SCRAPE_SERVICE_SECRET
#
# Local:
#   cd services/scrape && npm install && npm run dev
# Or:
#   docker compose up --build scrape
#
# Env (services/scrape/.env — gitignored):
#   PORT=8787
#   SCRAPE_SERVICE_SECRET=<shared secret matching Next.js>
#
# Endpoints:
#   GET  /health
#   POST /scrape/facebook  { "url": "https://www.facebook.com/..." }
#   POST /scrape/website   { "url": "https://example.com" }
#
# Auth: Authorization: Bearer <SCRAPE_SERVICE_SECRET>
