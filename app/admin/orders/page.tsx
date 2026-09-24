import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import AdminOrdersClient from "./AdminOrdersClient";

const SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

export default async function AdminOrdersPage() {
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

    return <AdminOrdersClient />;
  } catch {
    redirect("/login");
  }
}