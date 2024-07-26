import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let role = "user";
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      role = "admin";
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, message: "User created" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
