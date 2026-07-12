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
- Section boundaries must feel deliberate and elegant — no awkward hard cuts, cramped stacks, uneven gaps, or “template strips” slapped together. Transitions between sections should breathe; use consistent vertical rhythm, thoughtful backgrounds/dividers only when they help, and never leave seams that look unfinished or careless
- If a layout choice looks lazy, generic, or half-hearted, redo it. The site must feel like someone cared deeply about every screen

If the design would not impress a picky client, keep refining until it would.

## Photo & asset curation (non-negotiable)
Do NOT dump images onto the page in upload order. Study every photo first, understand what it shows, then place it with intention.

Before using any photo, answer for yourself:
- What is actually in this image? (people, work, product, space, result, process)
- Is it flattering and brand-positive, or awkward / unfinished / unflattering?
- Is it a “before,” an “after,” a process shot, a detail, or a hero-worthy moment?
- Where does it belong (hero, about, gallery, services proof, before/after pair) — or should it be skipped?

Hard rules for images:
- Hero image: pick the single most flattering, sharp, brand-forward photo. Prefer finished results, strong people moments, beautiful spaces, or polished work — never a messy “before,” a random mid-process shot, or a weak/unflattering frame just because it was first in the list
- Before & after: if the gallery includes before/after work, treat them as pairs. Label clearly, keep them together, and never use a “before” as the hero or primary brand image
- About / owner photo: use the dedicated about photo when provided; don’t substitute a random gallery shot of equipment or a before photo
- Logo: use the real logo in header/footer; don’t stretch, squash, or bury it
- Quality filter: skip blurry, poorly lit, duplicate, or off-brand shots rather than forcing every upload onto the page
- Layout: crop/frame thoughtfully (object-cover with care, not random awkward crops). Give images room — no cramped collages or tiny thumbnails that waste strong photography
- Prefer their real photos over stock. Only use tasteful stock if the brief truly lacks usable imagery, and never let stock overpower their real work

A rushed “sprinkle photos everywhere” gallery is a failure. Image placement should feel curated by a designer who looked at every file.

## Stack (keep this consistent with our other client sites)
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Deploy-ready for Vercel

Do not invent a different stack unless the brief explicitly requires it. Add tasteful animations to polish the experience.

## Build goals
- Make a real first-viewport hero composition (brand-forward, not a dashboard) with a carefully chosen hero image
- Use the business description as the source of truth for copy; expand and polish as needed
- Curate provided images (logo, about photo, gallery) after reviewing each URL — do not place them blindly
- Include clear contact CTA with their business phone/email
- Keep the design distinctive and on-brand for this specific business
- Mobile-friendly, fast, and production-ready
- Suggested pages unless notes say otherwise: Home, About, Services (or equivalent), Contact
- Ship something that looks like a premium custom build worth $4,000
- Use animations to polish interactions and section reveals — keep them intentional, not noisy
- Full SEO implementation out of the box (metadata, OG tags, sitemap/robots, semantic structure, local relevance)
- Finish with a visual QA pass focused on section separation, spacing rhythm, and whether every image choice still feels flattering and intentional

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

## Assets (review each URL before placing — curate, don’t dump)
Open and inspect every image. Identify before/after pairs, flattering vs unflattering shots, and which one deserves the hero. Captions below (if any) are hints from the client.

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
