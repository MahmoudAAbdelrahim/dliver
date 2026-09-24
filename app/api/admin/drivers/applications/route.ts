// app/api/admin/drivers/applications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import DriverApplication from "@/models/DriverApplication";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "يجب تسجيل الدخول." },
        { status: 401 }
      );
    }

    let payload: any;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "جلسة الدخول غير صالحة." },
        { status: 401 }
      );
    }

    if (payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "غير مصرح لك." },
        { status: 403 }
      );
    }

    const applications = await DriverApplication.find({})
      .populate({
        path: "user",
        select:
          "_id fullName email phone avatar role driverStatus address city",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        applications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN DRIVER APPLICATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل طلبات المندوبين.",
      },
      { status: 500 }
    );
  }
}