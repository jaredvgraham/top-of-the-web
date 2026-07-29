import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Website from "@/models/WebsiteModel";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid website id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    await dbConnect();

    const $set: Record<string, string> = {};

    for (const field of ["name", "url", "description", "pack", "plan"] as const) {
      if (typeof body[field] === "string") {
        $set[field] = body[field].trim();
      }
    }

    if (typeof body.email === "string" && body.email.trim()) {
      $set.email = body.email.trim().toLowerCase();
    }

    if (!Object.keys($set).length) {
      return NextResponse.json(
        { error: "No website fields to update" },
        { status: 400 }
      );
    }

    const website = await Website.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true }
    );

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    let customer = null;
    let order = null;
    const email = (website.email || "").toLowerCase();

    if (email) {
      try {
        customer = await Customer.findOne({ email });
        if (customer && typeof body.phone === "string") {
          customer.phone = body.phone.trim();
          await customer.save();
        }
      } catch (customerError) {
        console.error("[admin] website update: customer save failed", customerError);
      }

      try {
        order = await Order.findOne({ email });
        if (order) {
          let orderDirty = false;
          if (typeof body.progress === "number" && !Number.isNaN(body.progress)) {
            order.progress = Math.min(100, Math.max(0, body.progress));
            orderDirty = true;
          }
          if (typeof body.pack === "string") {
            order.pack = body.pack.trim() || order.pack;
            orderDirty = true;
          }
          if (typeof body.plan === "string") {
            order.plan = body.plan.trim() || order.plan;
            orderDirty = true;
          }
          if (typeof body.phone === "string" && body.phone.trim()) {
            order.phone = body.phone.trim();
            orderDirty = true;
          }
          if (orderDirty) await order.save();
        }
      } catch (orderError) {
        console.error("[admin] website update: order save failed", orderError);
      }
    }

    return NextResponse.json({
      website: {
        id: String(website._id),
        name: website.name || "",
        email: website.email || "",
        url: website.url || "",
        description: website.description || "",
        pack: website.pack || "",
        plan: website.plan || "",
        createdAt: website.createdAt,
        customer: customer
          ? {
              id: String(customer._id),
              email: customer.email,
              phone: customer.phone || "",
              customerId: customer.customerId,
            }
          : null,
        order: order
          ? {
              id: String(order._id),
              progress: order.progress ?? 0,
              pack: order.pack,
              plan: order.plan,
              success: order.success,
              phone: order.phone || "",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to update website:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update website";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
