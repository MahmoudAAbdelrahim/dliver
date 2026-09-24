import {
  NextRequest,
  NextResponse,
} from "next/server";

import { cookies } from "next/headers";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";
import DriverApplication from "@/models/DriverApplication";

async function checkAdmin() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload: any =
      verifyAccessToken(token);

    if (payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const admin =
      await checkAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "غير مصرح لك.",
        },
        { status: 403 }
      );
    }

    const { id } =
      await context.params;

    console.log(
      "REJECT USER ID:",
      id
    );

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "معرف المستخدم غير صالح.",
        },
        { status: 400 }
      );
    }

    const body =
      await req.json();

    const reason =
      typeof body?.reason ===
      "string"
        ? body.reason.trim()
        : "";

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب كتابة سبب الرفض.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================
     * USER
     * ============================
     */

    const user =
      await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "المستخدم غير موجود.",
        },
        { status: 404 }
      );
    }

    /*
     * ============================
     * APPLICATION
     * ============================
     */

    const application =
      await DriverApplication.findOne({
        user: user._id,
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "طلب المندوب غير موجود.",
        },
        { status: 404 }
      );
    }

    if (
      application.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "هذا الطلب تمت مراجعته بالفعل.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================
     * رفض الطلب
     * ============================
     */

    application.status =
      "rejected";

    application.rejectionReason =
      reason;

    application.reviewedBy =
      admin.userId
        ? new mongoose.Types.ObjectId(
            admin.userId
          )
        : null;

    application.reviewedAt =
      new Date();

    await application.save();

    /*
     * ============================
     * المستخدم يظل Customer
     * ============================
     *
     * لأنه لم يتم قبوله كمندوب.
     */

    user.driverStatus =
      "rejected";

    /*
     * لو كان role لسه customer
     * نسيبه customer.
     */

    if (
      user.role !== "admin"
    ) {
      user.role = "customer";
    }

    await user.save();

    console.log(
      "DRIVER APPLICATION REJECTED:",
      user._id.toString()
    );

    return NextResponse.json({
      success: true,

      message:
        "تم رفض طلب المندوب.",

      application: {
        _id:
          application._id.toString(),

        status:
          application.status,

        rejectionReason:
          application.rejectionReason,
      },

      user: {
        _id:
          user._id.toString(),

        role:
          user.role,

        driverStatus:
          user.driverStatus,
      },
    });
  } catch (error) {
    console.error(
      "REJECT DRIVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء رفض طلب المندوب.",
      },
      { status: 500 }
    );
  }
}