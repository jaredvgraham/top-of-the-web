import { siteOrigin } from "@/lib/mail";

export type GhostTemplateId =
  | "demo_waiting"
  | "claim_today"
  | "demo_expiring"
  | "come_back"
  | "expired_revive";

export type GhostEmailVars = {
  name?: string;
  businessName?: string;
  city?: string;
  state?: string;
  previewUrl?: string;
  claimUrl?: string;
  email?: string;
};

export type GhostTemplateMeta = {
  id: GhostTemplateId;
  label: string;
  description: string;
  /** Best for ready (non-expired) demos */
  audience: "ready" | "expired" | "any";
  defaultSubject: string;
};

export const GHOST_TEMPLATES: GhostTemplateMeta[] = [
  {
    id: "demo_waiting",
    label: "Demo still waiting",
    description: "Friendly nudge — your private demo is ready to open.",
    audience: "ready",
    defaultSubject: "Your {{business}} website demo is still waiting",
  },
  {
    id: "claim_today",
    label: "Claim your site",
    description: "Direct CTA to claim the custom live build from the demo.",
    audience: "ready",
    defaultSubject: "{{firstName}}, claim your custom {{business}} website",
  },
  {
    id: "demo_expiring",
    label: "Demo expiring soon",
    description: "Urgency — the private demo link won’t last forever.",
    audience: "ready",
    defaultSubject: "Your {{business}} demo expires soon",
  },
  {
    id: "come_back",
    label: "Soft check-in",
    description: "Low-pressure follow-up if they went quiet after generating.",
    audience: "any",
    defaultSubject: "Quick check-in about your {{business}} website demo",
  },
  {
    id: "expired_revive",
    label: "Expired — revive demo",
    description: "For expired demos — offer to refresh and send a new link.",
    audience: "expired",
    defaultSubject: "We can refresh your {{business}} website demo",
  },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "";
}

function businessLabel(vars: GhostEmailVars) {
  return vars.businessName?.trim() || "your business";
}

function greeting(vars: GhostEmailVars) {
  const first = firstName(vars.name);
  return first ? `Hi ${first},` : "Hi,";
}

function locationLine(vars: GhostEmailVars) {
  const city = vars.city?.trim() || "";
  const state = vars.state?.trim() || "";
  if (city && state) return `${city}, ${state}`;
  return city || state || "";
}

function fillSubject(template: string, vars: GhostEmailVars) {
  const business = businessLabel(vars);
  const first = firstName(vars.name) || "there";
  return template
    .replace(/\{\{business\}\}/g, business)
    .replace(/\{\{firstName\}\}/g, first)
    .replace(/\{\{name\}\}/g, vars.name?.trim() || first);
}

function ctaButton(href: string, label: string) {
  if (!href) return "";
  return `<p style="margin:0 0 20px;font-family:system-ui,sans-serif;">
      <a href="${escapeHtml(href)}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(label)}</a>
    </p>`;
}

function linkFallback(href: string) {
  if (!href) return "";
  return `<p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Or copy this link:<br/>
      <a href="${escapeHtml(href)}" style="color:#5B2E9E;word-break:break-all;">${escapeHtml(href)}</a>
    </p>`;
}

