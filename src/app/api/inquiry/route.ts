import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import Lead, { leadExpiresAt } from "@/models/Lead";
import { sendAdminInquiryEmail } from "@/lib/mail";
import {
  createOnboardingToken,
  normalizeEmail,
  normalizeOwnerNames,
  onboardingPublicUrl,
} from "@/lib/onboarding";
import {
  createLeadToken,
  normalizeLeadEmail,
  normalizeLeadPhone,
} from "@/lib/preview/lead";
import { siteOrigin } from "@/lib/siteOrigin";

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return req.headers.get("x-real-ip") || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const inquiry =
      typeof body.inquiry === "string" ? body.inquiry.trim() : "";
    const email =
      typeof body.email === "string" ? normalizeEmail(body.email) : "";

    if (!name || !email || !phone || !inquiry) {
      return NextResponse.json(
        { message: "Name, email, phone, and message are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let session = await Onboarding.findOne({
      $or: [{ email }, { "contact.email": email }],
      status: { $in: ["not_started", "in_progress"] },
    }).sort({ updatedAt: -1 });

    const ownerNames = normalizeOwnerNames(undefined, name);
    const noteBlock = `Contact form message:\n${inquiry}`;

    if (!session) {
      session = await Onboarding.create({
        token: createOnboardingToken(),
        email,
        status: "not_started",
        currentStep: 0,
        contact: {
          name: ownerNames[0] || name,
          ownerNames,
          email,
          phone,
          businessName: "",
        },
        business: {
          description: inquiry,
          city: "",
          state: "",
          idealCustomers: "",
          serviceArea: "",
          existingSiteUrl: "",
        },
        extras: {
          preferredDomain: "",
          inspirationLinks: "",
          notes: noteBlock,
        },
      });
    } else {
      const existingOwners = (session.contact?.ownerNames || []).filter((n) =>
        n.trim()
      );
      session.email = email;
      session.contact.name = ownerNames[0] || name;
      session.contact.ownerNames = existingOwners.length
        ? existingOwners
        : ownerNames;
      session.contact.email = email;
      session.contact.phone = phone;
      if (!(session.business?.description || "").trim()) {
        session.business.description = inquiry;
      }
      const existingNotes = (session.extras?.notes || "").trim();
      if (!existingNotes.includes(inquiry)) {
        session.extras.notes = existingNotes
          ? `${existingNotes}\n\n${noteBlock}`
          : noteBlock;
      }
      session.markModified("contact");
      session.markModified("business");
      session.markModified("extras");
      await session.save();
    }

    const origin = req.headers.get("origin") || undefined;
    const onboardingUrl = onboardingPublicUrl(session.token, origin);

    // Also create an admin Lead so contact inquiries appear under /admin/leads.
    // Failures here must not break the inquiry / onboarding redirect.
    try {
      const landingBase = (origin || siteOrigin()).replace(/\/$/, "");
      await Lead.create({
        token: createLeadToken(),
        email: normalizeLeadEmail(email),
        phone: normalizeLeadPhone(phone) || phone,
        name: name.slice(0, 80),
        businessName: "",
        city: "",
        state: "",
        status: "captured",
        source: "contact",
        notes: inquiry.slice(0, 4000),
        onboardingToken: session.token,
        authorized: true,
        attribution: {
          landingUrl: `${landingBase}/contact`,
          userAgent: (req.headers.get("user-agent") || "").slice(0, 500),
          ip: clientIp(req).slice(0, 64),
        },
        expiresAt: leadExpiresAt(),
      });
    } catch (leadError) {
      console.error("Inquiry saved but lead create failed:", leadError);
    }

    const notifyTo = process.env.EMAIL?.trim();
    if (notifyTo) {
      // A failed notification shouldn't lose the lead — it's already saved.
      try {
        await sendAdminInquiryEmail({
          to: notifyTo,
          name,
          email,
          phone,
          inquiry,
          onboardingUrl,
        });
      } catch (mailError) {
        console.error("Inquiry saved but notification failed:", mailError);
      }
    }

    return NextResponse.json({
      message: "Success",
      token: session.token,
      onboardingUrl,
    });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json(
      { message: "Unable to submit inquiry" },
      { status: 500 }
    );
  }
}
