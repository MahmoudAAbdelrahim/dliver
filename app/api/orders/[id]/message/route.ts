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

    const message =
      String(
        body.message || ""
      ).trim();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "اكتب الرسالة أولاً.",
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الرسالة طويلة جدًا.",
        },
        { status: 400 }
      );
    }

    const order =
      await Order.findOne({
        _id: id,
        customer: userId,
      }).select("_id status");

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

    await OrderMessage.create({
      order: order._id,
      sender: userId,
      senderRole: "customer",
      message,
    });

    return NextResponse.json({
      success: true,
      message:
        "تم إرسال الرسالة.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إرسال الرسالة.",
      },
      { status: 500 }
    );
  }
}