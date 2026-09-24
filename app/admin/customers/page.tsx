import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import CustomersClient from "./CustomersClient";

const SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

export default async function CustomersPage() {
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

    return <CustomersClient />;
  } catch {
    redirect("/login");
  }
}