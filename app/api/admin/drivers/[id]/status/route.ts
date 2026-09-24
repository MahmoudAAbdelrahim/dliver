import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload: any =
      verifyAccessToken(token);

    if (payload?.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  context: Context
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "غير مصرح لك بالوصول.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "معرف المندوب غير صالح.",
        },
        { status: 400 }
      );
    }

    const body =
      await req.json();

    const action =
      String(
        body?.action || ""
      );

    if (
      action !== "suspend" &&
      action !== "activate"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الإجراء غير صحيح.",
        },
        { status: 400 }
      );
    }

    const driver =
      await User.findOne({
        _id: id,
        role: "driver",
        deletedAt: null,
      });

    if (!driver) {
      return NextResponse.json(
        {
          success: false,
          message:
            "المندوب غير موجود.",
        },
        { status: 404 }
      );
    }

    // =========================
    // SUSPEND
    // =========================

    if (
      action === "suspend"
    ) {
      if (
        driver.driverStatus ===
        "suspended"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "حساب المندوب موقوف بالفعل.",
          },
          { status: 400 }
        );
      }

      driver.driverStatus =
        "suspended";

      // إلغاء الجلسة الحالية
      driver.refreshToken =
        "";

      await driver.save();

      return NextResponse.json({
        success: true,
        message:
          "تم إيقاف حساب المندوب مؤقتًا.",
        driverStatus:
          driver.driverStatus,
      });
    }

    // =========================
    // ACTIVATE
    // =========================

    if (
      action === "activate"
    ) {
      if (
        driver.driverStatus !==
        "suspended"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "المندوب ليس موقوفًا.",
          },
          { status: 400 }
        );
      }

      driver.driverStatus =
        "approved";

      await driver.save();

      return NextResponse.json({
        success: true,
        message:
          "تمت إعادة تفعيل حساب المندوب.",
        driverStatus:
          driver.driverStatus,
      });
    }
  } catch (error) {
    console.error(
      "ADMIN DRIVER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحديث حالة المندوب.",
      },
      { status: 500 }
    );
  }
}