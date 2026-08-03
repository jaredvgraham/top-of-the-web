import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Preview from "@/models/Preview";
import Website from "@/models/WebsiteModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const [previews, orders, websites] = await Promise.all([
      Preview.find()
        .sort({ createdAt: -1 })
        .select("-pages -siteSpec")
        .lean(),
      Order.find().sort({ createdAt: -1 }).lean(),
      Website.find().select("email name url pack plan").lean(),
    ]);

    const paidEmails = new Set<string>();
    const orderByEmail = new Map<string, (typeof orders)[number]>();
    for (const order of orders) {
      const key = order.email?.toLowerCase();
      if (!key) continue;
      if (!orderByEmail.has(key)) orderByEmail.set(key, order);
      if (order.success) paidEmails.add(key);
    }

    const websiteByEmail = new Map<string, (typeof websites)[number]>();
    for (const site of websites) {
      const key = site.email?.toLowerCase();
      if (!key) continue;
      if (!websiteByEmail.has(key)) websiteByEmail.set(key, site);
      paidEmails.add(key);
    }

    const data = previews.map((doc) => {
      const email = (doc.email || "").toLowerCase();
      const order = orderByEmail.get(email);
      const website = websiteByEmail.get(email);
      const paid = paidEmails.has(email);
      const downloadable = doc.status === "ready";

      return {
        id: String(doc._id),
        slug: doc.slug,
        email: doc.email || "",
        status: doc.status,
        facebookUrl: doc.source?.url || "",
        onboardingToken: doc.onboardingToken || "",
        leadToken: doc.leadToken || "",
        generation: doc.generation || null,
        error: doc.error?.code
          ? { code: doc.error.code, message: doc.error.message || "" }
          : null,
        revisionsBeforePayUsed: Number(doc.revisionsBeforePayUsed) || 0,
        revisionsAfterPayUsed: Number(doc.revisionsAfterPayUsed) || 0,
        revisionLog: Array.isArray(doc.revisionLog)
          ? doc.revisionLog.map((entry) => ({
              at: entry.at,
              phase: entry.phase,
              targets: entry.targets || [],
              note: entry.note || "",
              pagesUpdated: entry.pagesUpdated || [],
            }))
          : [],
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        downloadable,
        paid,
        payment: {
          paid,
          orderSuccess: Boolean(order?.success),
          hasWebsite: Boolean(website),
          pack: order?.pack || website?.pack || "",
          plan: order?.plan || website?.plan || "",
          websiteName: website?.name || "",
          websiteUrl: website?.url || "",
        },
      };
    });

    return NextResponse.json(
      { previews: data },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[admin] list previews failed", error);
    return NextResponse.json(
      { error: "Failed to load preview generations" },
      { status: 500 }
    );
  }
}
