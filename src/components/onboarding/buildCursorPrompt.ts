import type { OnboardingSession } from "@/components/onboarding/types";

function line(label: string, value?: string | null) {
  const trimmed = (value || "").trim();
  return `${label}: ${trimmed || "Not provided"}`;
}

function ownersOf(session: OnboardingSession) {
  const fromList = (session.contact.ownerNames || [])
    .map((n) => n.trim())
    .filter(Boolean);
  if (fromList.length) return fromList.join(", ");
  return session.contact.name.trim() || "Not provided";
}

function assetsByKind(
  session: OnboardingSession,
  kind: "logo" | "about" | "photo" | "other"
) {
  return session.assets.filter((asset) => asset.kind === kind);
}

function formatAssetList(
  session: OnboardingSession,
  kind: "logo" | "about" | "photo" | "other",
  emptyLabel: string
) {
  const assets = assetsByKind(session, kind);
  if (!assets.length) return emptyLabel;
  return assets
    .map(
      (asset, index) =>
        `${index + 1}. ${asset.filename || "image"} — ${asset.url}${
          asset.caption?.trim() ? ` (${asset.caption.trim()})` : ""
        }`
    )
    .join("\n");
}

export function buildCursorBuildPrompt(session: OnboardingSession) {
  const businessName =
    session.contact.businessName.trim() ||
    ownersOf(session) ||
    session.contact.email ||
    "this business";
  const location = [session.business.city, session.business.state]
    .filter(Boolean)
    .join(", ");

  return `You are starting in an empty folder that will become ${businessName}'s website. Scaffold and build the full site here from scratch.

This is a paid ~$4,000 custom website build. Treat it that way: professional, polished, and ready to wow the client on first open — not a template, not a draft, not “good enough.” Every page should feel intentional, high-end, and finished enough to show the client with confidence.

The client is working with a real agency (Bsites) — full service, not a DIY builder or freelancing experiment. They are paying for a complete build including full SEO implementation. Ship accordingly: proper metadata, titles/descriptions, Open Graph, semantic headings, clean URLs, sitemap, robots.txt, performance-minded images/structure, local SEO signals where relevant (city/state/business name), and crawl-friendly markup. This should feel like the real deal from a serious agency.

## Quality bar (non-negotiable)
Take as long as you need. Do not rush. Do not stop at a scaffold, MVP, or “close enough.” Keep going until the site is polished and ready to send to the client as a finished deliverable.

Hard rules against laziness:
- No placeholder copy (“Lorem ipsum”, “TODO”, “Coming soon”, fake phone numbers)
- No unfinished pages, empty sections, broken links, or “we’ll fill this in later”
- No generic AI-template look — this must feel custom to THIS business
- No skipping mobile polish, SEO, forms, or animations because they take more work
- Do a full pass at the end: every page, every CTA, every image, every form, desktop + mobile
- If something is hard or time-consuming, still finish it — speed is not the goal; client-ready quality is

When you are done, the site should be something we can deploy and send to the client the same day without embarrassment.

## Design bar (non-negotiable)
Design quality is as important as functionality. Design this like senior brand/digital design experts would — not like a default Tailwind demo or a generic AI layout.

Required design standard:
- Strong visual identity unique to this business (type, color, atmosphere, imagery treatment)
- Expressive typography with clear hierarchy — avoid default system/Inter/Roboto-looking stacks
- Real composition and atmosphere (not flat one-color pages or card grids everywhere)
- Hero that feels premium and intentional on first viewport
- Spacing, rhythm, and polish that feel art-directed
- Restraint where it helps, richness where it matters — never cluttered, never bland
- Every section should look considered, not auto-generated

If the design would not impress a picky client, keep refining until it would.

## Stack (keep this consistent with our other client sites)
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Deploy-ready for Vercel

Do not invent a different stack unless the brief explicitly requires it. Add tasteful animations to polish the experience.

## Build goals
- Make a real first-viewport hero composition (brand-forward, not a dashboard)
- Use the business description as the source of truth for copy; expand and polish as needed
- Use provided images where available (logo, about photo, gallery) — download/reference the URLs below
- Include clear contact CTA with their business phone/email
- Keep the design distinctive and on-brand for this specific business
- Mobile-friendly, fast, and production-ready
- Suggested pages unless notes say otherwise: Home, About, Services (or equivalent), Contact
- Ship something that looks like a premium custom build worth $4,000
- Use animations to polish interactions and section reveals — keep them intentional, not noisy
- Full SEO implementation out of the box (metadata, OG tags, sitemap/robots, semantic structure, local relevance)

## Contact / quote forms (required)
Wire form submissions with Nodemailer (same pattern we use on Bsites: Next.js API route + SMTP via env vars like EMAIL / EMAIL_PASS).

Notification email requirements:
- Send a polished HTML email to the business (${session.contact.email || session.email || "their business email"}) when someone submits a contact/quote form
- Style the HTML clearly and professionally (not plain text dumped into one paragraph)
- Include the submitter’s name, email, phone, and message in the email body
- Make it OBVIOUS the business owner should NOT reply to the notification email itself to handle the lead — instead they should reach out directly using the submitter’s phone/email shown in the message (big notice / banner in the HTML, e.g. “Do not reply to this email — contact the customer directly using the info below”)
- Still set Reply-To to the form submitter’s email so if they ignore that and hit reply anyway, it goes to the customer who submitted the form
- From address can be the site/system mailbox; subject should make it clear it’s a new quote/contact request

If something is missing, make reasonable assumptions from the brief and note them briefly.

---

# Client brief

## Contact
${line("Owners", ownersOf(session))}
${line("Business name", session.contact.businessName)}
${line("Business email", session.contact.email || session.email)}
${line("Business phone", session.contact.phone)}

## Business
${line("What they do", session.business.description)}
${line("City", session.business.city)}
${line("State", session.business.state)}
${line("Location", location)}
${line("Existing website", session.business.existingSiteUrl)}

## Extras
${line("Preferred domain", session.extras.preferredDomain)}
${line("Notes / must-haves", session.extras.notes)}

## Assets (use these URLs)
### Logo
${formatAssetList(session, "logo", "None uploaded")}

### About / owner photo
${formatAssetList(session, "about", "None uploaded")}

### Other photos
${formatAssetList(session, "photo", "None uploaded")}

---

Prefer their real photos over stock. Pull primary messaging from the business description.
Status: ${session.status}
Brief updated: ${
    session.updatedAt ? new Date(session.updatedAt).toLocaleString() : "unknown"
  }
`;
}

export function cursorPromptFilename(session: OnboardingSession) {
  const base =
    session.contact.businessName.trim() ||
    session.contact.email.trim() ||
    session.email.trim() ||
    "client";
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${safe || "client"}-build-prompt.md`;
}
