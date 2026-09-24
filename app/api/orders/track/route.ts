import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose, { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";
import Order from "@/models/Order";

function getUserId(payload: any) {
  return payload?.userId ?? payload?.id ?? payload?._id ?? payload?.sub ?? null;
}

function cleanCode(value: string) {
  return value
    .trim()
    .replace(/^#/, "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload: any = verifyAccessToken(token);

    const userId = getUserId(payload);
    const role = payload?.role ?? "guest";

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    return {
      userId: new Types.ObjectId(userId),
      role,
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // مهم حتى populate("customer"/"driver") لا يعمل MissingSchemaError
    void User;

    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");

    if (!rawCode) {
      return NextResponse.json(
        {
          success: false,
          message: "أدخل رقم الشحنة.",
        },
        { status: 400 }
      );
    }

    const code = cleanCode(rawCode);

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الشحنة غير صالح.",
        },
        { status: 400 }
      );
    }

    const auth = await getAuth();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    const query: any = {};

    // لو المستخدم أدخل ObjectId كامل
    if (mongoose.Types.ObjectId.isValid(code) && code.length === 24) {
      query._id = new mongoose.Types.ObjectId(code);
    } else {
      // يدعم الكود الظاهر في الهوم مثل:
      // #B0C3D528
      if (!/^[0-9A-F]{8}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message: "رقم الشحنة غير صالح.",
          },
          { status: 400 }
        );
      }

      const regex = new RegExp(`${code}$`, "i");

      // البحث عن آخر 8 أحرف من ObjectId
      const orders = await Order.aggregate([
        {
          $match: {
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: regex,
              },
            },
          },
        },
        {
          $limit: 1,
        },
      ]);

      if (!orders.length) {
        return NextResponse.json(
          {
            success: false,
            message: "لم يتم العثور على الشحنة.",
          },
          { status: 404 }
        );
      }

      query._id = orders[0]._id;
    }

    // الصلاحيات حسب المستخدم
    if (auth.role === "customer") {
      query.customer = auth.userId;
    }

    if (auth.role === "driver") {
      query.driver = auth.userId;
    }

    // الأدمن يستطيع الوصول لأي طلب

    const order = await Order.findOne(query)
      .populate(
        "customer",
        "_id fullName phone email avatar city"
      )
      .populate(
        "driver",
        "_id fullName phone avatar city driverStatus"
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

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      trackingCode: `#${String(order._id).slice(-8).toUpperCase()}`,
      status: order.status,
      order,
    });
  } catch (error) {
    console.error("ORDER TRACK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تتبع الشحنة.",
      },
      { status: 500 }
    );
  }
}