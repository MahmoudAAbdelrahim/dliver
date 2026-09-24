import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

export const runtime = "nodejs";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload: any =
      verifyAccessToken(token);

    const userId =
      payload?.userId ||
      payload?.id ||
      payload?.sub;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return null;
    }

    const user =
      await User.findById(userId).select(
        "_id role driverStatus isBlocked deletedAt"
      );

    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    // المسموح لهم باختيار مندوب:
    // العميل + الإدارة
    if (
      user.role !== "customer" &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ليس لديك صلاحية لعرض المندوبين.",
        },
        { status: 403 }
      );
    }

    const drivers =
      await User.find({
        role: "driver",
        driverStatus: "approved",
        isBlocked: false,
        deletedAt: null,
      })
        .select(
          "_id fullName phone avatar address city driverStatus"
        )
        .sort({
          fullName: 1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error(
      "ORDERS DRIVERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل المندوبين.",
      },
      { status: 500 }
    );
  }
}