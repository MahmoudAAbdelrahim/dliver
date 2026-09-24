import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    // =========================
    // Validation
    // =========================

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى ملء جميع الحقول المطلوبة.",
        },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : "";
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    if (cleanName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "الاسم يجب أن يكون حرفين على الأقل.",
        },
        { status: 400 }
      );
    }

    if (cleanMessage.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "الرسالة يجب أن تكون 10 أحرف على الأقل.",
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إدخال بريد إلكتروني صحيح.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Get logged-in user
    // =========================

    let userId: Types.ObjectId | undefined;

    try {
      const cookieStore = await cookies();

      const token =
        cookieStore.get("accessToken")?.value;

if (token) {
  const payload = await verifyAccessToken(token);

  const id =
    (payload as { id?: string; sub?: string })?.id ||
    (payload as { id?: string; sub?: string })?.sub;

  if (
    id &&
    Types.ObjectId.isValid(String(id))
  ) {
    userId = new Types.ObjectId(String(id));
  }
}
    } catch {
      // Visitor can still send a contact message.
      userId = undefined;
    }

    // =========================
    // Create message
    // =========================

    const contactMessage =
      await ContactMessage.create({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        userId,
        status: "new",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "تم إرسال رسالتك بنجاح، وسنتواصل معك قريبًا.",
        data: {
          id: contactMessage._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CONTACT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.",
      },
      { status: 500 }
    );
  }
}