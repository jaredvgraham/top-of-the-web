import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Onboarding from "@/models/Onboarding";
import {
  markOnboardingStarted,
  normalizeEmail,
  normalizeOwnerNames,
  serializeOnboarding,
  type OnboardingPatchBody,
} from "@/lib/onboarding";

type RouteContext = { params: { token: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect();
    const session = await Onboarding.findOne({ token: params.token });

    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: serializeOnboarding(session) });
  } catch (error) {
    console.error("Failed to load onboarding", error);
    return NextResponse.json(
      { message: "Unable to load onboarding" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const body = (await req.json()) as OnboardingPatchBody;
    await dbConnect();

    const session = await Onboarding.findOne({ token: params.token });
    if (!session) {
      return NextResponse.json(
        { message: "Onboarding session not found" },
        { status: 404 }
      );
    }

    if (
      typeof body.currentStep === "number" &&
      Number.isFinite(body.currentStep)
    ) {
      session.currentStep = Math.max(
        0,
        Math.min(2, Math.floor(body.currentStep))
      );
    }

    if (body.contact) {
      const ownerNames = body.contact.ownerNames
        ? normalizeOwnerNames(body.contact.ownerNames, body.contact.name || "")
        : normalizeOwnerNames(
            session.contact.ownerNames,
            body.contact.name ?? session.contact.name
          );

      const contact = {
        name: ownerNames[0] || "",
        ownerNames,
        email: body.contact.email ?? session.contact.email,
        phone: body.contact.phone ?? session.contact.phone,
        businessName: body.contact.businessName ?? session.contact.businessName,
      };
      if (body.contact.email) {
        contact.email = normalizeEmail(body.contact.email);
        session.email = contact.email;
      }
      session.contact = contact;
    }
    if (body.business) {
      session.business = {
        description: body.business.description ?? session.business.description,
        city: body.business.city ?? session.business.city,
        state: body.business.state ?? session.business.state,
        idealCustomers:
          body.business.idealCustomers ?? session.business.idealCustomers,
        serviceArea: body.business.serviceArea ?? session.business.serviceArea,
        existingSiteUrl:
          body.business.existingSiteUrl ?? session.business.existingSiteUrl,
      };
    }
    if (body.brand) {
      session.brand = {
        colors: body.brand.colors ?? session.brand.colors,
        fontsVibe: body.brand.fontsVibe ?? session.brand.fontsVibe,
        tagline: body.brand.tagline ?? session.brand.tagline,
      };
    }
    if (body.content) {
      session.content = {
        pagesNeeded: body.content.pagesNeeded ?? session.content.pagesNeeded,
        aboutCopy: body.content.aboutCopy ?? session.content.aboutCopy,
        servicesProducts:
          body.content.servicesProducts ?? session.content.servicesProducts,
        faqs: body.content.faqs ?? session.content.faqs,
        primaryCta: body.content.primaryCta ?? session.content.primaryCta,
      };
    }
    if (body.extras) {
      session.extras = {
        preferredDomain:
          body.extras.preferredDomain ?? session.extras.preferredDomain,
        inspirationLinks:
          body.extras.inspirationLinks ?? session.extras.inspirationLinks,
        notes: body.extras.notes ?? session.extras.notes,
      };
    }

    markOnboardingStarted(session);
    await session.save();

    return NextResponse.json({
      session: serializeOnboarding(session),
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save onboarding", error);
    return NextResponse.json(
      { message: "Unable to save onboarding" },
      { status: 500 }
    );
  }
}
