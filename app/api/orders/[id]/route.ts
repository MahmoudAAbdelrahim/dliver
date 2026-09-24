import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import Order from "@/models/Order";
import OrderMessage from "@/models/OrderMessage";

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

export async function GET(
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

    const order =
      await Order.findOne({
        _id: id,
        customer: userId,
      })
        .populate(
          "driver",
          "fullName phone avatar city"
        )
        .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الطلب غير موجود أو لا تملك صلاحية الوصول إليه.",
        },
        { status: 404 }
      );
    }

    const messages =
      await OrderMessage.find({
        order: order._id,
      })
        .sort({ createdAt: 1 })
        .lean();

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        messages,
      },
    });
  } catch (error) {
    console.error(
      "CUSTOMER ORDER GET ERROR:",
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