function shell(opts: {
  eyebrow: string;
  title: string;
  bodyHtml: string;
  ctaHtml?: string;
  extraHtml?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">${escapeHtml(opts.eyebrow)}</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;">${escapeHtml(opts.title)}</h1>
    ${opts.bodyHtml}
    ${opts.ctaHtml || ""}
    ${opts.extraHtml || ""}
    <p style="margin:28px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">
      Questions? Reply to this email or write <a href="mailto:bsitesioteam@gmail.com" style="color:#5B2E9E;">bsitesioteam@gmail.com</a>.
    </p>
    <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">— Bsites</p>
  </div>
</body>
</html>
`.trim();
}

export function resolveGhostUrls(input: {
  previewSlug?: string;
  previewReady?: boolean;
  previewExpired?: boolean;
}) {
  const origin = siteOrigin();
  const slug = input.previewSlug?.trim() || "";
  if (!slug || input.previewExpired || !input.previewReady) {
    return { previewUrl: "", claimUrl: "" };
  }
  return {
    previewUrl: `${origin}/preview/${slug}`,
    claimUrl: `${origin}/preview/${slug}/claim`,
  };
}

export function buildGhostEmail(
  templateId: GhostTemplateId,
  vars: GhostEmailVars,
  subjectOverride?: string
) {
  const meta = GHOST_TEMPLATES.find((t) => t.id === templateId);
  if (!meta) throw new Error(`Unknown template: ${templateId}`);

  const greet = greeting(vars);
  const business = businessLabel(vars);
  const loc = locationLine(vars);
  const previewUrl = vars.previewUrl || "";
  const claimUrl = vars.claimUrl || previewUrl;
  const subject = fillSubject(subjectOverride?.trim() || meta.defaultSubject, vars);

  let text = "";
  let html = "";

  switch (templateId) {
    case "demo_waiting": {
      text = [
        greet,
        ``,
        `Just a quick note — your private website demo for ${business} is still waiting for you.`,
        previewUrl ? `` : null,
        previewUrl ? `Open it here: ${previewUrl}` : null,
        ``,
        `It’s private (not on Google). If you like it, you can claim a custom live site from the demo.`,
        ``,
        `— Bsites`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      html = shell({
        eyebrow: "Still waiting",
        title: "Your website demo is still here",
        bodyHtml: `<p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greet)} We built a private demo for <strong>${escapeHtml(business)}</strong>${loc ? ` in ${escapeHtml(loc)}` : ""}. It’s ready whenever you are.
    </p>`,
        ctaHtml: ctaButton(previewUrl, "View my demo") + linkFallback(previewUrl),
        extraHtml: `<p style="margin:24px 0 0;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Private · not indexed · a real person at Bsites custom-builds the final site if you claim it.
    </p>`,
      });
      break;
    }
    case "claim_today": {
      text = [
        greet,
        ``,
        `Your ${business} demo is ready — claim it when you want a custom live site built from that preview.`,
        claimUrl ? `Claim here: ${claimUrl}` : null,
        previewUrl && previewUrl !== claimUrl ? `Or view the demo: ${previewUrl}` : null,
        ``,
        `$0 to build · $84/mo hosting & care · cancel anytime once live.`,
        ``,
        `— Bsites`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      html = shell({
        eyebrow: "Ready to go live",
        title: "Claim your custom website",
        bodyHtml: `<p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greet)} Your <strong>${escapeHtml(business)}</strong> demo is ready. When you claim it, a real person at Bsites turns it into your custom live site.
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;color:#3D3654;">
      <li>$0 build</li>
      <li>$84/mo hosting &amp; care</li>
      <li>Cancel anytime once you’re live</li>
    </ul>`,
        ctaHtml:
          ctaButton(claimUrl || previewUrl, "Claim my site") +
          linkFallback(claimUrl || previewUrl),
      });
      break;
    }
    case "demo_expiring": {
      text = [
        greet,
        ``,
        `Heads up — your private ${business} website demo won’t stay available forever.`,
        previewUrl ? `Open it while you can: ${previewUrl}` : null,
        ``,
        `Like what you see? Claim a custom live site from the preview.`,
        ``,
        `— Bsites`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      html = shell({
        eyebrow: "Expiring soon",
        title: "Your demo won’t last forever",
        bodyHtml: `<p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greet)} Your private demo for <strong>${escapeHtml(business)}</strong> is still up — but temporary demos expire. Open it now while the link works.
    </p>`,
        ctaHtml: ctaButton(previewUrl, "Open my demo") + linkFallback(previewUrl),
      });
      break;
    }
    case "come_back": {
      text = [
        greet,
        ``,
        `Checking in — we generated a website demo for ${business} and haven’t heard back.`,
        previewUrl ? `Your demo: ${previewUrl}` : `Reply to this email if you’d like us to refresh or resend your demo.`,
        ``,
        `No pressure — happy to answer questions if you’re still deciding.`,
        ``,
        `— Bsites`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      html = shell({
        eyebrow: "Checking in",
        title: "Still thinking it over?",
        bodyHtml: `<p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greet)} We built a demo for <strong>${escapeHtml(business)}</strong> and wanted to make sure you didn’t lose the link. No pressure — reply anytime with questions.
    </p>`,
        ctaHtml: previewUrl
          ? ctaButton(previewUrl, "View my demo") + linkFallback(previewUrl)
          : `<p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#3D3654;">Reply to this email and we’ll get you sorted.</p>`,
      });
      break;
    }
    case "expired_revive": {
      text = [
        greet,
        ``,
        `Your temporary ${business} website demo has expired.`,
        ``,
        `Reply to this email and we can refresh it and send you a new private link — usually the same day.`,
        ``,
        `— Bsites`,
      ].join("\n");

      html = shell({
        eyebrow: "Demo expired",
        title: "We can refresh your demo",
        bodyHtml: `<p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greet)} Your temporary demo for <strong>${escapeHtml(business)}</strong> has expired. Reply to this email and we’ll refresh it and send a new private link.
    </p>`,
        ctaHtml: `<p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#3D3654;">
      Just hit reply — tell us you want the demo refreshed.
    </p>`,
      });
      break;
    }
  }

  return { subject, text, html, meta };
}

export function getGhostTemplate(id: string): GhostTemplateMeta | undefined {
  return GHOST_TEMPLATES.find((t) => t.id === id);
}

export function isGhostTemplateId(id: string): id is GhostTemplateId {
  return GHOST_TEMPLATES.some((t) => t.id === id);
}
