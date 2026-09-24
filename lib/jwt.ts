// src/lib/jwt.ts

import jwt from "jsonwebtoken";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET!;

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET!;

export function createAccessToken(
  id: string,
  role: string
) {
  return jwt.sign(
    {
      id,
      role,
    },
    ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

export function createRefreshToken(
  id: string
) {
  return jwt.sign(
    {
      id,
    },
    REFRESH_SECRET,
    {
      expiresIn: "30d",
    }
  );
}

export function verifyAccessToken(
  token: string
) {
  return jwt.verify(
    token,
    ACCESS_SECRET
  );
}

export function verifyRefreshToken(
  token: string
) {
  return jwt.verify(
    token,
    REFRESH_SECRET
  );
}