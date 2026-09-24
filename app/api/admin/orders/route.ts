import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import Order from "@/models/Order";

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

export async function GET(
  req: NextRequest
) {
  try {
    // =========================
    // ADMIN AUTH
    // =========================

    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بالوصول.",
        },
        { status: 403 }
      );
    }

    // =========================
    // DATABASE
    // =========================

    await connectDB();

    // =========================
    // QUERY PARAMS
    // =========================

    const { searchParams } =
      new URL(req.url);

    const status =
      searchParams.get("status");

    const search =
      searchParams.get("search");

    // =========================
    // FILTER
    // =========================

    const filter: any = {};

    if (
      status &&
      status !== "all"
    ) {
      filter.status = status;
    }

    // =========================
    // SEARCH
    // =========================

    if (search?.trim()) {
      const searchValue =
        search.trim();

      filter.$or = [
        {
          "customerInfo.fullName": {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          "customerInfo.email": {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          "customerInfo.phone": {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    // =========================
    // GET ORDERS
    // =========================

    const orders =
      await Order.find(filter)
        .populate(
          "customer",
          "fullName email phone avatar"
        )
        .populate(
          "driver",
          "fullName phone avatar address city driverStatus"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "ADMIN ORDERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل الطلبات.",
      },
      { status: 500 }
    );
  }
}