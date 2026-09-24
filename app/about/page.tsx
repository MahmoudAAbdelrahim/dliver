import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import AboutClient from "./AboutClient";

const SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

export default async function AboutPage() {
  let initialUser = null;

  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("accessToken")?.value;

    if (token) {
      const { payload } = await jwtVerify(token, SECRET);

      initialUser = {
        _id: payload.id as string,
        role: payload.role as "customer" | "driver" | "admin",
      };
    }
  } catch {
    initialUser = null;
  }

  return <AboutClient initialUser={initialUser} />;
}