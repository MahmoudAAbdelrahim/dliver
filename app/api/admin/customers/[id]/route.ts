import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

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

    if (
      payload?.role !== "admin"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function getCustomer(
  id: string
) {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    return null;
  }

  return User.findOne({
    _id: id,
    role: "customer",
    deletedAt: null,
  });
}

export async function PATCH(
  req: NextRequest,
  context: Context
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "غير مصرح لك بالوصول.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const customer =
      await getCustomer(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "العميل غير موجود.",
        },
        { status: 404 }
      );
    }

    const body =
      await req.json();

    const action =
      body?.action;

    if (
      action !== "block" &&
      action !== "unblock"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "الإجراء غير صحيح.",
        },
        { status: 400 }
      );
    }

    if (action === "block") {
      customer.isBlocked =
        true;

      customer.refreshToken =
        "";

      await customer.save();

      return NextResponse.json({
        success: true,
        message:
          "تم إيقاف حساب العميل.",
      });
    }

    customer.isBlocked =
      false;

    await customer.save();

    return NextResponse.json({
      success: true,
      message:
        "تمت إعادة تفعيل حساب العميل.",
    });
  } catch (error) {
    console.error(
      "ADMIN CUSTOMER PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحديث حساب العميل.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: Context
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "غير مصرح لك بالوصول.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const customer =
      await getCustomer(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "العميل غير موجود.",
        },
        { status: 404 }
      );
    }

    // Soft Delete
    customer.deletedAt =
      new Date();

    customer.isBlocked =
      true;

    customer.refreshToken =
      "";

    await customer.save();

    return NextResponse.json({
      success: true,
      message:
        "تم حذف حساب العميل.",
    });
  } catch (error) {
    console.error(
      "ADMIN CUSTOMER DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء حذف الحساب.",
      },
      { status: 500 }
    );
  }
}