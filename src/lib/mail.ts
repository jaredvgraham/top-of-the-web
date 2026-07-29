import nodemailer from "nodemailer";
import { siteOrigin } from "@/lib/siteOrigin";

export { siteOrigin };

export function getMailTransporter() {
  const user = process.env.EMAIL?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) {
    throw new Error("EMAIL and EMAIL_PASS must be configured");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export type PurchaseConfirmationInput = {
  to: string;
  websiteId: string;
  pack: string;
  plan: string;
  phone?: string;
  businessName?: string;
  previewSlug?: string;
};

export async function sendPurchaseConfirmationEmail(
  input: PurchaseConfirmationInput
) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const origin = siteOrigin();
  const billingUrl = `${origin}/billing`;
  const previewUrl = input.previewSlug
    ? `${origin}/preview/${input.previewSlug}`
    : "";
  const nameLine = input.businessName?.trim()
    ? ` for ${input.businessName.trim()}`
    : "";

  const subject = `Bsites purchase confirmed — your Website ID`;

  const text = [
    `Thanks for your purchase${nameLine}!`,
    ``,
    `Your custom website build is underway.`,
    ``,
    `YOUR WEBSITE ID (save this)`,
    `${input.websiteId}`,
    ``,
    `Use this ID anytime at ${billingUrl} to manage billing, update your card, view invoices, or cancel.`,
    ``,
    `WHAT YOU BOUGHT`,
    `Plan: ${input.plan || input.pack || "Managed Website Plan"}`,
    `Build: $0`,
    `Hosting & care: $84/mo`,
    input.phone ? `Phone on file: ${input.phone}` : null,
    ``,
    `WHAT HAPPENS NEXT`,
    `1. Keep this email — your Website ID is how you sign into billing (and future updates).`,
    `2. We'll call or text you for a short brief on the custom updates you want.`,
    `3. Your site goes live within about 24 hours of checkout.`,
    `4. After you're live, you can cancel anytime from the billing portal.`,
    `5. 100% satisfaction — we work it until you're happy.`,
    previewUrl ? `` : null,
    previewUrl ? `Your demo preview: ${previewUrl}` : null,
    ``,
    `Questions? Reply to this email or write bsitesioteam@gmail.com.`,
    ``,
    `— Bsites`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Purchase confirmed</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;">Thanks — your build is on.</h1>
    <p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      Your custom website${nameLine ? ` for <strong>${escapeHtml(input.businessName || "")}</strong>` : ""} is underway. Save your Website ID — you’ll use it to manage billing.
    </p>

    <div style="background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:20px 22px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6B6578;">Your Website ID</p>
      <p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:18px;word-break:break-all;color:#1A1433;"><strong>${escapeHtml(input.websiteId)}</strong></p>
      <p style="margin:12px 0 0;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;color:#6B6578;">
        Sign in at <a href="${billingUrl}" style="color:#5B2E9E;">${billingUrl}</a> with this ID to manage payment, invoices, or cancel.
      </p>
    </div>

    <div style="background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:20px 22px;margin-bottom:20px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.55;color:#3D3654;">
      <p style="margin:0 0 10px;"><strong>Plan:</strong> ${escapeHtml(input.plan || input.pack || "Managed Website Plan")}</p>
      <p style="margin:0 0 10px;"><strong>Build:</strong> $0</p>
      <p style="margin:0 0 10px;"><strong>Hosting &amp; care:</strong> $84/mo</p>
      ${input.phone ? `<p style="margin:0;"><strong>Phone on file:</strong> ${escapeHtml(input.phone)}</p>` : ""}
    </div>

    <ol style="margin:0 0 24px;padding-left:20px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;color:#3D3654;">
      <li>Save your Website ID for billing access.</li>
      <li>We’ll call/text for your custom brief.</li>
      <li>Site goes live within ~24 hours.</li>
      <li>Cancel anytime once you’re live · 100% satisfaction guarantee.</li>
    </ol>

    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;">
      <a href="${billingUrl}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Manage billing</a>
    </p>
    ${
      previewUrl
        ? `<p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;"><a href="${previewUrl}" style="color:#5B2E9E;">View your demo preview</a></p>`
        : ""
    }
    <p style="margin:28px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">
      Questions? Reply to this email or write <a href="mailto:bsitesioteam@gmail.com" style="color:#5B2E9E;">bsitesioteam@gmail.com</a>.
    </p>
    <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">— Bsites</p>
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites <${from}>`,
    to: input.to,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Internal ops inbox for funnel alerts. Override with ADMIN_NOTIFY_EMAIL. */
export function adminNotifyEmail() {
  return (
    process.env.ADMIN_NOTIFY_EMAIL?.trim() || "jaredvgraham@gmail.com"
  );
}

function rowsToHtml(rows: Array<[string, string]>) {
  return rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px 8px 0;font-family:system-ui,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6B6578;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;font-family:system-ui,sans-serif;font-size:14px;color:#1A1433;word-break:break-word;">${value}</td>
        </tr>`
    )
    .join("");
}

