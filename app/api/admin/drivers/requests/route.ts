import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest
) {
  try {
    await connectDB();

    const cookieStore =
      await cookies();

    const token =
      cookieStore
        .get("accessToken")
        ?.value;

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
      payload =
        verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "جلسة الدخول غير صالحة.",
        },
        { status: 401 }
      );
    }

    if (
      payload?.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ليس لديك صلاحية.",
        },
        { status: 403 }
      );
    }

    const requests =
      await User.find({
        driverStatus: {
          $in: [
            "pending",
            "approved",
            "rejected",
            "suspended",
          ],
        },
        deletedAt: null,
      })
        .select(
          "-password -refreshToken"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    console.log(
      "DRIVER RECORDS COUNT:",
      requests.length
    );

    console.log(
      "DRIVER RECORDS:",
      requests.map(
        (item: any) => ({
          id: item._id,
          name: item.fullName,
          role: item.role,
          driverStatus:
            item.driverStatus,
        })
      )
    );

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "ADMIN DRIVER REQUESTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل بيانات المندوبين.",
      },
      { status: 500 }
    );
  }
}