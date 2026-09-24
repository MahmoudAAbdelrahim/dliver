// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/login",
  "/register",
];

const CUSTOMER_ROUTES = [
  "/dashboard",
  "/profile",
  "/orders",
  "/track",
  "/become-driver",
];

const DRIVER_ROUTES = [
  "/driver",
];

const ADMIN_ROUTES = [
  "/admin",
];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as "customer" | "driver" | "admin";

    const isAuthPage = path.startsWith("/login") || path.startsWith("/register");

    if (isAuthPage) {
      switch (role) {
        case "admin":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        case "driver":
          return NextResponse.redirect(new URL("/driver/dashboard", req.url));
        default:
          return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    if (ADMIN_ROUTES.some((r) => path.startsWith(r)) && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      DRIVER_ROUTES.some((r) => path.startsWith(r)) &&
      role !== "driver" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      CUSTOMER_ROUTES.some((r) => path.startsWith(r)) &&
      role !== "customer" &&
      role !== "driver" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    return res;
  }
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};