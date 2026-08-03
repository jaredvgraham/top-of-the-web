import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Preview, { isPreviewExpired } from "@/models/Preview";
import { previewPagesComplete } from "@/lib/preview/generatePreviewHtml";
import {
  pagesForScope,
  revisePreviewPages,
  type RevisePageKey,
} from "@/lib/preview/revisePreviewHtml";
import {
  inferRevisionScope,
  isCustomBuildOnlyRequest,
  isPreviewPurchased,
  snapshotRevisionQuota,
} from "@/lib/preview/revisionQuota";
import {
  reviseProgressEvent,
  type ReviseStreamEvent,
} from "@/lib/preview/revisionProgress";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

type StreamEvent = ReviseStreamEvent;

const REVISE_LOCK_MS = 8 * 60 * 1000;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function rateLimitIp(ip: string) {
  const now = Date.now();
  const row = ipHits.get(ip);
  if (!row || row.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (row.count >= 12) return false;
  row.count += 1;
  return true;
}

function parseFocusPage(value: unknown): RevisePageKey | "all" {
  if (value === "services" || value === "about" || value === "all") return value;
  return "home";
}

function ndjsonResponse(
  run: (send: (event: StreamEvent) => void) => Promise<void>
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      void (async () => {
        try {
          await run(send);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Revision failed";
          send({ type: "error", code: "revise_failed", message });
        } finally {
          controller.close();
        }
      })();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const slug = (params.slug || "").trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  await dbConnect();
  const preview = await Preview.findOne({ slug })
    .select(
      "status expiresAt leadToken email revisionsBeforePayUsed revisionsAfterPayUsed revisingAt revisionLog"
    )
    .lean();

  if (!preview || isPreviewExpired(preview)) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const purchased = await isPreviewPurchased({
    leadToken: preview.leadToken,
    previewSlug: slug,
    email: preview.email,
  });
  const quota = snapshotRevisionQuota({
    purchased,
    revisionsBeforePayUsed: preview.revisionsBeforePayUsed,
    revisionsAfterPayUsed: preview.revisionsAfterPayUsed,
  });

  const last = Array.isArray(preview.revisionLog)
    ? preview.revisionLog[preview.revisionLog.length - 1]
    : null;

  return NextResponse.json(
    {
      ...quota,
      revising: Boolean(
        preview.revisingAt &&
          Date.now() - new Date(preview.revisingAt).getTime() < REVISE_LOCK_MS
      ),
      lastRevision: last
        ? {
            at: last.at,
            phase: last.phase,
            targets: last.targets || [],
            note: last.note || "",
            pagesUpdated: last.pagesUpdated || [],
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const slug = (params.slug || "").trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  if (!rateLimitIp(clientIp(req))) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many revisions. Try again later." } },
      { status: 429 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const targets = Array.isArray(body.targets)
    ? body.targets
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 800) : "";
  const focusPage = parseFocusPage(body.page);

  if (!targets.length && !note) {
    return NextResponse.json(
      {
        error: {
          code: "empty_request",
          message: "Pick at least one change or add a short note.",
        },
      },
      { status: 400 }
    );
  }

  if (isCustomBuildOnlyRequest(targets, note)) {
    return NextResponse.json(
      {
        error: {
          code: "custom_build_only",
          message:
            "That’s part of your custom build after you claim — it won’t use an AI revision.",
        },
      },
      { status: 400 }
    );
  }

  return ndjsonResponse(async (send) => {
    await dbConnect();
    const preview = await Preview.findOne({ slug });
    if (!preview || isPreviewExpired(preview)) {
      send({
        type: "error",
        code: "not_found",
        message: "This demo is unavailable.",
      });
      return;
    }

    if (preview.status !== "ready" || !previewPagesComplete(preview.pages)) {
      send({
        type: "error",
        code: "not_ready",
        message: "This demo isn’t ready to revise yet.",
      });
      return;
    }

    if (
      preview.revisingAt &&
      Date.now() - new Date(preview.revisingAt).getTime() < REVISE_LOCK_MS
    ) {
      send({
        type: "error",
        code: "busy",
        message: "A revision is already in progress for this demo.",
      });
      return;
    }

    const purchased = await isPreviewPurchased({
      leadToken: preview.leadToken,
      previewSlug: slug,
      email: preview.email,
    });
    const quota = snapshotRevisionQuota({
      purchased,
      revisionsBeforePayUsed: preview.revisionsBeforePayUsed,
      revisionsAfterPayUsed: preview.revisionsAfterPayUsed,
    });

    if (quota.remaining <= 0) {
      send({
        type: "error",
        code: "quota_exceeded",
        message: purchased
          ? "Quick AI polish is used up — a real person takes over next and revises with you until you’re happy."
          : "Free AI demo revisions are used. Claim for 2 more AI + unlimited human revisions.",
      });
      return;
    }

    const scope = inferRevisionScope(targets, note, focusPage);
    const pagesToUpdate = pagesForScope(
      scope,
      focusPage === "all" ? "home" : focusPage
    );

    preview.revisingAt = new Date();
    await preview.save();

    try {
      send(
        reviseProgressEvent({
          stageKey: "reading",
          message: "Reading your feedback",
          percent: 4,
        })
      );

      const siteSpec = preview.siteSpec || null;
      const businessHint =
        siteSpec?.business?.name || preview.email || slug;

      const result = await revisePreviewPages({
        pages: {
          home: preview.pages!.home,
          services: preview.pages!.services,
          about: preview.pages!.about,
        },
        pagesToUpdate,
        targets,
        note,
        businessHint,
        siteSpec,
        onProgress: (payload) => send(reviseProgressEvent(payload)),
      });

      preview.pages = result.pages;
      if (quota.phase === "post") {
        preview.revisionsAfterPayUsed = (preview.revisionsAfterPayUsed || 0) + 1;
      } else {
        preview.revisionsBeforePayUsed =
          (preview.revisionsBeforePayUsed || 0) + 1;
      }
      preview.revisionLog = [
        ...(preview.revisionLog || []),
        {
          at: new Date(),
          phase: quota.phase,
          targets,
          note,
          pagesUpdated: result.updated,
        },
      ].slice(-20);
      preview.revisingAt = null;
      preview.generation = {
        engine: "openai-html-revise",
        model: result.model,
      };
      await preview.save();

      const nextQuota = snapshotRevisionQuota({
        purchased,
        revisionsBeforePayUsed: preview.revisionsBeforePayUsed,
        revisionsAfterPayUsed: preview.revisionsAfterPayUsed,
      });

      send({
        type: "done",
        ok: true,
        pagesUpdated: result.updated,
        revisionsRemaining: nextQuota.remaining,
        phase: nextQuota.phase,
        purchased,
        percent: 100,
      });
    } catch (error) {
      preview.revisingAt = null;
      await preview.save().catch(() => undefined);
      throw error;
    }
  });
}
