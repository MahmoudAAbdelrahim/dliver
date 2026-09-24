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

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك.",
        },
        { status: 401 }
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
        { status: 401 }
      );
    }

    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "ليس لديك صلاحية.",
        },
        { status: 403 }
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
            "معرف المستخدم غير صالح.",
        },
        { status: 400 }
      );
    }

    /*
     * الصفحة ترسل User._id
     */

    const user =
      await User.findById(id)
        .select(
          "_id fullName email phone avatar role driverStatus address city createdAt updatedAt"
        )
        .lean();

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
     * الطلب الحقيقي مربوط بـ user
     */

    const application =
      await DriverApplication.findOne({
        user: user._id,
      })
        .populate({
          path: "reviewedBy",
          select:
            "_id fullName email",
        })
        .lean();

    if (!application) {
      console.log(
        "NO APPLICATION FOR USER:",
        user._id.toString()
      );

      /*
       * Debug مهم:
       * لو حصلت المشكلة مرة أخرى
       * سيظهر أول طلبات الـ collection.
       */

      const debugApplications =
        await DriverApplication.find({})
          .select(
            "_id user status fullName"
          )
          .limit(5)
          .lean();

      console.log(
        "DEBUG APPLICATIONS:",
        debugApplications
      );

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
     * البيانات النهائية
     */

    const result = {
      _id:
        application._id.toString(),

      user: {
        _id:
          user._id.toString(),

        fullName:
          user.fullName,

        email:
          user.email,

        phone:
          user.phone,

        avatar:
          user.avatar || "",

        role:
          user.role,

        driverStatus:
          user.driverStatus,

        address:
          user.address || "",

        city:
          user.city || "",
      },

      personalPhoto:
        application.personalPhoto || "",

      nationalIdImage:
        application.nationalIdImage || "",

      vehicleImage:
        application.vehicleImage || "",

      drivingLicenseImage:
        application.licenseImage ||
        application.drivingLicenseImage ||
        "",

      workPermitImage:
        application.workPermit ||
        application.workPermitImage ||
        "",

      address: {
        governorate:
          application.governorate || "",

        city:
          application.city || "",

        street:
          application.address || "",

        details:
          application.notes || "",
      },

      deliveryAreas: [],

      status:
        application.status,

      rejectionReason:
        application.rejectionReason ||
        "",

      reviewedBy:
        application.reviewedBy ||
        null,

      reviewedAt:
        application.reviewedAt ||
        null,

      createdAt:
        application.createdAt,

      updatedAt:
        application.updatedAt,
    };

    return NextResponse.json({
      success: true,
      application: result,
    });
  } catch (error) {
    console.error(
      "DRIVER APPLICATION DETAILS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل بيانات طلب المندوب.",
      },
      { status: 500 }
    );
  }
}