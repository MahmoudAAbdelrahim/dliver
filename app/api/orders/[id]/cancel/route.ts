import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserId() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) return null;

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

export async function POST(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

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
            "معرف الطلب غير صالح.",
        },
        { status: 400 }
      );
    }

    const body =
      await req.json().catch(
        () => ({})
      );

    const order =
      await Order.findOne({
        _id: id,
        customer: userId,
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الطلب غير موجود.",
        },
        { status: 404 }
      );
    }

    const allowedStatuses = [
      "pending_admin",
      "pending_driver",
      "driver_rejected",
      "driver_timeout",
    ];

    if (
      !allowedStatuses.includes(
        order.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لا يمكن إلغاء الطلب في حالته الحالية.",
        },
        { status: 400 }
      );
    }

    order.status = "cancelled";

    order.cancelledAt =
      new Date();

    order.cancellationReason =
      body.reason?.trim() ||
      "تم إلغاء الطلب من العميل.";

    await order.save();

    return NextResponse.json({
      success: true,
      message:
        "تم إلغاء الطلب بنجاح.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER CANCEL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إلغاء الطلب.",
      },
      { status: 500 }
    );
  }
}