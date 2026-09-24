import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import User from "@/models/User";

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

    const driverId = body.driverId;

    if (!driverId || !Types.ObjectId.isValid(driverId)) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب اختيار مندوب.",
        },
        { status: 400 }
      );
    }

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
          message: "لا يمكن معالجة هذا الطلب الآن.",
        },
        { status: 409 }
      );
    }

    const driver = await User.findOne({
      _id: driverId,
      role: "driver",
      driverStatus: "approved",
      isBlocked: false,
    }).select("_id fullName");

    if (!driver) {
      return NextResponse.json(
        {
          success: false,
          message: "المندوب غير متاح.",
        },
        { status: 400 }
      );
    }

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    order.driver = driver._id;
    order.status = "pending_driver";
    order.driverResponseExpiresAt = expiresAt;

    order.adminNotes =
      body.adminNotes || order.adminNotes || "";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "تمت الموافقة وإرسال الطلب للمندوب.",
      order: {
        _id: order._id,
        status: order.status,
        driver: driver._id,
        driverName: driver.fullName,
        driverResponseExpiresAt:
          order.driverResponseExpiresAt,
      },
    });
  } catch (error) {
    console.error("APPROVE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء الموافقة على الطلب.",
      },
      { status: 500 }
    );
  }
}