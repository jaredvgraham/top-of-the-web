#!/usr/bin/env node
/**
 * Optional CLI helper for Facebook import.
 * Requires the scrape service running (see services/scrape/README.md).
 * Prefer Admin → Onboarding → Import Facebook page (email + URL → Submit).
 *
 *   node scripts/facebook-scrape.local.mjs "https://www.facebook.com/PageName"
 */

import fs from "node:fs";
import path from "node:path";

const pageUrl = process.argv[2];
if (!pageUrl) {
  console.error(
    'Usage: node scripts/facebook-scrape.local.mjs "https://www.facebook.com/PageName"'
  );
  process.exit(1);
}

const api =
  process.env.BSITES_ADMIN_API ||
  "http://localhost:3000/api/admin/onboarding/facebook";
const email = process.argv[3] || "import@local.test";

console.log(
  "Requires scrape service: cd services/scrape && npm run dev (or docker compose up scrape)."
);
console.log(
  "Tip: use Admin → Onboarding → paste email + Facebook URL → Import Facebook page."
);
console.log(`If your local server is up, you can also POST to:\n  ${api}`);
console.log(`With body: { "email": "${email}", "pageUrl": "${pageUrl}" }`);

const outDir = path.join(process.cwd(), "tmp");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "facebook-scrape-request.json"),
  JSON.stringify({ email, pageUrl }, null, 2)
);
console.log("\nWrote tmp/facebook-scrape-request.json (request payload only).");
console.log("Use the admin Import button to run the scrape.");
