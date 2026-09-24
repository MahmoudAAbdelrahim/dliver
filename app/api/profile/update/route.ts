import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ZodError } from "zod";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";
import { UpdateProfileSchema } from "@/validations/update-profile";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // =========================
    // Get access token
    // =========================

    const cookieStore = await cookies();

    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك. يرجى تسجيل الدخول.",
        },
        { status: 401 }
      );
    }

    // =========================
    // Verify token
    // =========================

    const payload = verifyAccessToken(token) as {
      id: string;
      role: string;
    };

    if (!payload?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "جلسة الدخول غير صالحة.",
        },
        { status: 401 }
      );
    }

    // =========================
    // Read body
    // =========================

    const body = await req.json();

    console.log("📥 Update profile body:", body);

    // =========================
    // Validate
    // =========================

    const data = UpdateProfileSchema.parse(body);

    const phone = data.phone.trim();

    // =========================
    // Check phone
    // =========================

    const phoneExists = await User.findOne({
      phone,
      _id: { $ne: payload.id },
    });

    if (phoneExists) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    // =========================
    // Update user
    // =========================

    const user = await User.findByIdAndUpdate(
      payload.id,
      {
        $set: {
          fullName: data.fullName.trim(),
          phone,
          address: data.address?.trim() || "",
          city: data.city?.trim() || "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود.",
        },
        { status: 404 }
      );
    }

    // =========================
    // Response
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "تم تحديث البيانات بنجاح.",
        user,
      },
      { status: 200 }
    );

  } catch (error) {

    // Zod errors
    if (error instanceof ZodError) {
      console.error(
        "❌ Update profile validation:",
        error.flatten().fieldErrors
      );

      return NextResponse.json(
        {
          success: false,
          message: "البيانات المدخلة غير صحيحة.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error(
      "❌ Update profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحديث البيانات.",
      },
      { status: 500 }
    );
  }
}