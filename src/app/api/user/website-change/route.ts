import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { text } from "stream/consumers";
import Customer from "@/models/Customer";

import authMiddleware from "@/middleware/auth";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function handler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const { section, change } = await req.json();
    const customer = await Customer.findOne({ email: user.email });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
    const phone = customer.phone;
    const textMessage = `Email: ${user.email}\n Name: ${user.firstName}\nPhone: ${phone}\nSection: ${section}\nWhat to Change: ${change}`;
    const mailOptions = {
      from: process.env.Email,
      to: process.env.Email,
      subject: "CHANGE REQUESTED",
      text: textMessage,
      html: `<p>${textMessage.replace(/\n/g, "<br>")}</p>`,
    };
    await transport.sendMail(mailOptions);
    return NextResponse.json({ message: "Success", status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Error", status: error.status || 500 });
  }
}

export const POST = authMiddleware(handler);
