import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";
import authMiddleware from "@/middleware/auth";
import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html: `<p>${text.replace(/\n/g, "<br>")}</p>`,
  };

  await transporter.sendMail(mailOptions);
};

const handlerPost = async (req: NextRequest, res: NextResponse) => {
  await dbConnect();

  try {
    const { subject, message } = await req.json();

    // Fetch emails and names
    const users = await User.find(
      { role: { $ne: "admin" } },
      { email: 1, firstName: 1 }
    );

    // Iterate over users and send personalized emails
    for (const user of users) {
      const personalizedMessage = `${user.firstName},\n\n${message}`;
      await sendEmail(user.email, subject, personalizedMessage);
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = authMiddleware(handlerPost);
