"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  Camera,
  ChevronLeft,
  Lock,
  LogOut,
  Pencil,
  ShieldCheck,
  Truck,
  Trash2,
  User2,
  Sparkles,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { useAuthStore, type User as UserType } from "@/store/auth";

export default function ProfileClient({
  initialUser,
}: {
  initialUser: UserType;
}) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser(initialUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  const displayUser = user ?? initialUser;

  const roleLabel =
    displayUser?.role === "admin"
      ? "مدير المنصة"
      : displayUser?.role === "driver"
      ? "كابتن توصيل"
      : "عميل مميز";

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f8fafc] pb-24 text-slate-950 antialiased"
    >
      <style jsx global>{`
        @keyframes profileFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes profilePulse {
          0%, 100% { transform: scale(.92); opacity: .45; }
          50% { transform: scale(1.08); opacity: .9; }
        }

        @keyframes profileUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-up {
          animation: profileUp .65s ease-out both;
        }

        .profile-float {
          animation: profileFloat 4.5s ease-in-out infinite;
        }

        .profile-pulse {
          animation: profilePulse 2.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-up,
          .profile-float,
          .profile-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_35px_100px_-30px_rgba(15,23,42,.55)] sm:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(6,182,212,.14),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(249,115,22,.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,.14),transparent_35%)]" />

            <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:42px_42px]" />

            <div className="relative grid min-h-[600px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[.9fr_1.1fr] lg:px-16 lg:py-16 xl:min-h-[650px] xl:px-20">
              {/* PROFILE VISUAL */}
              <div className="order-2 lg:order-1">
                <div className="relative mx-auto max-w-[580px]">
                  <div className="absolute -inset-12 rounded-full bg-orange-500/10 blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black text-white/60">
                        SENDLY / PROFILE
                      </div>
                    </div>

                    <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/70">
                      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                      <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

                      {/* Decorative route */}
                      <svg
                        viewBox="0 0 560 360"
                        className="absolute inset-0 h-full w-full opacity-70"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="profileRoute" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                        </defs>

                        <path
                          d="M40 275 C130 120 205 315 300 185 C370 90 435 235 520 75"
                          fill="none"
                          stroke="white"
                          strokeOpacity=".07"
                          strokeWidth="22"
                          strokeLinecap="round"
                        />

                        <path
                          d="M40 275 C130 120 205 315 300 185 C370 90 435 235 520 75"
                          fill="none"
                          stroke="url(#profileRoute)"
                          strokeWidth="3"
                          strokeDasharray="10 13"
                          strokeLinecap="round"
                        />

                        <circle cx="40" cy="275" r="7" fill="#22d3ee" className="profile-pulse" />
                        <circle cx="520" cy="75" r="8" fill="#fb923c" className="profile-pulse" />

                        <circle cx="300" cy="185" r="6" fill="#a78bfa" className="profile-pulse" />
                      </svg>

                      {/* Avatar */}
                      <div className="relative z-10">
                        <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-orange-500/20 via-cyan-400/10 to-violet-500/20 blur-2xl" />

                        <div className="relative h-40 w-40 overflow-hidden rounded-full border-[6px] border-white/10 bg-slate-800 shadow-[0_25px_70px_rgba(0,0,0,.45)] ring-4 ring-orange-500/20 sm:h-48 sm:w-48">
                          {displayUser?.avatar ? (
                            <Image
                              src={displayUser.avatar}
                              alt={displayUser.fullName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User2 size={78} className="text-slate-500" />
                            </div>
                          )}
                        </div>

                        <Link
                          href="/profile/avatar"
                          aria-label="تغيير الصورة الشخصية"
                          className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-xl shadow-orange-500/20 transition hover:scale-110"
                        >
                          <Camera size={19} />
                        </Link>
                      </div>

                      <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                          <span className="text-[11px] font-black text-white">
                            الحساب نشط
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                        <Mail size={17} className="text-cyan-300" />
                        <p className="mt-2 text-[10px] font-bold text-white/40">
                          البريد
                        </p>
                        <p className="mt-1 truncate text-xs font-black text-white/80">
                          {displayUser?.email || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                        <Phone size={17} className="text-orange-300" />
                        <p className="mt-2 text-[10px] font-bold text-white/40">
                          الهاتف
                        </p>
                        <p className="mt-1 truncate text-xs font-black text-white/80" dir="ltr">
                          {displayUser?.phone || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                        <MapPin size={17} className="text-emerald-300" />
                        <p className="mt-2 text-[10px] font-bold text-white/40">
                          الموقع
                        </p>
                        <p className="mt-1 truncate text-xs font-black text-white/80">
                          {displayUser?.city || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFILE TEXT */}
              <div className="order-1 text-center lg:order-2 lg:text-right">
                <div className="profile-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-black text-white backdrop-blur">
                  <Sparkles size={14} className="text-amber-300" />
                  حسابك على Sendly
                </div>

                <h1
                  className="profile-up text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ animationDelay: "80ms" }}
                >
                  أهلاً بك،
                  <br />
                  <span className="bg-gradient-to-l from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                    {displayUser?.fullName || "في Sendly"}
                  </span>
                </h1>

                <p
                  className="profile-up mx-auto mt-6 max-w-xl text-sm leading-8 text-slate-300 sm:text-base lg:mx-0"
                  style={{ animationDelay: "150ms" }}
                >
                  هنا تقدر تدير بيانات حسابك، تحمي حسابك، وتتحكم في أهم
                  إعدادات ملفك الشخصي من مكان واحد.
                </p>

                <div
                  className="profile-up mt-7 flex flex-wrap justify-center gap-2 lg:justify-start"
                  style={{ animationDelay: "200ms" }}
                >
                  <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-[11px] font-black text-orange-300">
                    {roleLabel}
                  </span>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-black text-emerald-300">
                    حساب نشط
                  </span>
                </div>

                <div
                  className="profile-up mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl"
                  style={{ animationDelay: "260ms" }}
                >
                  {[
                    { icon: ShieldCheck, label: "أمان", color: "text-cyan-300" },
                    { icon: Truck, label: "توصيل", color: "text-orange-300" },
                    { icon: User2, label: "بياناتك", color: "text-violet-300" },
                    { icon: Lock, label: "حماية", color: "text-emerald-300" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center backdrop-blur transition hover:bg-white/[0.1]"
                      >
                        <Icon size={18} className={`mx-auto ${item.color}`} />
                        <p className="mt-2 text-[10px] font-black text-white/60">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT CONTROL */}
      <section className="relative z-10 mx-auto -mt-7 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,.35)] sm:p-7 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="text-[11px] font-black text-orange-500">
                الحساب والإعدادات
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                تحكم في حسابك
              </h2>
            </div>

            <p className="text-xs font-bold text-slate-400">
              كل أدوات الحساب في مكان واحد
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Edit */}
            <Link
              href="/profile/edit"
              className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-orange-100/60 blur-2xl opacity-0 transition group-hover:opacity-100" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100 transition group-hover:bg-orange-500 group-hover:text-white">
                    <Pencil size={20} />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-800">تعديل البيانات</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      الاسم، الهاتف، البريد الإلكتروني وبيانات الملف
                    </p>
                  </div>
                </div>

                <ChevronLeft className="shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500" size={19} />
              </div>
            </Link>

            {/* Password */}
            <Link
              href="/profile/change-password"
              className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-white hover:shadow-xl hover:shadow-cyan-500/5"
            >
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-100/60 blur-2xl opacity-0 transition group-hover:opacity-100" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 transition group-hover:bg-cyan-500 group-hover:text-white">
                    <Lock size={20} />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-800">
                      تغيير كلمة المرور
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      تحديث كلمة المرور وتقوية حماية الحساب
                    </p>
                  </div>
                </div>

                <ChevronLeft className="shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-cyan-600" size={19} />
              </div>
            </Link>

            {/* Become Driver */}
            {displayUser?.role === "customer" && (
              <Link
                href="/become-driver"
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/60 blur-2xl opacity-0 transition group-hover:opacity-100" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition group-hover:bg-emerald-500 group-hover:text-white">
                      <Truck size={20} />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-800">
                        انضم إلينا كمندوب
                      </h3>
                      <p className="mt-1 text-xs leading-6 text-slate-400">
                        انضم لفريق التوصيل وابدأ في استقبال الطلبات
                      </p>
                    </div>
                  </div>

                  <ChevronLeft className="shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-emerald-500" size={19} />
                </div>
              </Link>
            )}
          </div>

          {/* DANGER */}
          <div className="mt-9 border-t border-slate-100 pt-8">
            <div className="mb-4">
              <span className="text-[11px] font-black text-rose-500">
                المنطقة الحساسة
              </span>
              <h3 className="mt-1 text-lg font-black text-slate-800">
                إجراءات الحساب
              </h3>
            </div>

            <div className="space-y-3">
              <Link
                href="/profile/logout"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-rose-200 hover:bg-white hover:shadow-lg hover:shadow-rose-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition group-hover:bg-rose-500 group-hover:text-white">
                    <LogOut size={18} />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-700">
                      تسجيل الخروج
                    </h4>
                    <p className="mt-1 text-xs text-slate-400">
                      إنهاء جلسة الحساب من هذا الجهاز
                    </p>
                  </div>
                </div>

                <ChevronLeft
                  size={18}
                  className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-rose-500"
                />
              </Link>

              <Link
                href="/profile/delete-account"
                className="group flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/30 p-4 transition hover:bg-rose-50 hover:shadow-lg hover:shadow-rose-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition group-hover:scale-105">
                    <Trash2 size={18} />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-rose-600">
                      حذف الحساب نهائياً
                    </h4>
                    <p className="mt-1 text-xs text-rose-400">
                      حذف بيانات الحساب بشكل نهائي
                    </p>
                  </div>
                </div>

                <ChevronLeft
                  size={18}
                  className="text-rose-400 transition group-hover:-translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
