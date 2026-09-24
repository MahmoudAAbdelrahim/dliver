import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import Order from "@/models/Order";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payload: any = verifyAccessToken(token);

    if (payload.role !== "admin") return null;

    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  context: Context
) {
  try {
    await connectDB();

    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const order = await Order.findById(id)
      .populate(
        "customer",
        "fullName email phone avatar address city"
      )
      .populate(
        "driver",
        "fullName phone avatar address city driverStatus"
      )
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ADMIN ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل الطلب.",
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

    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await req.json();

    const {
      action,
      driverId,
      adminNotes,
    } = body;

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

    // =========================
    // REJECT
    // =========================

    if (action === "reject") {
      if (order.status !== "pending_admin") {
        return NextResponse.json(
          {
            success: false,
            message:
              "لا يمكن رفض الطلب في حالته الحالية.",
          },
          { status: 400 }
        );
      }

      order.status = "admin_rejected";

      order.cancelledAt = new Date();

      order.cancellationReason =
        adminNotes ||
        "تم رفض الطلب من الإدارة.";

      order.adminNotes =
        adminNotes || "";

      await order.save();

      return NextResponse.json({
        success: true,
        message: "تم رفض الطلب.",
        order,
      });
    }

    // =========================
    // APPROVE
    // =========================

    if (action === "approve") {
      if (order.status !== "pending_admin") {
        return NextResponse.json(
          {
            success: false,
            message:
              "لا يمكن الموافقة على الطلب في حالته الحالية.",
          },
          { status: 400 }
        );
      }

      if (!driverId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "يجب اختيار مندوب قبل الموافقة.",
          },
          { status: 400 }
        );
      }

      const User = (
        await import("@/models/User")
      ).default;

      const driver = await User.findOne({
        _id: driverId,
        role: "driver",
        driverStatus: "approved",
        isBlocked: false,
      }).select(
        "_id fullName phone avatar address city"
      );

      if (!driver) {
        return NextResponse.json(
          {
            success: false,
            message:
              "المندوب غير متاح.",
          },
          { status: 400 }
        );
      }

      order.driver = driver._id;

      order.status = "pending_driver";

      order.driverResponseExpiresAt =
        new Date(
          Date.now() +
            60 * 60 * 1000
        );

      order.adminNotes =
        adminNotes || "";

      await order.save();

      return NextResponse.json({
        success: true,
        message:
          "تمت الموافقة وإرسال الطلب إلى المندوب.",
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
      "ADMIN ORDER ACTION ERROR:",
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