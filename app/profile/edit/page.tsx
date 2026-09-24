"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  Phone,
  MapPin,
  Building2,
  Save,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

export default function EditProfilePage() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  // =========================
  // Load user data
  // =========================

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });

      setInitializing(false);
    }
  }, [user]);

  // =========================
  // Handle input
  // =========================

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  // =========================
  // Submit
  // =========================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!form.fullName.trim()) {
      setError("من فضلك أدخل الاسم بالكامل.");
      return;
    }

    if (!form.phone.trim()) {
      setError("من فضلك أدخل رقم الهاتف.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
        }),
      });

      const data = await res.json();

      console.log("📤 Update response:", data);

      if (!res.ok) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تحديث البيانات."
        );
      }

      // Update Zustand
      setUser(data.user);

      // Go profile
      router.replace("/profile");

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث البيانات."
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================
  // Loading user
  // =========================

  if (initializing && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2
          className="animate-spin text-orange-500"
          size={32}
        />
      </main>
    );
  }

  // =========================
  // Not authenticated
  // =========================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="mb-3 text-xl font-black text-slate-900">
            يجب تسجيل الدخول
          </h1>

          <p className="mb-6 text-slate-500">
            قم بتسجيل الدخول أولًا لتعديل بياناتك.
          </p>

          <button
            onClick={() => router.replace("/login")}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white"
          >
            تسجيل الدخول
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        {/* Header */}

        <div className="mb-6 flex items-center gap-4">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              تعديل البيانات
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              حدّث بيانات حسابك الشخصية
            </p>
          </div>

        </div>

        {/* Card */}

        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full Name */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                الاسم بالكامل
              </label>

              <div className="relative">

                <User
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  placeholder="محمد أحمد"
                />

              </div>
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                رقم الهاتف
              </label>

              <div className="relative">

                <Phone
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-left text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  placeholder="01012345678"
                />

              </div>
            </div>

            {/* Address */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                العنوان
              </label>

              <div className="relative">

                <MapPin
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  placeholder="الشارع والمنطقة"
                />

              </div>
            </div>

            {/* City */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                المدينة
              </label>

              <div className="relative">

                <Building2
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  placeholder="أسيوط"
                />

              </div>
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Save */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  جاري حفظ التعديلات...
                </>
              ) : (
                <>
                  <Save size={19} />
                  حفظ التعديلات
                </>
              )}

            </button>

          </form>

        </div>
      </div>
    </main>
  );
}