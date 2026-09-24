import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const payload: any =
      verifyAccessToken(token);

    const user =
      await User.findById(payload.id)
        .select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      }
    );
  }
}