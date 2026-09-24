import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";
import DriverRequest from "@/models/DriverRequest";

import { DriverRequestSchema } from "@/validations/driver-request";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    const payload: any =
      verifyAccessToken(token);

    const user = await User.findById(payload.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود.",
        },
        { status: 404 }
      );
    }

    if (user.role !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message:
            "هذا الحساب لا يمكنه تقديم طلب مندوب.",
        },
        { status: 400 }
      );
    }

    if (user.driverStatus === "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "لديك طلب مندوب قيد المراجعة بالفعل.",
        },
        { status: 409 }
      );
    }

    const body = await req.json();

    const data =
      DriverRequestSchema.parse(body);

    const existingRequest =
      await DriverRequest.findOne({
        user: user._id,
      });

    if (
      existingRequest &&
      existingRequest.status === "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لديك طلب قيد المراجعة بالفعل.",
        },
        { status: 409 }
      );
    }

    const request =
      await DriverRequest.findOneAndUpdate(
        { user: user._id },
        {
          ...data,
          birthDate: new Date(data.birthDate),
          user: user._id,
          status: "pending",
          reviewedBy: undefined,
          reviewedAt: undefined,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    await User.findByIdAndUpdate(
      user._id,
      {
        driverStatus: "pending",
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "تم إرسال طلبك بنجاح وسيتم مراجعته من الإدارة.",
        request,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "DRIVER REQUEST ERROR:",
      error
    );

    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message:
            "يرجى مراجعة البيانات المدخلة.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إرسال الطلب.",
      },
      { status: 500 }
    );
  }
}