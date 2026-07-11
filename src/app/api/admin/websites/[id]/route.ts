import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Website from "@/models/WebsiteModel";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

type RouteContext = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid website id" }, { status: 400 });
    }

    const body = await req.json();
    await dbConnect();

    const website = await Website.findById(id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteFields = ["name", "url", "description", "pack", "plan"] as const;
    for (const field of websiteFields) {
      if (typeof body[field] === "string") {
        website[field] = body[field].trim();
      }
    }

    if (typeof body.email === "string" && body.email.trim()) {
      website.email = body.email.trim().toLowerCase();
    }

    await website.save();

    let customer = null;
    if (website.email) {
      customer = await Customer.findOne({ email: website.email });
      if (customer && typeof body.phone === "string") {
        customer.phone = body.phone.trim();
        await customer.save();
      }
    }

    let order = null;
    if (website.email) {
      order = await Order.findOne({ email: website.email });
      if (order) {
        if (typeof body.progress === "number" && !Number.isNaN(body.progress)) {
          order.progress = Math.min(100, Math.max(0, body.progress));
        }
        if (typeof body.orderPack === "string") {
          order.pack = body.orderPack.trim();
        }
        if (typeof body.orderPlan === "string") {
          order.plan = body.orderPlan.trim();
        }
        await order.save();
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
    return NextResponse.json(
      { error: "Failed to update website" },
      { status: 500 }
    );
  }
}
