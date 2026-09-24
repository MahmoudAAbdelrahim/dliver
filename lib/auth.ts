// src/lib/auth.ts

import { User } from "@/store/auth";

const API = "/api/auth";

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}

// ================= Register =================

export async function register(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ================= Login =================

export async function login(data: {
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  console.log(json);

  if (!res.ok) {
    throw new Error(json.message);
  }

  return json;
}

// ================= Logout =================

export async function logout() {
  return request<AuthResponse>("/logout", {
    method: "POST",
  });
}

// ================= Current User =================

export async function getCurrentUser() {
  return request<AuthResponse>("/me");
}

// ================= Refresh =================

export async function refreshSession() {
  return request<AuthResponse>("/refresh", {
    method: "POST",
  });
}