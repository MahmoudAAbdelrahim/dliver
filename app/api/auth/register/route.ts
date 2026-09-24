// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { RegisterSchema } from "@/validations/register";
import { hashPassword } from "@/lib/bcrypt";
import { ZodError } from "zod";

import {
  createAccessToken,
  createRefreshToken,
} from "@/lib/jwt";

import RefreshToken from "@/models/RefreshToken";

import {
  setAccessCookie,
  setRefreshCookie,
} from "@/lib/cookies";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const data = RegisterSchema.parse(body);

    const email = data.email.toLowerCase().trim();

    const phone = data.phone.trim();

    const emailExists = await User.findOne({
      email,
    });

    if (emailExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const phoneExists = await User.findOne({
      phone,
    });

    if (phoneExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const password = await hashPassword(
      data.password
    );

const usersCount = await User.countDocuments();

const role =
  usersCount === 0
    ? "admin"
    : "customer";

    const user = await User.create({
  fullName: data.fullName,
  email,
  phone,
  password,

  role,

  driverStatus: "none",

  isVerified: true,

  isBlocked: false,
});

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
});

await setAccessCookie(accessToken);
await setRefreshCookie(refreshToken);

return NextResponse.json(
  {
    success: true,

    message: "Account created successfully.",

    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      driverStatus: user.driverStatus,
    },
  },
  {
    status: 201,
  }
);


  } catch (error) {

    if (error instanceof ZodError) {

        return NextResponse.json(
            {
                success: false,
                errors: error.flatten().fieldErrors,
            },
            {
                status: 400,
            }
        );

    }

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