import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import AdminDashboardClient from "./AdminDashboardClient";

const SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const { payload } = await jwtVerify(
      token,
      SECRET
    );

    if (payload.role !== "admin") {
      redirect("/");
    }

    return <AdminDashboardClient />;
  } catch {
    redirect("/login");
  }
}