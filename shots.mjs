import { chromium } from "playwright";

const base = "http://localhost:3100";
const out = "/tmp/bsites-shots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const shots = [
  ["/", "home-full", true],
  ["/pricing", "pricing-full", true],
  ["/contact", "contact-full", true],
];

for (const [path, name, fullPage] of shots) {
  await page.goto(base + path, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2500);
  // let entrance animations settle
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
}

// mobile hero
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base + "/", { waitUntil: "load", timeout: 90000 });
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: `${out}/home-mobile.png` });

await browser.close();
console.log("done");
