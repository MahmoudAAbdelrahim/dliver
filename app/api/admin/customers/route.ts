import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

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

export async function GET(
  req: NextRequest
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

    const {
      searchParams,
    } = new URL(req.url);

    const search =
      searchParams.get(
        "search"
      )?.trim();

    const status =
      searchParams.get(
        "status"
      );

    const filter: any = {
      role: "customer",
      deletedAt: null,
    };

    if (status === "active") {
      filter.isBlocked = false;
    }

    if (status === "blocked") {
      filter.isBlocked = true;
    }

    if (search) {
      filter.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const customers =
      await User.find(filter)
        .select(
          "-password -refreshToken"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error(
      "ADMIN CUSTOMERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل العملاء.",
      },
      { status: 500 }
    );
  }
}