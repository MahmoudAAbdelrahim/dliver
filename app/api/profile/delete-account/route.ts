import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "انتهت جلسة الدخول، يرجى تسجيل الدخول مرة أخرى.",
        },
        { status: 401 }
      );
    }

    let payload: {
      id: string;
      role: string;
    };

    try {
      payload = verifyAccessToken(token) as {
        id: string;
        role: string;
      };
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

    if (!payload?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك.",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(
      payload.id
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "الحساب غير موجود.",
        },
        { status: 404 }
      );
    }

    // Soft Delete
    user.deletedAt = new Date();

    // منع الحساب من الاستخدام
    user.isBlocked = true;

    await user.save();

    // حذف الجلسة
    const response =
      NextResponse.json(
        {
          success: true,
          message:
            "تم حذف الحساب بنجاح.",
        },
        { status: 200 }
      );

    response.cookies.delete(
      "accessToken"
    );

    response.cookies.delete(
      "refreshToken"
    );

    return response;

  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء حذف الحساب.",
      },
      { status: 500 }
    );
  }
}