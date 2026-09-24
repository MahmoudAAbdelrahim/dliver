import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 401 }
      );
    }

    let payload: any;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "جلسة الدخول غير صالحة.",
        },
        { status: 401 }
      );
    }

    if (payload?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "ليس لديك صلاحية.",
        },
        { status: 403 }
      );
    }

    const drivers = await User.find({
      role: "driver",
      driverStatus: "approved",
      isBlocked: false,
      deletedAt: null,
    })
      .select(
        "_id fullName phone avatar address city driverStatus"
      )
      .sort({ fullName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error("GET DRIVERS ERROR:", error);

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