function plainValue(value: string) {
  return value?.trim() || "—";
}

/** Escapes for HTML, then preserves the author's line breaks. */
function escapeMultiline(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br/>");
}

export type AdminInquiryEmailInput = {
  to: string;
  name: string;
  email: string;
  phone: string;
  inquiry: string;
  onboardingUrl: string;
};

export async function sendAdminInquiryEmail(input: AdminInquiryEmailInput) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const subject = `New inquiry — ${input.name || input.email}`;

  const text = [
    `New contact form inquiry`,
    ``,
    `Name: ${plainValue(input.name)}`,
    `Email: ${plainValue(input.email)}`,
    `Phone: ${plainValue(input.phone)}`,
    ``,
    `Message:`,
    plainValue(input.inquiry),
    ``,
    `Onboarding link (client was redirected here):`,
    plainValue(input.onboardingUrl),
    ``,
    `— Bsites admin`,
  ].join("\n");

  const htmlRows = rowsToHtml([
    ["Name", escapeHtml(plainValue(input.name))],
    [
      "Email",
      `<a href="mailto:${escapeHtml(input.email)}" style="color:#5B2E9E;">${escapeHtml(input.email)}</a>`,
    ],
    [
      "Phone",
      input.phone
        ? `<a href="tel:${escapeHtml(input.phone)}" style="color:#5B2E9E;">${escapeHtml(input.phone)}</a>`
        : "—",
    ],
  ]);

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Admin alert</p>
    <h1 style="margin:0 0 8px;font-size:26px;line-height:1.15;font-weight:500;">New contact inquiry</h1>
    <p style="margin:0 0 20px;font-family:system-ui,sans-serif;font-size:14px;color:#6B6578;">Someone submitted the contact form. Reply to this email to answer them directly.</p>

    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:8px 16px;display:block;">
      ${htmlRows}
    </table>

    <div style="background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:20px 22px;margin-top:16px;">
      <p style="margin:0 0 10px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6B6578;">What should the site help them sell?</p>
      <p style="margin:0;font-family:system-ui,sans-serif;font-size:15px;line-height:1.65;color:#1A1433;word-break:break-word;">${escapeMultiline(plainValue(input.inquiry))}</p>
    </div>

    <p style="margin:22px 0 0;font-family:system-ui,sans-serif;">
      <a href="mailto:${escapeHtml(input.email)}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Reply by email</a>
      ${
        input.phone
          ? `<a href="tel:${escapeHtml(input.phone)}" style="display:inline-block;margin-left:8px;border:1px solid rgba(26,20,51,0.25);color:#1A1433;text-decoration:none;padding:11px 20px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Call now</a>`
          : ""
      }
    </p>

    ${
      input.onboardingUrl
        ? `<p style="margin:20px 0 0;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Onboarding brief they were sent to:<br/>
      <a href="${escapeHtml(input.onboardingUrl)}" style="color:#5B2E9E;word-break:break-all;">${escapeHtml(input.onboardingUrl)}</a>
    </p>`
        : ""
    }
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites Alerts <${from}>`,
    to: input.to,
    replyTo: input.email,
    subject,
    text,
    html,
  });
}

export type AdminLeadCapturedInput = {
  name: string;
  businessName: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  continueUrl: string;
  token: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingUrl?: string;
  ip?: string;
};

export async function sendAdminLeadCapturedEmail(input: AdminLeadCapturedInput) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const to = adminNotifyEmail();
  const subject = `New preview lead — ${input.businessName || input.email}`;

  const text = [
    `New lead captured (initial form)`,
    ``,
    `Name: ${plainValue(input.name)}`,
    `Business: ${plainValue(input.businessName)}`,
    `City/State: ${plainValue(input.city)}, ${plainValue(input.state)}`,
    `Email: ${plainValue(input.email)}`,
    `Phone: ${plainValue(input.phone)}`,
    `Continue: ${plainValue(input.continueUrl)}`,
    `Lead token: ${plainValue(input.token)}`,
    ``,
    `Attribution`,
    `fbclid: ${plainValue(input.fbclid || "")}`,
    `fbp: ${plainValue(input.fbp || "")}`,
    `fbc: ${plainValue(input.fbc || "")}`,
    `utm_source: ${plainValue(input.utmSource || "")}`,
    `utm_medium: ${plainValue(input.utmMedium || "")}`,
    `utm_campaign: ${plainValue(input.utmCampaign || "")}`,
    `landing: ${plainValue(input.landingUrl || "")}`,
    `ip: ${plainValue(input.ip || "")}`,
    ``,
    `— Bsites admin`,
  ].join("\n");

  const htmlRows = rowsToHtml([
    ["Name", escapeHtml(plainValue(input.name))],
    ["Business", escapeHtml(plainValue(input.businessName))],
    ["City / State", escapeHtml(`${plainValue(input.city)}, ${plainValue(input.state)}`)],
    [
      "Email",
      `<a href="mailto:${escapeHtml(input.email)}" style="color:#5B2E9E;">${escapeHtml(input.email)}</a>`,
    ],
    [
      "Phone",
      `<a href="tel:${escapeHtml(input.phone)}" style="color:#5B2E9E;">${escapeHtml(input.phone)}</a>`,
    ],
    [
      "Continue link",
      `<a href="${escapeHtml(input.continueUrl)}" style="color:#5B2E9E;">${escapeHtml(input.continueUrl)}</a>`,
    ],
    ["Lead token", `<code>${escapeHtml(input.token)}</code>`],
    ["fbclid", escapeHtml(plainValue(input.fbclid || ""))],
    ["fbp", escapeHtml(plainValue(input.fbp || ""))],
    ["fbc", escapeHtml(plainValue(input.fbc || ""))],
    ["utm_source", escapeHtml(plainValue(input.utmSource || ""))],
    ["utm_medium", escapeHtml(plainValue(input.utmMedium || ""))],
    ["utm_campaign", escapeHtml(plainValue(input.utmCampaign || ""))],
    ["Landing URL", escapeHtml(plainValue(input.landingUrl || ""))],
    ["IP", escapeHtml(plainValue(input.ip || ""))],
  ]);

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Admin alert</p>
    <h1 style="margin:0 0 8px;font-size:26px;line-height:1.15;font-weight:500;">New preview lead</h1>
    <p style="margin:0 0 20px;font-family:system-ui,sans-serif;font-size:14px;color:#6B6578;">Initial form completed — continue email sent to the lead.</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:8px 16px;display:block;">
      ${htmlRows}
    </table>
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites Alerts <${from}>`,
    to,
    subject,
    text,
    html,
  });
}

