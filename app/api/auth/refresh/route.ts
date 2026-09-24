// src/app/api/auth/refresh/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import RefreshToken from "@/models/RefreshToken";
import User from "@/models/User";

import { connectDB } from "@/lib/db";

import {
  createAccessToken,
  verifyRefreshToken,
} from "@/lib/jwt";

import { setAccessCookie } from "@/lib/cookies";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    verifyRefreshToken(token);

    const exists =
      await RefreshToken.findOne({
        token,
        revoked: false,
      });

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      await User.findById(exists.user);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      createAccessToken(
        user._id.toString(),
        user.role
      );

    await setAccessCookie(accessToken);

    return NextResponse.json({
      success: true,
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