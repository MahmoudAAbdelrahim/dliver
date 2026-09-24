import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

import User from "@/models/User";
import DriverApplication from "@/models/DriverApplication";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // =========================
    // Authentication
    // =========================
    const cookieStore = await cookies();

    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    let payload: any;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "جلسة الدخول غير صالحة.",
        },
        { status: 401 }
      );
    }

    const userId = payload?.userId || payload?.id || payload?.sub;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات المستخدم غير صالحة.",
        },
        { status: 401 }
      );
    }

    // =========================
    // Get user
    // =========================
    const user = await User.findById(userId);

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
    // Check current driver status
    // =========================
    if (user.role === "driver") {
      return NextResponse.json(
        {
          success: false,
          message: "أنت مندوب بالفعل.",
        },
        { status: 400 }
      );
    }

    if (user.driverStatus === "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "لديك طلب قيد المراجعة بالفعل.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Read body
    // =========================
    const body = await req.json();

    const {
      nationalId,
      birthDate,
      governorate,
      city,
      address,
      vehicleType,
      licenseNumber,

      personalPhoto,
      nationalIdFront,
      nationalIdBack,
      licenseImage,
      workPermit,

      notes,
    } = body;

    // =========================
    // Required fields
    // =========================
    if (
      !nationalId ||
      !birthDate ||
      !governorate ||
      !city ||
      !address ||
      !vehicleType ||
      !licenseNumber ||
      !personalPhoto ||
      !nationalIdFront ||
      !nationalIdBack ||
      !licenseImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إكمال جميع البيانات المطلوبة.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Validate National ID
    // =========================
    if (!/^\d{14}$/.test(String(nationalId))) {
      return NextResponse.json(
        {
          success: false,
          message: "الرقم القومي يجب أن يتكون من 14 رقمًا.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Validate birth date
    // =========================
    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "تاريخ الميلاد غير صالح.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Check if application already exists
    // =========================
    const existingApplication =
      await DriverApplication.findOne({
        user: user._id,
      }).lean();

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingApplication.status === "pending"
              ? "لديك طلب قيد المراجعة بالفعل."
              : existingApplication.status === "approved"
              ? "تم قبول طلبك بالفعل."
              : "لديك طلب سابق للمندوبية.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Create application
    // =========================
    const application =
      await DriverApplication.create({
        user: user._id,

        nationalId: String(nationalId).trim(),
        birthDate: parsedBirthDate,

        governorate: String(governorate).trim(),
        city: String(city).trim(),
        address: String(address).trim(),

        vehicleType: String(vehicleType).trim(),
        licenseNumber: String(licenseNumber).trim(),

        nationalIdFront: String(nationalIdFront).trim(),
        nationalIdBack: String(nationalIdBack).trim(),
        licenseImage: String(licenseImage).trim(),

        personalPhoto: String(personalPhoto).trim(),

        workPermit: workPermit
          ? String(workPermit).trim()
          : "",

        notes: notes
          ? String(notes).trim()
          : "",

        status: "pending",

        reviewedBy: null,
        reviewedAt: null,
      });

    // =========================
    // Update user
    // =========================
    user.driverStatus = "pending";

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "تم إرسال طلب الانضمام كمندوب بنجاح.",
        application: {
          _id: application._id,
          user: application.user,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "DRIVER REQUEST POST ERROR:",
      error
    );

    // Duplicate key
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يوجد طلب مندوب مسجل بهذا المستخدم بالفعل.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "حدث خطأ أثناء إرسال طلب المندوب.",
      },
      { status: 500 }
    );
  }
}