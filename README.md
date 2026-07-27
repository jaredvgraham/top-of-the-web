# top-of-the-web / bsites

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scrape service (required for Facebook / website import)

Playwright cannot run on Vercel serverless. Scraping lives in a dedicated Node service:

```bash
# Terminal A — scrape service
cd services/scrape && npm install && npm run dev

# Or via Docker
docker compose up --build scrape
```

Set these on the Next.js app (`.env.local` / Vercel):

```bash
SCRAPE_SERVICE_URL=http://localhost:8787
SCRAPE_SERVICE_SECRET=dev-scrape-secret
```

Use the same `SCRAPE_SERVICE_SECRET` on the scrape service. In production, point `SCRAPE_SERVICE_URL` at your deployed scrape host (any Docker host).

See [services/scrape/README.md](services/scrape/README.md).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
