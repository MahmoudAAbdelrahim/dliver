"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
  Zap,
  Sparkles,
  Package,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

type Role = "guest" | "customer" | "driver" | "admin";

interface AboutPageProps {
  initialUser?: any;
}

export default function AboutClient({ initialUser }: AboutPageProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    useAuthStore.persist.rehydrate();

    if (initialUser) {
      setUser(initialUser);
    } else {
      logout();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  const role: Role = initialUser?.role ?? user?.role ?? "guest";

  const actionLinks = {
    guest: [
      { title: "تسجيل الدخول", href: "/login", outline: true },
      { title: "إنشاء حساب", href: "/register", outline: false },
    ],
    customer: [
      { title: "لوحة التحكم", href: "/dashboard", outline: true },
      { title: "اشحن طلب الآن", href: "/orders/create", outline: false },
    ],
    driver: [
      { title: "طلباتي", href: "/driver/orders", outline: true },
      { title: "لوحة التحكم", href: "/driver/dashboard", outline: false },
    ],
    admin: [
      { title: "لوحة التحكم", href: "/admin/dashboard", outline: false },
    ],
  };

  const links = actionLinks[role];

  const features = [
    {
      icon: ShieldCheck,
      title: "أمان موثوق",
      text: "حماية أفضل للحسابات والبيانات مع تجربة واضحة.",
      tone: "blue",
    },
    {
      icon: Zap,
      title: "تجربة سريعة",
      text: "خطوات بسيطة من إنشاء الطلب وحتى إتمام التوصيل.",
      tone: "orange",
    },
    {
      icon: Users,
      title: "عملاء ومندوبون",
      text: "منصة تجمع طرفي عملية التوصيل في تجربة واحدة.",
      tone: "violet",
    },
    {
      icon: MapPin,
      title: "تتبع واضح",
      text: "اعرف حالة طلبك وتابع رحلته بسهولة.",
      tone: "emerald",
    },
  ] as const;

  const toneClasses = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950"
    >
      <style jsx global>{`
        @keyframes sendlyAboutFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(0.7deg); }
        }

        @keyframes sendlyAboutPulse {
          0%, 100% { transform: scale(.9); opacity: .45; }
          50% { transform: scale(1.08); opacity: .9; }
        }

        @keyframes sendlyAboutDash {
          to { stroke-dashoffset: -70; }
        }

        @keyframes sendlyAboutUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sendly-about-up {
          animation: sendlyAboutUp .7s ease-out both;
        }

        .sendly-about-float {
          animation: sendlyAboutFloat 4.5s ease-in-out infinite;
        }

        .sendly-about-pulse {
          animation: sendlyAboutPulse 2.5s ease-in-out infinite;
        }

        .sendly-about-dash {
          stroke-dasharray: 12 14;
          animation: sendlyAboutDash 3s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sendly-about-up,
          .sendly-about-float,
          .sendly-about-pulse,
          .sendly-about-dash {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-orange-400/10 blur-[130px]" />
        <div className="absolute -left-48 top-[30%] h-[550px] w-[550px] rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute right-[35%] top-[45%] h-[350px] w-[350px] rounded-full bg-violet-400/5 blur-[110px]" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-14 pt-5 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_35px_100px_-30px_rgba(15,23,42,.55)] sm:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(24,185,129,.14),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(249,115,22,.18),transparent_34%),radial-gradient(circle_at_55%_100%,rgba(124,58,237,.13),transparent_32%)]" />

            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:42px_42px]" />

            <div className="relative grid min-h-[680px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:px-16 lg:py-16 xl:min-h-[720px] xl:px-20">
              {/* Visual */}
              <div className="order-2 lg:order-1">
                <div className="relative mx-auto max-w-[650px]">
                  <div className="absolute -inset-10 rounded-full bg-orange-500/10 blur-3xl" />
                  <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black text-white/70">
                        SENDLY / ABOUT
                      </div>
                    </div>

                    <svg
                      viewBox="0 0 720 470"
                      className="h-auto w-full"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="aboutRoad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="48%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="aboutCar" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="55%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <filter id="aboutGlow">
                          <feGaussianBlur stdDeviation="12" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      <circle cx="105" cy="95" r="62" fill="#06b6d4" opacity=".07" />
                      <circle cx="610" cy="95" r="72" fill="#f97316" opacity=".08" />
                      <circle cx="350" cy="380" r="95" fill="#7c3aed" opacity=".06" />

                      {/* Route */}
                      <path
                        d="M95 310 C190 175 275 405 375 245 C465 100 545 290 625 145"
                        fill="none"
                        stroke="white"
                        strokeOpacity=".08"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      <path
                        d="M95 310 C190 175 275 405 375 245 C465 100 545 290 625 145"
                        fill="none"
                        stroke="url(#aboutRoad)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        className="sendly-about-dash"
                      />

                      {/* Pickup */}
                      <g transform="translate(95 310)">
                        <circle r="30" fill="#06b6d4" opacity=".16" />
                        <circle r="11" fill="#22d3ee" />
                        <circle r="20" fill="none" stroke="#22d3ee" strokeOpacity=".45" strokeWidth="2" className="sendly-about-pulse" />
                      </g>

                      {/* Destination */}
                      <g transform="translate(625 145)">
                        <circle r="34" fill="#f97316" opacity=".16" />
                        <path
                          d="M0-20c-13 0-23 10-23 23 0 17 23 39 23 39S23 20 23 3C23-10 13-20 0-20Z"
                          fill="#fb923c"
                          filter="url(#aboutGlow)"
                        />
                        <circle cy="3" r="7" fill="#0f172a" />
                      </g>

                      {/* Package */}
                      <g transform="translate(355 235)" className="sendly-about-float">
                        <rect x="-48" y="-44" width="96" height="88" rx="20" fill="#fff" opacity=".08" stroke="#fff" strokeOpacity=".13" />
                        <path d="M-25-14 0-28 25-14 0 0Z" fill="#fbbf24" />
                        <path d="M-25-14v31L0 32V0Z" fill="#f59e0b" />
                        <path d="M25-14v31L0 32V0Z" fill="#d97706" />
                        <path d="M0-28v28" stroke="#fff" strokeOpacity=".75" strokeWidth="3" />
                      </g>

                      {/* Car */}
                      <g transform="translate(360 350)">
                        <ellipse cx="0" cy="42" rx="115" ry="17" fill="#000" opacity=".3" />
                        <path d="M-94 25h188l-14-55c-4-16-16-27-33-29l-35-4-22-27h-65c-15 0-26 9-32 24l-16 36-9 55c-2 14 9 26 23 26Z" fill="url(#aboutCar)" />
                        <path d="M-37-83h43l25 30h-89c5-18 10-30 21-30Z" fill="#dff7ff" opacity=".9" />
                        <path d="M18-83h36c12 2 19 10 23 30H43Z" fill="#b9efff" opacity=".8" />
                        <rect x="-82" y="-8" width="164" height="20" rx="10" fill="#fff" opacity=".12" />
                        <rect x="-72" y="3" width="35" height="9" rx="4" fill="#fff" opacity=".75" />
                        <rect x="37" y="3" width="35" height="9" rx="4" fill="#fff" opacity=".75" />
                        <circle cx="-61" cy="37" r="22" fill="#0f172a" />
                        <circle cx="61" cy="37" r="22" fill="#0f172a" />
                        <circle cx="-61" cy="37" r="9" fill="#94a3b8" />
                        <circle cx="61" cy="37" r="9" fill="#94a3b8" />
                      </g>
                    </svg>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-[9px] font-bold text-white/40">البداية</p>
                        <p className="mt-1 text-xs font-black text-cyan-300">استلام</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-[9px] font-bold text-white/40">الحالة</p>
                        <p className="mt-1 text-xs font-black text-emerald-300">في الطريق</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-[9px] font-bold text-white/40">النهاية</p>
                        <p className="mt-1 text-xs font-black text-orange-300">تسليم</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="order-1 text-center lg:order-2 lg:text-right">
                <div className="sendly-about-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-black text-white backdrop-blur">
                  <Sparkles size={14} className="text-amber-300" />
                  عن Sendly
                </div>

                <h1
                  className="sendly-about-up text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ animationDelay: "80ms" }}
                >
                  التوصيل مش مجرد
                  <br />
                  <span className="bg-gradient-to-l from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                    شحنة من مكان لمكان.
                  </span>
                </h1>

                <p
                  className="sendly-about-up mx-auto mt-6 max-w-xl text-sm leading-8 text-slate-300 sm:text-base lg:mx-0"
                  style={{ animationDelay: "150ms" }}
                >
                  Sendly منصة مصممة لتخلي عملية التوصيل أوضح وأسهل؛
                  من إنشاء الطلب، للمتابعة، لحد ما الشحنة توصل لوجهتها.
                </p>

                <div
                  className="sendly-about-up mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
                  style={{ animationDelay: "220ms" }}
                >
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={
                        link.outline
                          ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                          : "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-orange-500 to-amber-400 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30"
                      }
                    >
                      {link.title}
                      {!link.outline && <ArrowLeft size={17} />}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {["سهولة", "سرعة", "أمان", "متابعة"].map((item, index) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-white/65"
                    >
                      <span
                        className={[
                          "ml-1.5 inline-block h-1.5 w-1.5 rounded-full",
                          index === 0
                            ? "bg-cyan-400"
                            : index === 1
                            ? "bg-orange-400"
                            : index === 2
                            ? "bg-emerald-400"
                            : "bg-violet-400",
                        ].join(" ")}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-2xl sm:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                <Package size={26} />
              </div>

              <h3 className="text-2xl font-black text-white sm:text-3xl">
                كل خطوة محسوبة.
                <br />
                <span className="text-orange-400">وكل طلب له طريق.</span>
              </h3>

              <p className="mt-4 text-sm leading-8 text-slate-400">
                بنبني Sendly حول تجربة عملية ومباشرة تجمع العميل والمندوب
                وتخلي تفاصيل عملية التوصيل أسهل في المتابعة.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, title: "سرعة", color: "text-orange-400" },
                  { icon: ShieldCheck, title: "أمان", color: "text-cyan-400" },
                  { icon: MapPin, title: "وضوح", color: "text-emerald-400" },
                  { icon: Clock3, title: "متابعة", color: "text-violet-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
                    >
                      <Icon size={20} className={item.color} />
                      <p className="mt-3 text-sm font-black text-white">
                        {item.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-[11px] font-black text-blue-700">
              من نحن؟
            </span>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              بنبني تجربة توصيل
              <span className="bg-gradient-to-l from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
                {" "}
                تعتمد على الثقة والوضوح.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-slate-500 sm:text-base">
              في Sendly نؤمن إن خدمة التوصيل الجيدة لازم تكون سهلة الفهم
              وسريعة في الاستخدام. لذلك صممنا المنصة بحيث تجمع أهم الخطوات
              في تجربة واحدة واضحة.
            </p>

            <p className="mt-4 text-sm leading-8 text-slate-500 sm:text-base">
              سواء كنت عميلاً تريد إرسال طلب أو مندوباً يدير عمليات التوصيل،
              الهدف هو أن تكون كل مرحلة واضحة من البداية وحتى التسليم.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "إنشاء وإدارة الطلبات",
                "متابعة حالة الشحنة",
                "ربط العملاء بالمندوبين",
                "إدارة الحسابات بأمان",
              ].map((item, index) => (
                <div
                  key={item}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                >
                  <div
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      index % 2 === 0
                        ? "bg-orange-50 text-orange-500"
                        : "bg-cyan-50 text-cyan-600",
                    ].join(" ")}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-[11px] font-black text-orange-600">
              لماذا Sendly؟
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              صممنا المنصة حول احتياجاتك
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              أدوات بسيطة للعميل، تجربة عملية للمندوب، ونظام واضح لإدارة
              عملية التوصيل.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-slate-50/70 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/60"
                >
                  <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-orange-100/50 blur-2xl opacity-0 transition group-hover:opacity-100" />

                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClasses[item.tone]}`}
                  >
                    <Icon size={22} />
                  </div>

                  <h3 className="relative mt-5 text-base font-black text-slate-800">
                    {item.title}
                  </h3>

                  <p className="relative mt-2 text-sm leading-7 text-slate-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-12 shadow-2xl sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(6,182,212,.16),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(249,115,22,.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,.15),transparent_35%)]" />

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-amber-300 backdrop-blur">
              <Truck size={26} />
            </div>

            <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
              {role === "guest"
                ? "جاهز تبدأ مع Sendly؟"
                : role === "customer"
                ? "جاهز لشحن طلبك؟"
                : role === "driver"
                ? "جاهز لاستلام طلباتك؟"
                : "مرحباً بك في لوحة التحكم"}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-slate-400 sm:text-base">
              {role === "guest"
                ? "أنشئ حسابك الآن وابدأ تجربة توصيل أبسط وأكثر تنظيماً."
                : role === "customer"
                ? "أنشئ طلب التوصيل الخاص بك وابدأ الآن."
                : role === "driver"
                ? "تابع طلباتك وعمليات التوصيل من لوحة التحكم."
                : "يمكنك إدارة المنصة ومتابعة العمليات من لوحة التحكم."}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-orange-500 to-amber-400 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30"
                >
                  {link.title}
                  <ArrowLeft size={17} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
