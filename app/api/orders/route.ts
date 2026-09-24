import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import User from "@/models/User";

async function getUserId() {
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

    return userId;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest
) {
  try {
    await connectDB();

    // مهم لتسجيل User model قبل populate
    void User;

    const userId =
      await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    const orders =
      await Order.find({
        customer: userId,
      })
        .populate(
          "driver",
          "fullName phone avatar city address driverStatus"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "CUSTOMER ORDERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل الطلبات.",
      },
      { status: 500 }
    );
  }
}