export type AdminPreviewReadyInput = {
  email: string;
  phone?: string;
  name?: string;
  businessName?: string;
  city?: string;
  state?: string;
  facebookUrl: string;
  previewUrl: string;
  slug: string;
  leadToken?: string;
  previewId?: string;
  elapsedMs?: number;
  assetCount?: number;
};

export async function sendAdminPreviewReadyEmail(input: AdminPreviewReadyInput) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const to = adminNotifyEmail();
  const business = input.businessName?.trim() || "Business";
  const subject = `Preview ready — ${business} (${input.slug})`;
  const elapsed =
    typeof input.elapsedMs === "number"
      ? `${Math.round(input.elapsedMs / 1000)}s`
      : "—";

  const text = [
    `Preview generated`,
    ``,
    `Business: ${plainValue(business)}`,
    `Contact: ${plainValue(input.name || "")}`,
    `Email: ${plainValue(input.email)}`,
    `Phone: ${plainValue(input.phone || "")}`,
    `City/State: ${plainValue(input.city || "")}, ${plainValue(input.state || "")}`,
    `Facebook: ${plainValue(input.facebookUrl)}`,
    `Preview: ${plainValue(input.previewUrl)}`,
    `Slug: ${plainValue(input.slug)}`,
    `Lead token: ${plainValue(input.leadToken || "")}`,
    `Preview ID: ${plainValue(input.previewId || "")}`,
    `Assets: ${input.assetCount ?? "—"}`,
    `Elapsed: ${elapsed}`,
    ``,
    `— Bsites admin`,
  ].join("\n");

  const htmlRows = rowsToHtml([
    ["Business", escapeHtml(plainValue(business))],
    ["Contact name", escapeHtml(plainValue(input.name || ""))],
    [
      "Email",
      `<a href="mailto:${escapeHtml(input.email)}" style="color:#5B2E9E;">${escapeHtml(input.email)}</a>`,
    ],
    [
      "Phone",
      input.phone
        ? `<a href="tel:${escapeHtml(input.phone)}" style="color:#5B2E9E;">${escapeHtml(input.phone)}</a>`
        : "—",
    ],
    [
      "City / State",
      escapeHtml(`${plainValue(input.city || "")}, ${plainValue(input.state || "")}`),
    ],
    [
      "Facebook",
      `<a href="${escapeHtml(input.facebookUrl)}" style="color:#5B2E9E;">${escapeHtml(input.facebookUrl)}</a>`,
    ],
    [
      "Preview",
      `<a href="${escapeHtml(input.previewUrl)}" style="color:#5B2E9E;">${escapeHtml(input.previewUrl)}</a>`,
    ],
    ["Slug", escapeHtml(plainValue(input.slug))],
    ["Lead token", `<code>${escapeHtml(plainValue(input.leadToken || ""))}</code>`],
    ["Preview ID", `<code>${escapeHtml(plainValue(input.previewId || ""))}</code>`],
    ["Images imported", escapeHtml(String(input.assetCount ?? "—"))],
    ["Generate time", escapeHtml(elapsed)],
  ]);

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Admin alert</p>
    <h1 style="margin:0 0 8px;font-size:26px;line-height:1.15;font-weight:500;">Preview ready</h1>
    <p style="margin:0 0 20px;font-family:system-ui,sans-serif;font-size:14px;color:#6B6578;">A Facebook demo just finished generating.</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(26,20,51,0.1);border-radius:16px;padding:8px 16px;display:block;">
      ${htmlRows}
    </table>
    <p style="margin:20px 0 0;font-family:system-ui,sans-serif;">
      <a href="${escapeHtml(input.previewUrl)}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Open demo</a>
    </p>
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites Alerts <${from}>`,
    to,
    subject,
    text,
    html,
  });
}

export type PreviewReadyEmailInput = {
  to: string;
  previewUrl: string;
  businessName?: string;
  name?: string;
};

export async function sendPreviewReadyEmail(input: PreviewReadyEmailInput) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const firstName = input.name?.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const business = input.businessName?.trim() || "your business";
  const subject = `Your free website demo is ready — ${business}`;

  const text = [
    greeting,
    ``,
    `Your private website demo for ${business} is ready.`,
    ``,
    `Open it here:`,
    input.previewUrl,
    ``,
    `This demo is private — not published to Google. Like what you see? You can lock in a custom live site from the preview.`,
    ``,
    `Questions? Reply to this email or write bsitesioteam@gmail.com.`,
    ``,
    `— Bsites`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Demo ready</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;">Your free website demo is ready</h1>
    <p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greeting)} We built a private demo for <strong>${escapeHtml(business)}</strong> from your Facebook page. Open it anytime — even if you left the tab.
    </p>

    <p style="margin:0 0 20px;font-family:system-ui,sans-serif;">
      <a href="${escapeHtml(input.previewUrl)}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">View my demo</a>
    </p>

    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Or copy this link:<br/>
      <a href="${escapeHtml(input.previewUrl)}" style="color:#5B2E9E;word-break:break-all;">${escapeHtml(input.previewUrl)}</a>
    </p>

    <p style="margin:24px 0 0;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Private · not indexed by Google · a real person at Bsites custom-builds the final site if you claim it.
    </p>

    <p style="margin:28px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">
      Questions? Reply to this email or write <a href="mailto:bsitesioteam@gmail.com" style="color:#5B2E9E;">bsitesioteam@gmail.com</a>.
    </p>
    <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">— Bsites</p>
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites <${from}>`,
    to: input.to,
    subject,
    text,
    html,
  });
}

