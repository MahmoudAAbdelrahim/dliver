// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import RefreshToken from "@/models/RefreshToken";

import { LoginSchema } from "@/validations/login";
import { comparePassword } from "@/lib/bcrypt";

import {
  createAccessToken,
  createRefreshToken,
} from "@/lib/jwt";

import {
  setAccessCookie,
  setRefreshCookie,
} from "@/lib/cookies";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const data = LoginSchema.parse(body);

    const user = await User.findOne({
      email: data.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been blocked.",
        },
        {
          status: 403,
        }
      );
    }

    const match = await comparePassword(
      data.password,
      user.password
    );

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken = createAccessToken(
      user._id.toString(),
      user.role
    );

    const refreshToken = createRefreshToken(
      user._id.toString()
    );

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ),
      userAgent:
        req.headers.get("user-agent") ?? "",

      ipAddress:
        req.headers.get("x-forwarded-for") ?? "",
    });

    user.lastLogin = new Date();

    await user.save();

    await setAccessCookie(accessToken);

    await setRefreshCookie(refreshToken);

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar ?? "",
        role: user.role,
        driverStatus: user.driverStatus,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}