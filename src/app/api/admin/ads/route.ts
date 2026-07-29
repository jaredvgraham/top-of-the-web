import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import {
  loadMetaAdsDashboard,
  metaAdsConfigured,
  type MetaDatePreset,
  type MetaInsightLevel,
} from "@/lib/metaAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATE_PRESETS: MetaDatePreset[] = [
  "today",
  "yesterday",
  "last_7d_incl_today",
  "last_7d",
  "last_14d",
  "last_28d",
  "last_30d",
  "this_month",
  "last_month",
];

const LEVELS: MetaInsightLevel[] = ["campaign", "adset", "ad", "account"];

/**
 * Convert a YYYY-MM-DD calendar day in `timeZone` to a UTC Date at start or end of that day.
 */
function ymdBoundInTimeZone(
  ymd: string,
  timeZone: string,
  endOfDay: boolean
): Date | null {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;

  const hour = endOfDay ? 23 : 0;
  const minute = endOfDay ? 59 : 0;
  const second = endOfDay ? 59 : 0;
  const ms = endOfDay ? 999 : 0;

  let utc = Date.UTC(y, m - 1, d, hour, minute, second, ms);
  const tz = timeZone || "UTC";

  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utc));

    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value || "0");

    const localAsUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second")
    );
    const targetAsUtc = Date.UTC(y, m - 1, d, hour, minute, second);
    utc += targetAsUtc - localAsUtc;
  }

  const out = new Date(utc);
  if (endOfDay) out.setUTCMilliseconds(ms);
  return out;
}

function rangeFromMetaDates(
  dateStart: string,
  dateStop: string,
  timeZone: string
) {
  if (!dateStart || !dateStop) return null;
  const since = ymdBoundInTimeZone(dateStart, timeZone, false);
  const until = ymdBoundInTimeZone(dateStop, timeZone, true);
  if (
    !since ||
    !until ||
    Number.isNaN(since.getTime()) ||
    Number.isNaN(until.getTime())
  ) {
    return null;
  }
  return { since, until };
}

export async function GET(req: NextRequest) {
  try {
    if (!metaAdsConfigured()) {
      return NextResponse.json(
        {
          error:
            "FB_AD_TOKEN is not configured. Add it to env to load Ads Manager data.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const { searchParams } = req.nextUrl;
    const datePresetRaw =
      searchParams.get("datePreset") || "last_7d_incl_today";
    const levelRaw = searchParams.get("level") || "campaign";
    const accountId = searchParams.get("accountId") || undefined;

    const datePreset = DATE_PRESETS.includes(datePresetRaw as MetaDatePreset)
      ? (datePresetRaw as MetaDatePreset)
      : "last_7d_incl_today";
    const level = LEVELS.includes(levelRaw as MetaInsightLevel)
      ? (levelRaw as MetaInsightLevel)
      : "campaign";

    const dashboard = await loadMetaAdsDashboard({
      accountId,
      datePreset,
      level,
    });

    await dbConnect();
    const range = rangeFromMetaDates(
      dashboard.dateStart,
      dashboard.dateStop,
      dashboard.account.timezone || "America/New_York"
    );
    let siteLeads = 0;
    let sitePurchased = 0;
    let siteWithFbclid = 0;
    let leads: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      businessName: string;
      city: string;
      state: string;
      status: string;
      previewSlug: string;
      facebookUrl: string;
      createdAt: string;
      updatedAt: string;
      attribution: {
        fbclid: string;
        fbp: string;
        fbc: string;
        landingUrl: string;
        utmSource: string;
        utmMedium: string;
        utmCampaign: string;
        utmContent: string;
        utmTerm: string;
      };
    }> = [];

    if (range) {
      const createdAt = { $gte: range.since, $lte: range.until };
      const [leadCount, purchasedCount, fbclidCount, leadDocs] =
        await Promise.all([
          Lead.countDocuments({ createdAt }),
          Lead.countDocuments({ createdAt, status: "purchased" }),
          Lead.countDocuments({
            createdAt,
            "attribution.fbclid": { $exists: true, $nin: ["", null] },
          }),
          Lead.find({ createdAt })
            .sort({ createdAt: -1 })
            .limit(200)
            .select(
              "name email phone businessName city state status previewSlug facebookUrl attribution createdAt updatedAt"
            )
            .lean(),
        ]);

      siteLeads = leadCount;
      sitePurchased = purchasedCount;
      siteWithFbclid = fbclidCount;
      leads = leadDocs.map((doc) => {
        const attr = (doc.attribution || {}) as Record<string, string>;
        return {
          id: String(doc._id),
          name: doc.name || "",
          email: doc.email || "",
          phone: doc.phone || "",
          businessName: doc.businessName || "",
          city: doc.city || "",
          state: doc.state || "",
          status: doc.status || "captured",
          previewSlug: doc.previewSlug || "",
          facebookUrl: doc.facebookUrl || "",
          createdAt:
            doc.createdAt instanceof Date
              ? doc.createdAt.toISOString()
              : String(doc.createdAt || ""),
          updatedAt:
            doc.updatedAt instanceof Date
              ? doc.updatedAt.toISOString()
              : String(doc.updatedAt || ""),
          attribution: {
            fbclid: attr.fbclid || "",
            fbp: attr.fbp || "",
            fbc: attr.fbc || "",
            landingUrl: attr.landingUrl || "",
            utmSource: attr.utmSource || "",
            utmMedium: attr.utmMedium || "",
            utmCampaign: attr.utmCampaign || "",
            utmContent: attr.utmContent || "",
            utmTerm: attr.utmTerm || "",
          },
        };
      });
    }

    return NextResponse.json(
      {
        configured: true,
        ...dashboard,
        siteFunnel: {
          dateStart: dashboard.dateStart,
          dateStop: dashboard.dateStop,
          leads: siteLeads,
          withFbclid: siteWithFbclid,
          purchased: sitePurchased,
        },
        leads,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] ads dashboard failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to load Meta ads data";
    return NextResponse.json(
      { error: message, configured: true },
      { status: 500 }
    );
  }
}
