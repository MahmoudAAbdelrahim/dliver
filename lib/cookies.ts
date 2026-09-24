// src/lib/cookies.ts

import { cookies } from "next/headers";

export async function setAccessCookie(
  token: string
) {
  const store = await cookies();

  store.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });
}

export async function setRefreshCookie(
  token: string
) {
  const store = await cookies();

  store.set("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function removeCookies() {
  const store = await cookies();

  store.delete("accessToken");

  store.delete("refreshToken");
}