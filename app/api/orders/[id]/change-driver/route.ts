import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import OrderChangeRequest from "@/models/OrderChangeRequest";

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
      await req.json();

    const reason =
      String(
        body.reason || ""
      ).trim();

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          message:
            "اكتب سبب تغيير المندوب.",
        },
        { status: 400 }
      );
    }

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
      "pending_driver",
      "driver_accepted",
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
            "لا يمكن طلب تغيير المندوب في حالة الطلب الحالية.",
        },
        { status: 400 }
      );
    }

    const existing =
      await OrderChangeRequest.findOne({
        order: order._id,
        customer: userId,
        type: "driver",
        status: "pending",
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لديك طلب تغيير مندوب قيد المراجعة بالفعل.",
        },
        { status: 400 }
      );
    }

    await OrderChangeRequest.create({
      order: order._id,
      customer: userId,
      type: "driver",
      oldValue:
        order.driver
          ? String(order.driver)
          : "",
      newValue: "",
      reason,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message:
        "تم إرسال طلب تغيير المندوب إلى الإدارة.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER DRIVER CHANGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء طلب تغيير المندوب.",
      },
      { status: 500 }
    );
  }
}