import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User from "@/models/UserModel";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password, firstName } = await req.json();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    let role = "user";

    // Check if the provided email and password match the admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      role = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      firstName,
      createdAt: new Date(),
    });

    await newUser.save();

    // Log after saving to ensure it was successful
    console.log("User saved successfully:", newUser);

    return NextResponse.json(
      { success: true, message: "User created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during user creation:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
