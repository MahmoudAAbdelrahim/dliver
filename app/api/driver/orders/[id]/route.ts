import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import User from "@/models/User";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

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

async function getValidDriver(
  driverId: string
) {
  return User.findOne({
    _id: driverId,
    role: "driver",
    driverStatus: "approved",
    isBlocked: false,
  }).select(
    "_id fullName phone avatar city address driverStatus"
  );
}

export async function GET(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    void User;

    const driverId =
      await getDriverId();

    if (!driverId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 403 }
      );
    }

    const driver =
      await getValidDriver(
        driverId
      );

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

    const order =
      await Order.findOne({
        _id: id,
        driver: driverId,
      })
        .populate(
          "customer",
          "fullName email phone avatar"
        )
        .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الطلب غير موجود أو غير مسند إليك.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "DRIVER ORDER GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل الطلب.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const driverId =
      await getDriverId();

    if (!driverId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 403 }
      );
    }

    const driver =
      await getValidDriver(
        driverId
      );

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

    const action =
      String(
        body.action || ""
      );

    const reason =
      String(
        body.reason || ""
      ).trim();

    const order =
      await Order.findOne({
        _id: id,
        driver: driverId,
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الطلب غير موجود أو غير مسند إليك.",
        },
        { status: 404 }
      );
    }

    // =========================
    // CANCELLED
    // =========================

    if (
      order.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "تم إلغاء الطلب بالفعل ولا يمكن تنفيذ أي إجراء عليه.",
        },
        { status: 400 }
      );
    }

    // =========================
    // ACCEPT
    // =========================

    if (
      action === "accept"
    ) {
      if (
        order.status !==
        "pending_driver"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "لا يمكن قبول الطلب في حالته الحالية.",
          },
          { status: 400 }
        );
      }

      if (
        order.driverResponseExpiresAt &&
        new Date(
          order.driverResponseExpiresAt
        ).getTime() <= Date.now()
      ) {
        order.status =
          "driver_timeout";

        await order.save();

        return NextResponse.json(
          {
            success: false,
            message:
              "انتهى وقت الرد على هذا الطلب.",
          },
          { status: 400 }
        );
      }

      order.status =
        "driver_accepted";

      order.driverAcceptedAt =
        new Date();

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تم قبول الطلب.",
        order,
      });
    }

    // =========================
    // REJECT
    // =========================

    if (
      action === "reject"
    ) {
      if (
        order.status !==
        "pending_driver"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "لا يمكن رفض الطلب في حالته الحالية.",
          },
          { status: 400 }
        );
      }

      if (!reason) {
        return NextResponse.json(
          {
            success: false,
            message:
              "اكتب سبب رفض الطلب.",
          },
          { status: 400 }
        );
      }

      if (reason.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message:
              "سبب الرفض طويل جدًا.",
          },
          { status: 400 }
        );
      }

      order.status =
        "driver_rejected";

      order.driverRejectionReason =
        reason;

      order.driverRejectedAt =
        new Date();

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تم رفض الطلب.",
        order,
      });
    }

    // =========================
    // PICK UP
    // =========================

    if (
      action === "pickup"
    ) {
      if (
        order.status !==
        "driver_accepted"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "يجب قبول الطلب أولاً.",
          },
          { status: 400 }
        );
      }

      order.status =
        "picked_up";

      order.pickedUpAt =
        new Date();

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تم تسجيل استلام الشحنة.",
        order,
      });
    }

    // =========================
    // ON THE WAY
    // =========================

    if (
      action === "on_the_way"
    ) {
      if (
        order.status !==
        "picked_up"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "يجب تسجيل استلام الشحنة أولاً.",
          },
          { status: 400 }
        );
      }

      order.status =
        "on_the_way";

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تم تحديث حالة الطلب إلى في الطريق.",
        order,
      });
    }

    // =========================
    // DELIVERED
    // =========================

    if (
      action === "delivered"
    ) {
      if (
        order.status !==
        "on_the_way"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "يجب أن يكون الطلب في الطريق أولاً.",
          },
          { status: 400 }
        );
      }

      order.status =
        "delivered";

      order.deliveredAt =
        new Date();

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تم تسجيل تسليم الطلب.",
        order,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "الإجراء غير صحيح.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "DRIVER ORDER ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تنفيذ العملية.",
      },
      { status: 500 }
    );
  }
}