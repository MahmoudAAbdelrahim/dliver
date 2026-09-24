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
      "APPROVE USER ID:",
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

    /*
     * نجيب المستخدم
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
     * نجيب طلب المندوب
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

    /*
     * لازم يكون Pending
     */

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
     * اعتماد الطلب
     * ============================
     */

    application.status =
      "approved";

    application.reviewedBy =
      admin.userId
        ? new mongoose.Types.ObjectId(
            admin.userId
          )
        : null;

    application.reviewedAt =
      new Date();

    application.rejectionReason =
      "";

    await application.save();

    /*
     * ============================
     * تحويل المستخدم إلى Driver
     * ============================
     */

    user.role = "driver";

    user.driverStatus =
      "approved";

    await user.save();

    console.log(
      "DRIVER APPROVED:",
      user._id.toString()
    );

    return NextResponse.json({
      success: true,

      message:
        "تم قبول المندوب وتحويل حسابه إلى مندوب بنجاح.",

      application: {
        _id:
          application._id.toString(),

        status:
          application.status,
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
      "APPROVE DRIVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء قبول المندوب.",
      },
      { status: 500 }
    );
  }
}