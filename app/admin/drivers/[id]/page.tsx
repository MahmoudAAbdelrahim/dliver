//admin/drivers/[id]/page.tsx

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import DriverDetailsClient from "./DriverDetailsClient";

const SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

export default async function DriverDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        SECRET
      );

    if (payload.role !== "admin") {
      redirect("/");
    }

    const { id } = await params;

    return (
      <DriverDetailsClient
        id={id}
      />
    );
  } catch {
    redirect("/login");
  }
}