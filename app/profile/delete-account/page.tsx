"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

export default function DeleteAccountPage() {
  const router = useRouter();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleDelete() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        "/api/profile/delete-account",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء حذف الحساب."
        );
      }

      setSuccess(
        data.message ||
          "تم حذف الحساب بنجاح."
      );

      // تنظيف Zustand
      logout();

      // تنظيف التخزين المحلي
      useAuthStore.persist.clearStorage();

      // تحويل للـ login
      setTimeout(() => {
        router.replace("/login");
      }, 1800);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف الحساب."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">

        <div className="w-full rounded-[2rem] border border-slate-200/60 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-9">

          {/* Danger Icon */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <Trash2 size={34} />
          </div>

          {/* Title */}

          <h1 className="mt-6 text-2xl font-black text-slate-900">
            حذف الحساب
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            هل أنت متأكد أنك تريد حذف حسابك؟
            هذا الإجراء سيوقف حسابك ولن تتمكن من
            استخدامه بعد الحذف.
          </p>

          {/* Warning */}

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-right">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>

              <div>

                <h2 className="text-sm font-black text-red-700">
                  انتبه قبل المتابعة
                </h2>

                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-red-500">
                  <li>
                    • سيتم تعطيل حسابك.
                  </li>

                  <li>
                    • سيتم إنهاء جلسة الدخول الحالية.
                  </li>

                  <li>
                    • لن تتمكن من استخدام الحساب بعد الحذف.
                  </li>
                </ul>

              </div>

            </div>

          </div>

          {/* Security */}

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <ShieldAlert size={20} />
            </div>

            <div>

              <p className="text-sm font-bold text-slate-700">
                عملية حساسة
              </p>

              <p className="mt-1 text-xs text-slate-400">
                لا تقم بهذه العملية إلا إذا كنت متأكدًا.
              </p>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-right text-sm font-semibold text-emerald-600">

              <CheckCircle2
                size={19}
                className="shrink-0"
              />

              <div>
                <p>{success}</p>

                <p className="mt-1 text-xs font-medium text-emerald-500">
                  سيتم تحويلك إلى صفحة تسجيل الدخول...
                </p>
              </div>

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

            {/* Delete */}

            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  جاري حذف الحساب...
                </>
              ) : (
                <>
                  <Trash2 size={18} />

                  حذف الحساب
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