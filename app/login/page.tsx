"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Loader2,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
  Package,
  Truck,
  Star,
  CircleHelp,
} from "lucide-react";

import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";

import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await login(form);

      if (!res?.user) {
        throw new Error("خطأ في البريد الإلكتروني أو كلمة المرور.");
      }

      setUser(res.user);

      switch (res.user.role) {
        case "admin":
          router.replace("/admin/dashboard");
          break;
        case "driver":
          router.replace("/driver/dashboard");
          break;
        default:
          router.replace("/");
      }
    } catch (err: any) {
      setError(
        err?.message || "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");

    // غيّر المسار فقط إذا كان endpoint Google OAuth عندك مختلفًا.
    window.location.href = "/api/auth/google";
  }

  return (
    <AuthLayout
      title="مرحباً بك من جديد"
      description="سجّل دخولك وتابع رحلتك مع Sendly."
    >
      <div className="relative min-h-screen">
        {/* الخلفية */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-400/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-3 py-4 sm:px-6 lg:px-8">
          <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_40px_120px_-35px_rgba(15,23,42,.55)] lg:min-h-[760px] lg:grid-cols-[1.15fr_.85fr] xl:min-h-[800px]">

            {/* ================= LEFT ================= */}
            <section className="relative hidden overflow-hidden p-8 sm:p-10 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.045]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                  backgroundSize: "46px 46px",
                }}
              />

              <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[110px]" />
              <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black text-white/80 backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Sendly — توصيل بشكل أذكى
                </div>

                <h1 className="mt-9 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-[4.5rem]">
                  شحنتك تبدأ هنا،
                  <br />
                  <span className="bg-gradient-to-l from-amber-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                    وتوصل لحد آخر باب.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                  كل شحنة لها رحلة. وكل رحلة لها تفاصيل. مع Sendly تتابع
                  طلبك من لحظة إنشائه حتى التسليم والتقييم.
                </p>
              </div>

              {/* Illustration */}
              <div className="relative z-10 mx-auto my-8 w-full max-w-[650px] flex-1">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[90px]" />

                {/* route */}
                <svg
                  viewBox="0 0 700 390"
                  className="relative h-full min-h-[330px] w-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="sendlyRouteGradient" x1="80" y1="290" x2="620" y2="80">
                      <stop offset="0" stopColor="#22d3ee" />
                      <stop offset=".5" stopColor="#f97316" />
                      <stop offset="1" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id="sendlyGlow">
                      <feGaussianBlur stdDeviation="10" result="blur" />
                    </filter>
                  </defs>

                  <path
                    d="M80 300 C180 340 210 230 310 250 C410 270 430 110 620 105"
                    stroke="url(#sendlyRouteGradient)"
                    strokeWidth="4"
                    strokeDasharray="12 14"
                    strokeLinecap="round"
                    opacity=".75"
                  />

                  <path
                    d="M80 300 C180 340 210 230 310 250 C410 270 430 110 620 105"
                    stroke="#f97316"
                    strokeWidth="16"
                    opacity=".12"
                    filter="url(#sendlyGlow)"
                  />

                  {/* pickup */}
                  <g>
                    <circle cx="80" cy="300" r="26" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
                    <circle cx="80" cy="300" r="8" fill="#22d3ee" />
                    <text x="80" y="348" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="700">
                      استلام
                    </text>
                  </g>

                  {/* package */}
                  <g transform="translate(285 205)">
                    <rect width="50" height="50" rx="14" fill="#f97316" />
                    <path d="M14 18 25 12 36 18 25 24 14 18Z" fill="#fff" opacity=".95" />
                    <path d="M14 18v16l11 6V24M36 18v16l-11 6" stroke="#fff" strokeWidth="2" />
                  </g>

                  {/* destination */}
                  <g>
                    <circle cx="620" cy="105" r="31" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
                    <path
                      d="M620 87c-9 0-16 7-16 16 0 12 16 25 16 25s16-13 16-25c0-9-7-16-16-16Z"
                      fill="#f97316"
                    />
                    <circle cx="620" cy="103" r="5" fill="#fff" />
                    <text x="620" y="155" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="700">
                      التسليم
                    </text>
                  </g>

                  {/* car */}
                  <g className="animate-[sendlyFloat_5s_ease-in-out_infinite]">
                    <rect x="405" y="165" width="145" height="58" rx="20" fill="url(#sendlyRouteGradient)" />
                    <path d="M430 165 450 137h65l23 28Z" fill="#1e293b" />
                    <path d="M456 143h26v18h-40ZM488 143h25l17 18h-42Z" fill="#334155" />
                    <circle cx="438" cy="225" r="16" fill="#0f172a" stroke="#475569" strokeWidth="6" />
                    <circle cx="516" cy="225" r="16" fill="#0f172a" stroke="#475569" strokeWidth="6" />
                    <circle cx="548" cy="184" r="6" fill="#fef3c7" />
                  </g>
                </svg>

                {/* floating cards */}
                <div className="absolute left-4 top-8 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Truck size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40">الشحنة الآن</p>
                      <p className="mt-1 text-xs font-black text-white">في الطريق إليك</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-7 right-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                      <Star size={18} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40">بعد التسليم</p>
                      <p className="mt-1 text-xs font-black text-white">قيّم تجربتك</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-white/65">تجربة آمنة</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5">
                  <Star size={15} className="text-amber-400" fill="currentColor" />
                  <span className="text-[10px] font-black text-white/65">تقييمات حقيقية</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5">
                  <Package size={15} className="text-cyan-300" />
                  <span className="text-[10px] font-black text-white/65">تتبع واضح</span>
                </div>
              </div>
            </section>

            {/* ================= RIGHT ================= */}
            <section className="relative flex items-center bg-white p-6 sm:p-10 lg:p-12 xl:p-16">
              <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-100/70 blur-[90px]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-50 blur-[80px]" />

              <div className="relative z-10 mx-auto w-full max-w-[500px]">
                <div className="mb-8 flex items-center justify-between">
                  <Link href="/" className="group flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20 transition group-hover:scale-105">
                      <Package size={22} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-950">Sendly</p>
                      <p className="text-[10px] font-bold text-slate-400">توصيل بشكل أذكى</p>
                    </div>
                  </Link>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Sparkles size={17} />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black text-orange-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    تسجيل الدخول
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {`مرحباً بك `}
                    <span className="bg-gradient-to-l from-orange-500 to-amber-400 bg-clip-text text-transparent">
                      مجدداً.
                    </span>
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    ادخل حسابك وكمل رحلة شحنتك.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <Loader2 size={19} className="animate-spin" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-sm font-black">
                        G
                      </span>
                    )}
                    {googleLoading ? "جاري فتح Google..." : "تسجيل الدخول باستخدام Google"}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300">أو بالبريد الإلكتروني</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2.5 block text-xs font-black text-slate-700"
                    >
                      البريد الإلكتروني
                    </label>

                    <div className="group relative">
                      <Mail className="absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-orange-500" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        dir="ltr"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-4 pr-12 text-left text-sm font-medium text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <PasswordInput
                      label="كلمة المرور"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Forgot */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <LockKeyhole size={14} className="text-orange-500" />
                      بياناتك محمية
                    </div>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-black text-slate-400 transition hover:text-orange-500"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-6 text-red-600"
                    >
                      {error}
                    </div>
                  )}

                  {/* Login */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-950 py-4 font-black text-white shadow-xl shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    {loading ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        تسجيل الدخول
                        <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold text-slate-400">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    تسجيل دخول آمن ومحمي
                  </div>

                  <div className="border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm font-medium text-slate-400">
                      ليس لديك حساب؟
                      <Link
                        href="/register"
                        className="mr-1.5 font-black text-orange-500 transition hover:text-orange-600"
                      >
                        إنشاء حساب جديد
                      </Link>
                    </p>

                    <Link
                      href="/forgot-password"
                      className="mx-auto mt-4 flex w-fit items-center gap-1.5 text-[10px] font-bold text-slate-400 transition hover:text-orange-500"
                    >
                      <CircleHelp size={13} />
                      تحتاج مساعدة في الدخول؟
                    </Link>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
