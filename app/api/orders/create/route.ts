import {
  NextRequest,
  NextResponse,
} from "next/server";

import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";
import Order from "@/models/Order";

import {
  CreateOrderSchema,
} from "@/validations/order";

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    // =========================
    // Authentication
    // =========================

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "accessToken"
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب تسجيل الدخول أولاً.",
        },
        {
          status: 401,
        }
      );
    }

    let payload: any;

    try {
      payload =
        verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "جلسة الدخول غير صالحة.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // Get current user
    // =========================

    const user =
      await User.findById(
        payload.id
      ).select(
        "fullName email phone address city role isBlocked"
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "المستخدم غير موجود.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "حسابك محظور ولا يمكنك إنشاء طلب.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // Parse body
    // =========================

    const body =
      await req.json();

    const data =
      CreateOrderSchema.parse(
        body
      );

    // =========================
    // Validate driver
    // =========================

    let driverId =
      data.driver ?? null;

    if (driverId) {
      const driver =
        await User.findOne({
          _id: driverId,
          role: "driver",
          driverStatus: "approved",
          isBlocked: false,
        }).select(
          "_id fullName"
        );

      if (!driver) {
        return NextResponse.json(
          {
            success: false,
            message:
              "المندوب غير متاح.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================
    // Create Order
    // =========================

    const order =
      await Order.create({
        customer: user._id,

        customerInfo: {
          fullName:
            user.fullName,

          email:
            user.email,

          phone:
            user.phone,
        },

        pickup: {
          method:
            data.pickup.method,

          address:
            user.address ||
            data.pickup.address,

          city:
            user.city ||
            data.pickup.city,

          details:
            data.pickup.details || "",
        },

        delivery:
          data.delivery,

        images:
          data.images,

        paymentMethod:
          data.paymentMethod,

        driver:
          driverId,

        deliveryFee:
          data.deliveryFee,

        status:
          "pending_admin",

        driverResponseExpiresAt:
          null,
      });

    // =========================
    // Response
    // =========================

    return NextResponse.json(
      {
        success: true,

        message:
          "تم إرسال طلب الشحن بنجاح، وهو الآن بانتظار مراجعة الإدارة.",

        order: {
          _id:
            order._id,

          status:
            order.status,

          deliveryFee:
            order.deliveryFee,

          paymentMethod:
            order.paymentMethod,

          createdAt:
            order.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    if (
      error?.name ===
      "ZodError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "بيانات الطلب غير صحيحة.",
          errors:
            error.flatten()
              .fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إنشاء الطلب.",
      },
      {
        status: 500,
      }
    );
  }
}