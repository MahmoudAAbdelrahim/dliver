import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "driver" | "admin";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: Role;
  driverStatus: "none" | "pending" | "approved" | "rejected" | "suspended";
  address?: string;
city?: string;
createdAt?: string;
updatedAt?: string;
lastLogin?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      authenticated: false,

      setLoading: (loading) => set({ loading }),

      setUser: (user) =>
        set({ user, authenticated: true, loading: false }),

      logout: () =>
        set({ user: null, authenticated: false, loading: false }),
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);