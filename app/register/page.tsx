"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Star,
  CheckCircle2,
} from "lucide-react";

import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { register } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    server: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
      server: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      server: "",
    });

    try {
      setLoading(true);

      const res = await register(form);

      if (!res?.user) {
        throw new Error("تعذر إنشاء الحساب. حاول مرة أخرى.");
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
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        server: error?.message || "حدث خطأ ما أثناء التسجيل.",
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
    setGoogleLoading(true);

    // غيّر المسار فقط إذا كان Google OAuth عندك على endpoint مختلف.
    window.location.href = "/api/auth/google";
  }

  return (
    <AuthLayout title="" description="">
      <main className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-6 lg:px-8">
        {/* Background atmosphere */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-orange-300/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-300/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] items-center">
          <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-[0_40px_120px_-35px_rgba(15,23,42,.55)] lg:min-h-[800px] lg:grid-cols-[1.15fr_.85fr] xl:min-h-[840px]">

            {/* =================================================
                LEFT — SENDLY VISUAL
            ================================================== */}
            <section className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
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
                  انضم لعالم
                  <br />
                  <span className="bg-gradient-to-l from-amber-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                    Sendly.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                  أنشئ حسابك وخلي إدارة الشحنات والتوصيل أسهل، أوضح، وأسرع.
                </p>
              </div>

              {/* Illustration */}
              <div className="relative z-10 mx-auto my-7 w-full max-w-[650px] flex-1">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[90px]" />

                <svg
                  viewBox="0 0 700 390"
                  className="relative h-full min-h-[330px] w-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="registerRouteGradient" x1="70" y1="310" x2="630" y2="85">
                      <stop offset="0" stopColor="#22d3ee" />
                      <stop offset=".5" stopColor="#f97316" />
                      <stop offset="1" stopColor="#fbbf24" />
                    </linearGradient>

                    <filter id="registerGlow">
                      <feGaussianBlur stdDeviation="10" result="blur" />
                    </filter>
                  </defs>

                  <path
                    d="M70 305 C170 340 215 220 310 250 C405 280 450 105 630 90"
                    stroke="url(#registerRouteGradient)"
                    strokeWidth="4"
                    strokeDasharray="12 14"
                    strokeLinecap="round"
                    opacity=".8"
                  />

                  <path
                    d="M70 305 C170 340 215 220 310 250 C405 280 450 105 630 90"
                    stroke="#f97316"
                    strokeWidth="16"
                    opacity=".12"
                    filter="url(#registerGlow)"
                  />

                  {/* Start */}
                  <circle cx="70" cy="305" r="27" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
                  <circle cx="70" cy="305" r="8" fill="#22d3ee" />

                  {/* Package */}
                  <g transform="translate(285 205)">
                    <rect width="50" height="50" rx="14" fill="#f97316" />
                    <path d="M14 18 25 12 36 18 25 24 14 18Z" fill="#fff" />
                    <path d="M14 18v16l11 6V24M36 18v16l-11 6" stroke="#fff" strokeWidth="2" />
                  </g>

                  {/* Destination */}
                  <circle cx="630" cy="90" r="31" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
                  <path
                    d="M630 72c-9 0-16 7-16 16 0 12 16 25 16 25s16-13 16-25c0-9-7-16-16-16Z"
                    fill="#f97316"
                  />
                  <circle cx="630" cy="88" r="5" fill="#fff" />

                  {/* Car */}
                  <g className="animate-[sendlyFloat_5s_ease-in-out_infinite]">
                    <rect x="405" y="165" width="145" height="58" rx="20" fill="url(#registerRouteGradient)" />
                    <path d="M430 165 450 137h65l23 28Z" fill="#1e293b" />
                    <path d="M456 143h26v18h-40ZM488 143h25l17 18h-42Z" fill="#334155" />

                    <circle cx="438" cy="225" r="16" fill="#0f172a" stroke="#475569" strokeWidth="6" />
                    <circle cx="516" cy="225" r="16" fill="#0f172a" stroke="#475569" strokeWidth="6" />

                    <circle cx="548" cy="184" r="6" fill="#fef3c7" />
                  </g>
                </svg>

                {/* floating feature cards */}
                <div className="absolute left-3 top-8 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Truck size={19} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-white/40">
                        مع Sendly
                      </p>
                      <p className="mt-1 text-xs font-black text-white">
                        رحلتك أوضح
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-7 right-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-white/40">
                        حسابك
                      </p>
                      <p className="mt-1 text-xs font-black text-white">
                        جاهز تبدأ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* benefits */}
              <div className="relative z-10 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "آمن",
                    text: "حسابك محمي",
                  },
                  {
                    icon: Star,
                    title: "موثوق",
                    text: "تقييمات حقيقية",
                  },
                  {
                    icon: Package,
                    title: "منظم",
                    text: "كل شحناتك معًا",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md"
                    >
                      <Icon size={17} className="text-orange-400" />
                      <p className="mt-3 text-xs font-black text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-white/35">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                RIGHT — REGISTER
            ================================================== */}
            <section className="relative flex items-center bg-white p-6 sm:p-10 lg:p-12 xl:p-16">
              <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-100/70 blur-[90px]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-50 blur-[80px]" />

              <div className="relative z-10 mx-auto w-full max-w-[500px]">
                {/* logo */}
                <div className="mb-7 flex items-center justify-between">
                  <Link href="/" className="group flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20 transition group-hover:scale-105">
                      <Package size={22} />
                    </div>

                    <div>
                      <p className="text-xl font-black text-slate-950">
                        Sendly
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        توصيل بشكل أذكى
                      </p>
                    </div>
                  </Link>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Sparkles size={17} />
                  </div>
                </div>

                {/* heading */}
                <div className="mb-7">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black text-orange-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    إنشاء حساب
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    ابدأ رحلتك
                    <br />
                    <span className="bg-gradient-to-l from-orange-500 to-amber-400 bg-clip-text text-transparent">
                      مع Sendly.
                    </span>
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    حساب واحد، وكل شحناتك في مكان واحد.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-sm font-black">
                        G
                      </span>
                    )}

                    {googleLoading
                      ? "جاري فتح Google..."
                      : "التسجيل باستخدام Google"}
                  </button>

                  <div className="flex items-center gap-4 py-1">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300">
                      أو أنشئ حسابك يدويًا
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-xs font-black text-slate-700"
                    >
                      الاسم بالكامل
                    </label>

                    <div className="group relative">
                      <User className="absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-orange-500" />

                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        required
                        autoComplete="name"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="محمد أحمد"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-4 pr-12 text-sm font-medium text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-black text-slate-700"
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

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-xs font-black text-slate-700"
                    >
                      رقم الهاتف
                    </label>

                    <div className="group relative">
                      <Phone className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition group-focus-within:text-orange-500" />

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        required
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="01xxxxxxxxx"
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

                  {/* Server error */}
                  {errors.server && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-6 text-red-600"
                    >
                      {errors.server}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-950 py-4 font-black text-white shadow-xl shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    {loading ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />
                        جاري تهيئة حسابك...
                      </>
                    ) : (
                      <>
                        إنشاء حساب جديد
                        <ArrowLeft
                          size={17}
                          className="transition-transform group-hover:-translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  {/* trust */}
                  <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold text-slate-400">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    بياناتك محفوظة بشكل آمن
                  </div>

                  {/* Login */}
                  <div className="border-t border-slate-100 pt-5 text-center">
                    <p className="text-sm font-medium text-slate-400">
                      لديك حساب بالفعل؟
                      <Link
                        href="/login"
                        className="mr-1.5 font-black text-orange-500 transition hover:text-orange-600"
                      >
                        تسجيل الدخول
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
