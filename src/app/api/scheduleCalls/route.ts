import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import ScheduledCall from "@/models/ScheduledCall";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  await dbConnect();

  const scheduledCalls = await ScheduledCall.find({});

  return NextResponse.json(scheduledCalls, { status: 200 });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const { start, end, title, email } = await req.json();

  const customer = await Customer.findOne({ email });

  const phone = customer?.phone;

  if (!phone) {
    return NextResponse.json({
      message: "Phone number not found",
      status: 400,
    });
  }

  const scheduledCall = new ScheduledCall({
    start: new Date(start),
    end: new Date(end),
    email,
    phone,
    title,
  });

  await scheduledCall.save();

  const emailSent = await sendEmail(
    email,
    phone,
    new Date(start),
    new Date(end)
  );

  if (!emailSent) {
    return NextResponse.json({
      message: "Error sending email",
      status: 500,
    });
  }

  return NextResponse.json(scheduledCall, { status: 201 });
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(email: string, phone: string, start: Date, end: Date) {
  try {
    const textMessage = `Scheduled Call:\nEmail: ${email}\nPhone: ${phone}\nStart Time: ${start}\nEnd Time: ${end}`;

    console.log(textMessage);

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "Scheduled Call",
      text: textMessage,
      html: `<p>${textMessage.replace(/\n/g, "<br>")}</p>`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error);
    return false;
  }
}
