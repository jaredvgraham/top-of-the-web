import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { text } from "stream/consumers";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { name, email, phone, inquiry } = await req.json();
    const textMessage = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nInquiry: ${inquiry}`;

    console.log(textMessage);

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Inquiry",
      text: textMessage,
      html: `<p>${textMessage.replace(/\n/g, "<br>")}</p>`,
    };
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Success", status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Error", status: error.status || 500 });
  }
}
