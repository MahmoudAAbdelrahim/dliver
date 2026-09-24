import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import cloudinary from "@/lib/cloudinary";
import { verifyAccessToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest
) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح.",
        },
        { status: 401 }
      );
    }

    verifyAccessToken(token);

    const formData =
      await req.formData();

    const file =
      formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "لم يتم اختيار صورة.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يسمح برفع الصور فقط.",
        },
        { status: 400 }
      );
    }

    // 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message:
            "حجم الصورة يجب ألا يتجاوز 5MB.",
        },
        { status: 400 }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const result =
      await new Promise<any>(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "sendly/driver-requests",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(buffer);
        }
      );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(
      "CLOUDINARY UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء رفع الصورة.",
      },
      { status: 500 }
    );
  }
}