// src/lib/bcrypt.ts

import bcrypt from "bcryptjs";

const SALT = 12;

export async function hashPassword(
  password: string
) {
  return bcrypt.hash(password, SALT);
}

export async function comparePassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash);
}