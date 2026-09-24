import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

// ==========================================
// Cloudinary
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ==========================================
// Helpers
// ==========================================

function getUserId(payload: any) {
  return (
    payload?.userId ??
    payload?.id ??
    payload?._id ??
    payload?.sub ??
    null
  );
}

function uploadToCloudinary(
  buffer: Buffer,
  userId: string
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sendly/avatars",
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: "image",

        transformation: [
          {
            width: 600,
            height: 600,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(
            error ||
              new Error("Cloudinary upload failed")
          );

          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

// ==========================================
// POST
// ==========================================

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------
    // DB
    // --------------------------------------

    await connectDB();

    // --------------------------------------
    // Auth
    // --------------------------------------

    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح. سجل الدخول أولاً.",
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

    const userId = getUserId(payload);

    if (
      !userId ||
      !Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات المستخدم غير صالحة.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------
    // User
    // --------------------------------------

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

    if (user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب محذوف.",
        },
        { status: 403 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب محظور.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------
    // FormData
    // --------------------------------------

    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "لم يتم اختيار صورة.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // Validate type
    // --------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // Validate size - 5MB
    // --------------------------------------

    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "حجم الصورة يجب ألا يتجاوز 5MB.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // Cloudinary config check
    // --------------------------------------

    if (
      !process.env.CLOUDINARY_NAME ||
      !process.env.CLOUDINARY_KEY ||
      !process.env.CLOUDINARY_SECRET
    ) {
      console.error(
        "Cloudinary environment variables are missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "إعدادات Cloudinary غير مكتملة على السيرفر.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------
    // Convert File -> Buffer
    // --------------------------------------

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // --------------------------------------
    // Upload
    // --------------------------------------

    const uploaded =
      await uploadToCloudinary(
        buffer,
        String(user._id)
      );

    // --------------------------------------
    // Save URL in MongoDB
    // --------------------------------------

    user.avatar = uploaded.secure_url;

    await user.save();

    // --------------------------------------
    // Response
    // --------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "تم تحديث الصورة الشخصية بنجاح.",

      user: {
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || "",
        address: user.address || "",
        city: user.city || "",
        role: user.role,
        driverStatus:
          user.driverStatus,
        isBlocked: user.isBlocked,
      },

      image: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
    });
  } catch (error: any) {
    console.error(
      "PROFILE AVATAR ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "حدث خطأ أثناء رفع الصورة.",
      },
      { status: 500 }
    );
  }
}