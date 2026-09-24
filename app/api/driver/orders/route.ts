import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import User from "@/models/User";

export const runtime = "nodejs";

async function getDriverId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payload: any =
      verifyAccessToken(token);

    if (payload?.role !== "driver") {
      return null;
    }

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

    // تسجيل User قبل populate
    void User;

    const driverId =
      await getDriverId();

    if (!driverId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "غير مصرح أو الحساب ليس حساب مندوب.",
        },
        { status: 403 }
      );
    }

    const driver =
      await User.findOne({
        _id: driverId,
        role: "driver",
        driverStatus: "approved",
        isBlocked: false,
      }).select("_id");

    if (!driver) {
      return NextResponse.json(
        {
          success: false,
          message:
            "حساب المندوب غير متاح.",
        },
        { status: 403 }
      );
    }

    const orders =
      await Order.find({
        driver: driverId,
      })
        .populate(
          "customer",
          "fullName email phone avatar"
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
      "DRIVER ORDERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل طلبات المندوب.",
      },
      { status: 500 }
    );
  }
}