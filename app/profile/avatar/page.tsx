"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Upload,
  User2,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

export default function AvatarPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // Load current user
  // ==========================================

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/home", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "تعذر تحميل بيانات المستخدم."
          );
        }

        if (data?.user) {
          setUser(data.user);

          if (data.user.avatar) {
            setPreview(data.user.avatar);
          }
        }
      } catch (err: any) {
        setError(
          err?.message || "حدث خطأ أثناء تحميل بيانات الحساب."
        );
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, [setUser]);

  // ==========================================
  // Select image
  // ==========================================

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("من فضلك اختر صورة فقط.");
      event.target.value = "";
      return;
    }

    // 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 5MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }

  // ==========================================
  // Remove selected image
  // ==========================================

  function removeSelectedImage() {
    setSelectedFile(null);

    if (user?.avatar) {
      setPreview(user.avatar);
    } else {
      setPreview("");
    }
  }

  // ==========================================
  // Upload
  // ==========================================

  async function handleUpload() {
    if (!selectedFile) {
      setError("اختر صورة أولاً.");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        "/api/profile/avatar",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "فشل رفع الصورة."
        );
      }

      // Update auth store immediately
      if (data?.user) {
        setUser(data.user);
      }

      setSelectedFile(null);

      if (data?.user?.avatar) {
        setPreview(data.user.avatar);
      }

      setSuccess("تم تحديث الصورة الشخصية بنجاح.");

      // Back after short delay
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(
        err?.message ||
          "حدث خطأ أثناء رفع الصورة."
      );
    } finally {
      setUploading(false);
    }
  }

  // ==========================================
  // Loading
  // ==========================================

  if (loadingUser) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2
            size={22}
            className="animate-spin text-orange-500"
          />

          <span className="font-bold">
            جاري تحميل الحساب...
          </span>
        </div>
      </main>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-white text-slate-950"
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
          >
            <ArrowRight size={18} />

            العودة للملف الشخصي
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm sm:flex">
            <ShieldCheck
              size={16}
              className="text-emerald-500"
            />

            صورة الحساب
          </div>
        </div>

        {/* Main */}
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,.10)] lg:grid-cols-[.9fr_1.1fr]">
          {/* Visual */}
          <section className="relative overflow-hidden bg-slate-950 p-8 sm:p-12 lg:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70 backdrop-blur">
                <Camera
                  size={15}
                  className="text-orange-400"
                />

                SENDLY / AVATAR
              </div>

              <h1 className="max-w-md text-4xl font-black leading-tight text-white sm:text-5xl">
                خلي حسابك
                <span className="block bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300 bg-clip-text text-transparent">
                  لهويتك الخاصة
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm font-medium leading-7 text-white/55">
                ارفع صورتك الشخصية لتظهر في ملفك الشخصي
                والتقييمات والطلبات المرتبطة بحسابك.
              </p>

              {/* Decorative route */}
              <div className="relative mt-12 h-48 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
                <svg
                  viewBox="0 0 600 220"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="avatarRoute"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                      />

                      <stop
                        offset="50%"
                        stopColor="#06b6d4"
                      />

                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M45 170 C150 40 190 190 295 105 C390 30 455 180 555 55"
                    fill="none"
                    stroke="white"
                    strokeOpacity=".05"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />

                  <path
                    d="M45 170 C150 40 190 190 295 105 C390 30 455 180 555 55"
                    fill="none"
                    stroke="url(#avatarRoute)"
                    strokeWidth="3"
                    strokeDasharray="9 12"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="45"
                    cy="170"
                    r="7"
                    fill="#22d3ee"
                  />

                  <circle
                    cx="295"
                    cy="105"
                    r="7"
                    fill="#a78bfa"
                  />

                  <circle
                    cx="555"
                    cy="55"
                    r="8"
                    fill="#fb923c"
                  />
                </svg>

                <div className="absolute left-6 top-6 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                  <ImagePlus
                    size={22}
                    className="text-cyan-300"
                  />
                </div>

                <div className="absolute bottom-5 right-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] font-bold text-white/40">
                    الحساب
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    {user?.fullName || "Sendly User"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="p-6 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-xl">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                  Profile Photo
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  تغيير الصورة الشخصية
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  اختر صورة واضحة لاستخدامها في حسابك.
                </p>
              </div>

              {/* Avatar preview */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-500/15 via-cyan-400/10 to-violet-500/15 blur-xl" />

                  <div className="relative h-48 w-48 overflow-hidden rounded-full border-8 border-white bg-slate-100 shadow-[0_25px_70px_rgba(15,23,42,.15)] ring-1 ring-slate-200">
                    {preview ? (
                      <Image
                        src={preview}
                        alt={
                          user?.fullName ||
                          "Profile"
                        }
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User2
                          size={80}
                          className="text-slate-300"
                        />
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:scale-105"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* File picker */}
              <label className="group block cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                <div className="rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition group-hover:border-orange-300 group-hover:bg-orange-50/40">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20 transition group-hover:scale-110">
                    <Upload size={24} />
                  </div>

                  <h3 className="mt-4 text-base font-black text-slate-900">
                    {selectedFile
                      ? selectedFile.name
                      : "اختر صورة من جهازك"}
                  </h3>

                  <p className="mt-2 text-xs font-bold text-slate-400">
                    JPG / PNG / WEBP / AVIF
                    <span className="mx-2">
                      •
                    </span>
                    الحد الأقصى 5MB
                  </p>
                </div>
              </label>

              {/* Messages */}
              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
                  <CheckCircle2 size={18} />

                  {success}
                </div>
              )}

              {/* Upload button */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    جاري رفع الصورة...
                  </>
                ) : (
                  <>
                    <Camera size={20} />

                    حفظ الصورة
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
                <ShieldCheck
                  size={15}
                  className="text-emerald-500"
                />

                الصورة سيتم تخزينها بأمان على Cloudinary
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}