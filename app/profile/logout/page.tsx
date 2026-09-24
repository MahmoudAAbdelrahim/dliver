"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

export default function LogoutPage() {
  const router = useRouter();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تسجيل الخروج."
        );
      }

      // تنظيف بيانات المستخدم من Zustand
      logout();

      // تنظيف الـ persisted store أيضًا
      useAuthStore.persist.clearStorage();

      // الذهاب لتسجيل الدخول
      router.replace("/login");

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تسجيل الخروج."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">

        <div className="w-full rounded-[2rem] border border-slate-200/60 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-9">

          {/* Icon */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <LogOut size={34} />
          </div>

          {/* Title */}

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            تسجيل الخروج
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
            ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك.
          </p>

          {/* Security */}

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700">
                جلسة آمنة
              </p>

              <p className="mt-1 text-xs text-slate-400">
                سيتم إنهاء جلسة الدخول على هذا الجهاز.
              </p>
            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Cancel */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                router.back()
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={18} />
              إلغاء
            </button>

            {/* Logout */}

            <button
              type="button"
              disabled={loading}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  جاري الخروج...
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  تسجيل الخروج
                </>
              )}
            </button>

          </div>

          {/* Back */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              router.push("/profile")
            }
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-orange-500"
          >
            <ArrowRight size={15} />
            العودة إلى الملف الشخصي
          </button>

        </div>

      </div>
    </main>
  );
}