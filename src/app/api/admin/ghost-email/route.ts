import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { listGhostLeads, getGhostLeadsByIds } from "@/lib/ghostLeads";
import {
  GHOST_TEMPLATES,
  buildGhostEmail,
  isGhostTemplateId,
  type GhostTemplateId,
} from "@/lib/ghostEmailTemplates";
import { getMailTransporter } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_SEND = 100;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const segmentParam = request.nextUrl.searchParams.get("segment") || "all";
    const segment =
      segmentParam === "ready" || segmentParam === "expired"
        ? segmentParam
        : "all";

    const ghosts = await listGhostLeads(segment);

    return NextResponse.json(
      {
        ghosts,
        templates: GHOST_TEMPLATES,
        counts: {
          total: ghosts.length,
          ready: ghosts.filter((g) => g.segment === "ready").length,
          expired: ghosts.filter((g) => g.segment === "expired").length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] list ghost leads failed", error);
    return NextResponse.json(
      { error: "Failed to load ghost leads" },
      { status: 500 }
    );
  }
}

type SendBody = {
  templateId?: string;
  subject?: string;
  ids?: string[];
  dryRun?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request.json()) as SendBody;
    const templateId = body.templateId || "";
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id) => typeof id === "string" && id.trim())
      : [];
    const dryRun = Boolean(body.dryRun);
    const subjectOverride =
      typeof body.subject === "string" ? body.subject : undefined;

    if (!isGhostTemplateId(templateId)) {
      return NextResponse.json(
        { error: "Invalid templateId" },
        { status: 400 }
      );
    }

    if (!ids.length) {
      return NextResponse.json(
        { error: "Select at least one recipient" },
        { status: 400 }
      );
    }

    if (ids.length > MAX_SEND) {
      return NextResponse.json(
        { error: `Max ${MAX_SEND} recipients per send` },
        { status: 400 }
      );
    }

    const from = process.env.EMAIL?.trim();
    if (!from || !process.env.EMAIL_PASS?.trim()) {
      return NextResponse.json(
        { error: "EMAIL and EMAIL_PASS must be configured" },
        { status: 503 }
      );
    }

    const recipients = await getGhostLeadsByIds(ids);
    if (!recipients.length) {
      return NextResponse.json(
        { error: "No matching ghost leads for those ids" },
        { status: 404 }
      );
    }

    if (dryRun) {
      const samples = recipients.slice(0, 3).map((row) => {
        const built = buildGhostEmail(
          templateId as GhostTemplateId,
          {
            name: row.name,
            businessName: row.businessName,
            city: row.city,
            state: row.state,
            previewUrl: row.previewUrl,
            claimUrl: row.claimUrl,
            email: row.email,
          },
          subjectOverride
        );
        return {
          id: row.id,
          email: row.email,
          subject: built.subject,
          html: built.html,
          text: built.text,
        };
      });

      return NextResponse.json({
        dryRun: true,
        wouldSend: recipients.length,
        samples,
      });
    }

    const transporter = getMailTransporter();
    let sent = 0;
    const failed: Array<{ id: string; email: string; error: string }> = [];

    for (const row of recipients) {
      try {
        const built = buildGhostEmail(
          templateId as GhostTemplateId,
          {
            name: row.name,
            businessName: row.businessName,
            city: row.city,
            state: row.state,
            previewUrl: row.previewUrl,
            claimUrl: row.claimUrl,
            email: row.email,
          },
          subjectOverride
        );

        await transporter.sendMail({
          from: `Bsites <${from}>`,
          to: row.email,
          subject: built.subject,
          text: built.text,
          html: built.html,
        });
        sent += 1;
      } catch (err) {
        failed.push({
          id: row.id,
          email: row.email,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
    }

    return NextResponse.json({
      sent,
      failed,
      templateId,
      requested: recipients.length,
    });
  } catch (error) {
    console.error("[admin] ghost email send failed", error);
    return NextResponse.json(
      { error: "Failed to send ghost emails" },
      { status: 500 }
    );
  }
}
