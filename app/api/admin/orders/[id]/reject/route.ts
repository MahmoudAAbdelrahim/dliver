import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import Order from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

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
          message: "جلسة غير صالحة.",
        },
        { status: 401 }
      );
    }

    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "ليس لديك صلاحية.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الطلب غير صحيح.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود.",
        },
        { status: 404 }
      );
    }

    if (order.status !== "pending_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكن رفض هذا الطلب الآن.",
        },
        { status: 409 }
      );
    }

    order.status = "admin_rejected";
    order.cancelledAt = new Date();
    order.cancellationReason =
      body.reason || "تم رفض الطلب من الإدارة.";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "تم رفض الطلب.",
      order: {
        _id: order._id,
        status: order.status,
        cancellationReason:
          order.cancellationReason,
      },
    });
  } catch (error) {
    console.error("REJECT ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء رفض الطلب.",
      },
      { status: 500 }
    );
  }
}