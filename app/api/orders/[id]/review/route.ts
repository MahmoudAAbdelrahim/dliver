import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";
import Order from "@/models/Order";
import Review from "@/models/Review";

function getUserId(payload: any) {
  return payload?.userId ?? payload?.id ?? payload?._id ?? payload?.sub ?? null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "غير مصرح." },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "جلسة الدخول غير صالحة." },
        { status: 401 }
      );
    }

    const userId = getUserId(payload);

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "بيانات المستخدم غير صالحة." },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select(
      "_id role isBlocked deletedAt driverStatus"
    );

    if (!user || user.deletedAt || user.isBlocked) {
      return NextResponse.json(
        { success: false, message: "الحساب غير متاح." },
        { status: 403 }
      );
    }

    if (user.role !== "customer" && user.role !== "driver") {
      return NextResponse.json(
        { success: false, message: "هذا الحساب لا يمكنه إضافة تقييم." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "معرف الطلب غير صالح." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const rating = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "التقييم يجب أن يكون من 1 إلى 5." },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { success: false, message: "التعليق يجب ألا يتجاوز 500 حرف." },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).select(
      "customer driver status"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "الطلب غير موجود." },
        { status: 404 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { success: false, message: "التقييم متاح بعد تسليم الطلب فقط." },
        { status: 400 }
      );
    }

    const isCustomer = user.role === "customer";
    const isDriver = user.role === "driver";

    const isOrderCustomer = String(order.customer) === String(user._id);
    const isOrderDriver = !!order.driver && String(order.driver) === String(user._id);

    if ((isCustomer && !isOrderCustomer) || (isDriver && !isOrderDriver)) {
      return NextResponse.json(
        { success: false, message: "لا يمكنك تقييم هذا الطلب." },
        { status: 403 }
      );
    }

    const reviewee = isCustomer ? order.driver : order.customer;
    const revieweeRole = isCustomer ? "driver" : "customer";

    if (!reviewee) {
      return NextResponse.json(
        { success: false, message: "لا يوجد طرف آخر متاح للتقييم في هذا الطلب." },
        { status: 400 }
      );
    }

    const existing = await Review.findOne({
      order: order._id,
      reviewer: user._id,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "قمت بتقييم هذا الطلب بالفعل." },
        { status: 409 }
      );
    }

    const review = await Review.create({
      order: order._id,
      reviewer: user._id,
      reviewee,
      reviewerRole: isCustomer ? "customer" : "driver",
      revieweeRole,
      rating,
      comment,
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ التقييم بنجاح.",
      review: {
        _id: String(review._id),
        rating: review.rating,
        comment: review.comment,
      },
    });
  } catch (error: any) {
    console.error("REVIEW CREATE ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "قمت بتقييم هذا الطلب بالفعل." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حفظ التقييم." },
      { status: 500 }
    );
  }
}