export type LeadContinueEmailInput = {
  to: string;
  continueUrl: string;
  name?: string;
  phone?: string;
};

export async function sendLeadContinueEmail(input: LeadContinueEmailInput) {
  const from = process.env.EMAIL?.trim();
  if (!from) throw new Error("EMAIL is not configured");

  const firstName = input.name?.trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const subject = `Continue your free Bsites website preview`;

  const text = [
    greeting,
    ``,
    `Thanks for starting your free website preview.`,
    ``,
    `Next step: paste your Facebook business page link so we can build your private demo.`,
    ``,
    `Continue here:`,
    input.continueUrl,
    ``,
    `This link is personal to you — email and phone will already be filled in.`,
    ``,
    `Questions? Reply to this email or write bsitesioteam@gmail.com.`,
    ``,
    `— Bsites`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F5F5FB;font-family:Georgia,'Times New Roman',serif;color:#1A1433;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5B2E9E;font-weight:600;">Website preview</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.15;font-weight:500;">Continue your free demo</h1>
    <p style="margin:0 0 24px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#3D3654;">
      ${escapeHtml(greeting)} You’re one step away. Paste your Facebook business page link and we’ll auto-generate a private website demo for your business.
    </p>

    <p style="margin:0 0 20px;font-family:system-ui,sans-serif;">
      <a href="${escapeHtml(input.continueUrl)}" style="display:inline-block;background:#5B2E9E;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Continue my website preview</a>
    </p>

    <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.55;color:#6B6578;">
      Or copy this link:<br/>
      <a href="${escapeHtml(input.continueUrl)}" style="color:#5B2E9E;word-break:break-all;">${escapeHtml(input.continueUrl)}</a>
    </p>

    <p style="margin:28px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">
      Questions? Reply to this email or write <a href="mailto:bsitesioteam@gmail.com" style="color:#5B2E9E;">bsitesioteam@gmail.com</a>.
    </p>
    <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;color:#6B6578;">— Bsites</p>
  </div>
</body>
</html>
`.trim();

  const transporter = getMailTransporter();
  await transporter.sendMail({
    from: `Bsites <${from}>`,
    to: input.to,
    subject,
    text,
    html,
  });
}

