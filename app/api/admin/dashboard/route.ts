import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import User from "@/models/User";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payload: any = verifyAccessToken(token);

    if (payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const [
      totalOrders,
      pendingAdmin,
      pendingDriver,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      customers,
      drivers,
      approvedDrivers,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        status: "pending_admin",
      }),

      Order.countDocuments({
        status: "pending_driver",
      }),

      Order.countDocuments({
        status: {
          $in: [
            "pending_driver",
            "driver_accepted",
            "picked_up",
            "on_the_way",
          ],
        },
      }),

      Order.countDocuments({
        status: "delivered",
      }),

      Order.countDocuments({
        status: {
          $in: [
            "cancelled",
            "admin_rejected",
            "driver_rejected",
            "driver_timeout",
          ],
        },
      }),

      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "driver",
      }),

      User.countDocuments({
        role: "driver",
        driverStatus: "approved",
      }),
    ]);

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$deliveryFee",
          },
        },
      },
    ]);

    const revenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        pendingAdmin,
        pendingDriver,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        customers,
        drivers,
        approvedDrivers,
        revenue,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحميل لوحة التحكم.",
      },
      { status: 500 }
    );
  }
}