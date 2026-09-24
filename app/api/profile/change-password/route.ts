import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ZodError } from "zod";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";

import {
  comparePassword,
  hashPassword,
} from "@/lib/bcrypt";

import {
  ChangePasswordSchema,
} from "@/validations/change-password";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    // =========================
    // Get access token
    // =========================

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "انتهت جلسة الدخول، يرجى تسجيل الدخول مرة أخرى.",
        },
        { status: 401 }
      );
    }

    // =========================
    // Verify token
    // =========================

    let payload: {
      id: string;
      role: string;
    };

    try {
      payload =
        verifyAccessToken(token) as {
          id: string;
          role: string;
        };
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "جلسة الدخول غير صالحة، يرجى تسجيل الدخول مرة أخرى.",
        },
        { status: 401 }
      );
    }

    if (!payload?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير مصرح له.",
        },
        { status: 401 }
      );
    }

    // =========================
    // Read body
    // =========================

    const body = await req.json();

    // =========================
    // Validate
    // =========================

    const data =
      ChangePasswordSchema.parse(body);

    // =========================
    // Find user
    // =========================

    const user =
      await User.findById(payload.id).select(
        "+password"
      );

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
    // Check current password
    // =========================

    const passwordCorrect =
      await comparePassword(
        data.currentPassword,
        user.password
      );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message:
            "كلمة المرور الحالية غير صحيحة.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Prevent same password
    // =========================

    const samePassword =
      await comparePassword(
        data.newPassword,
        user.password
      );

    if (samePassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Hash new password
    // =========================

    const hashedPassword =
      await hashPassword(
        data.newPassword
      );

    // =========================
    // Update password
    // =========================

    user.password = hashedPassword;

    await user.save();

    // =========================
    // Response
    // =========================

    return NextResponse.json(
      {
        success: true,
        message:
          "تم تغيير كلمة المرور بنجاح.",
      },
      { status: 200 }
    );

  } catch (error) {

    // =========================
    // Validation error
    // =========================

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يرجى تصحيح البيانات المدخلة.",
          errors:
            error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error(
      "Change password error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تغيير كلمة المرور.",
      },
      { status: 500 }
    );
  }
}