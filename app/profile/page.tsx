import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { connectDB } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import User from "@/models/User";

import ProfileClient from "../../components/profile/ProfileClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload: any;

  try {
    payload = verifyAccessToken(token);
  } catch {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(payload.id).select(
    "-password -refreshToken"
  );

  if (!user) {
    redirect("/login");
  }

  const initialUser = {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    avatar: user.avatar ?? "",
    role: user.role,
    driverStatus: user.driverStatus,
  };

  return <ProfileClient initialUser={initialUser} />;
}