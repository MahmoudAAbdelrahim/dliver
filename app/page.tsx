"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Headphones,
  Loader2,
  MapPinned,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Users,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";

type Role = "guest" | "customer" | "driver" | "admin";

type Order = {
  _id: string;
  status: string;
  deliveryFee: number;
  paymentMethod?: "cash_on_delivery" | "card";
  createdAt: string | null;
  pickup?: {
    city?: string;
    address?: string;
  };
  delivery?: {
    recipientName?: string;
    recipientPhone?: string;
    city?: string;
    governorate?: string;
    address?: string;
  };
  customer?: {
    _id?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    city?: string;
  } | null;
  driver?: {
    _id?: string;
    fullName?: string;
    phone?: string;
    avatar?: string;
    city?: string;
    driverStatus?: string;
  } | null;
  myReview?: {
    rating: number;
    comment: string;
  } | null;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  reviewerRole: "customer" | "driver";
  revieweeRole: "customer" | "driver";
  reviewerName: string;
  reviewerAvatar: string;
  revieweeName: string;
  createdAt: string | null;
};

type HomeData = {
  success: boolean;
  role: Role;
  user: {
    _id: string;
    fullName: string;
    avatar: string;
    city?: string;
    driverStatus?: string;
    isBlocked?: boolean;
    rating?: {
      average: number;
      count: number;
    };
  } | null;
  platform: {
    totalCustomers: number;
    activeDrivers: number;
    suspendedDrivers: number;
    totalOrders: number;
    deliveredOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    completedFees: number;
    driverRating: { average: number; count: number };
    customerRating: { average: number; count: number };
  };
  stats: {
    totalOrders?: number;
    activeOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    rejectedOrders?: number;
    completedFees?: number;
    pendingDrivers?: number;
    pendingOrders?: number;
    rating?: { average: number; count: number };
    driverRating?: { average: number; count: number };
    customerRating?: { average: number; count: number };
  } | null;
  recentOrders: Order[];
  recentReviews: Review[];
  pendingRatings: Order[];
  focusOrderId: string | null;
  admin: {
    suspendedDrivers: number;
    pendingDrivers: Array<{
      _id: string;
      fullName: string;
      email: string;
      phone: string;
      avatar: string;
      city: string;
      createdAt: string | null;
    }>;
    pendingAdminOrders: Array<{
      _id: string;
      createdAt: string | null;
      deliveryFee: number;
      customer: {
        fullName: string;
        phone: string;
        avatar: string;
      } | null;
    }>;
  } | null;
};

const statusMap: Record<
  string,
  { label: string; icon: typeof Clock3; tone: string }
> = {
  pending_admin: {
    label: "بانتظار مراجعة الإدارة",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  admin_rejected: {
    label: "مرفوض من الإدارة",
    icon: XCircle,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  pending_driver: {
    label: "بانتظار المندوب",
    icon: Clock3,
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
  driver_accepted: {
    label: "المندوب قبل الطلب",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  driver_rejected: {
    label: "رفضه المندوب",
    icon: XCircle,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  driver_timeout: {
    label: "انتهت مهلة المندوب",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  picked_up: {
    label: "تم استلام الشحنة",
    icon: Package,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  on_the_way: {
    label: "الشحنة في الطريق",
    icon: Truck,
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  delivered: {
    label: "تم التسليم",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  cancelled: {
    label: "ملغي",
    icon: XCircle,
    tone: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const ACTIVE_ORDER_STATUSES = new Set([
  "pending_admin",
  "pending_driver",
  "driver_accepted",
  "picked_up",
  "on_the_way",
]);

function numberFormat(value: number) {
  return new Intl.NumberFormat("ar-EG").format(value || 0);
}

function currency(value: number) {
  return `${numberFormat(value)} ج.م`;
}

function dateFormat(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      icon: Clock3,
      tone: "bg-slate-100 text-slate-600 border-slate-200",
    }
  );
}

function getOrderHref(role: Role, id: string) {
  if (role === "admin") return `/admin/orders/${id}`;
  if (role === "driver") return `/driver/orders/${id}`;
  return `/orders/${id}`;
}

function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 850;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const formatted = new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);

  return <>{formatted}</>;
}

function RatingStars({
  rating,
  interactive = false,
  onRate,
  size = 16,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (value: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((item) => {
        const active = item <= rating;
        const StarIcon = (
          <Star
            size={size}
            className={active ? "text-amber-400" : "text-slate-300"}
            fill={active ? "currentColor" : "none"}
          />
        );

        if (!interactive) {
          return <span key={item}>{StarIcon}</span>;
        }

        return (
          <button
            key={item}
            type="button"
            onClick={() => onRate?.(item)}
            className="rounded-md p-1 transition hover:scale-125"
            aria-label={`تقييم ${item} من 5`}
          >
            {StarIcon}
          </button>
        );
      })}
    </div>
  );
}

function DeliveryScene({ activeOrder }: { activeOrder: Order | null }) {
  const trackingCode = activeOrder
    ? `#${activeOrder._id.slice(-8).toUpperCase()}`
    : "#SENDLY-FAST";

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_28%_72%,rgba(59,130,246,0.16),transparent_25%)]" />

      <svg
        viewBox="0 0 1200 720"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sceneSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="58%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="van" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="parcelTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="parcelSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity="0.42" />
          </filter>
        </defs>

        <rect width="1200" height="720" fill="url(#sceneSky)" />
        <circle cx="890" cy="180" r="120" fill="#f59e0b" opacity="0.12" filter="url(#glow)" />
        <circle cx="890" cy="180" r="54" fill="#fbbf24" opacity="0.3" />

        <g opacity="0.33" fill="#111827">
          <path d="M0 425V260h86v165H0Zm96 0V210h102v215H96Zm112 0V295h72v130h-72Zm80 0V180h124v245H288Zm136 0V235h88v190h-88Zm100 0V170h104v255H524Zm116 0V250h78v175h-78Zm90 0V200h118v225H730Zm130 0V150h96v275h-96Zm108 0V250h96v175h-96Z" />
        </g>

        <g opacity="0.6" fill="none" stroke="#334155" strokeWidth="2">
          <path d="M70 330h40m35-48h52m-30 96h68m74-140h64m80 96h52m-18-55h60m-3-48h68m55 102h58m-36-72h55m-17-56h62" />
        </g>

        <path d="M0 540 C230 520 340 495 510 510 C700 525 860 548 1200 505 L1200 720 L0 720 Z" fill="#020617" />
        <path d="M0 590 C240 565 400 565 610 582 C805 598 970 612 1200 585" fill="none" stroke="url(#road)" strokeWidth="6" strokeDasharray="26 24" className="sendly-route" />
        <path d="M0 632 C210 606 370 609 570 625 C800 646 1000 644 1200 612" fill="none" stroke="#38bdf8" strokeOpacity="0.12" strokeWidth="2" />

        <g opacity="0.85">
          <circle cx="185" cy="530" r="7" fill="#fbbf24" />
          <circle cx="185" cy="530" r="18" fill="none" stroke="#fbbf24" strokeOpacity="0.28" strokeWidth="2" className="sendly-pulse" />
          <circle cx="1010" cy="540" r="7" fill="#38bdf8" />
          <circle cx="1010" cy="540" r="18" fill="none" stroke="#38bdf8" strokeOpacity="0.24" strokeWidth="2" className="sendly-pulse delay-2" />
        </g>

        <g transform="translate(820 250)" filter="url(#shadow)" className="sendly-parcel">
          <path d="M0 75 92 18 188 70 94 128Z" fill="url(#parcelTop)" />
          <path d="M0 75v116l94 57V128Z" fill="#f97316" />
          <path d="M94 128v120l94-57V70Z" fill="url(#parcelSide)" />
          <path d="M92 18v40l96 52V70Z" fill="#fdba74" opacity="0.9" />
          <path d="M82 24v37l18 10V34Z" fill="#fff7ed" opacity="0.95" />
          <path d="M95 28 181 73" stroke="#fed7aa" strokeWidth="5" opacity="0.8" />
          <rect x="108" y="104" width="46" height="32" rx="5" fill="#fff7ed" opacity="0.95" transform="rotate(28 108 104)" />
          <circle cx="106" cy="75" r="7" fill="#0f172a" opacity="0.8" />
        </g>

        <g transform="translate(300 445)" filter="url(#shadow)" className="sendly-van">
          <ellipse cx="105" cy="122" rx="150" ry="18" fill="#000" opacity="0.25" />
          <path d="M0 15h195v92H0Z" fill="url(#van)" />
          <path d="M195 40h77l42 67H195Z" fill="#ea580c" />
          <path d="M212 51h46l28 43h-74Z" fill="#38bdf8" opacity="0.9" />
          <rect x="20" y="35" width="72" height="38" rx="9" fill="#111827" opacity="0.8" />
          <rect x="31" y="45" width="50" height="18" rx="5" fill="#f8fafc" opacity="0.9" />
          <path d="M43 54h28" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="116" r="21" fill="#020617" />
          <circle cx="60" cy="116" r="9" fill="#94a3b8" />
          <circle cx="251" cy="116" r="21" fill="#020617" />
          <circle cx="251" cy="116" r="9" fill="#94a3b8" />
          <rect x="133" y="52" width="37" height="44" rx="6" fill="#fff7ed" opacity="0.9" />
          <path d="M149 62v23m-11-11h22" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="translate(180 210)">
          <path d="M0 34c0-22 18-40 40-40s40 18 40 40c0 30-40 70-40 70S0 64 0 34Z" fill="#f97316" opacity="0.9" filter="url(#glow)" />
          <circle cx="40" cy="30" r="12" fill="#0f172a" />
          <circle cx="40" cy="30" r="5" fill="#fbbf24" />
          <circle cx="40" cy="30" r="24" fill="none" stroke="#f97316" strokeOpacity="0.28" strokeWidth="3" className="sendly-pulse" />
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-5 pt-24 sm:p-7 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-md">
              <Activity size={13} className="text-emerald-300" />
              نظام تتبع حي
            </div>
            <p className="text-xs font-bold text-white/55">آخر مسار ظاهر</p>
            <p className="mt-1 text-lg font-black tracking-[0.12em] text-white">{trackingCode}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur-md">
            <p className="text-[10px] font-bold text-white/50">المسار الآن</p>
            <p className="mt-1 text-sm font-black text-white">
              {activeOrder
                ? `${activeOrder.pickup?.city || "نقطة الاستلام"} ← ${activeOrder.delivery?.city || "وجهة التسليم"}`
                : "استلام → فرز → توصيل"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  tone = "orange",
  suffix,
  caption,
}: {
  title: string;
  value: ReactNode;
  icon: typeof Box;
  href?: string;
  tone?: "orange" | "blue" | "emerald" | "violet" | "red" | "amber";
  suffix?: string;
  caption?: string;
}) {
  const tones = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    red: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-slate-100/70 blur-2xl transition duration-500 group-hover:bg-orange-100/70" />
      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tones[tone]}`}>
          <Icon size={20} />
        </div>
        {href ? (
          <ChevronLeft size={18} className="text-slate-300 transition duration-300 group-hover:-translate-x-1 group-hover:text-orange-500" />
        ) : null}
      </div>
      <p className="relative mt-5 text-xs font-bold text-slate-400">{title}</p>
      <p className="relative mt-1 text-3xl font-black tracking-tight text-slate-900">
        {value}
        {suffix ? <span className="mr-1 text-sm font-black text-slate-400">{suffix}</span> : null}
      </p>
      {caption ? <p className="relative mt-1 text-[11px] font-bold text-slate-400">{caption}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Box;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-7 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
          <Icon size={24} />
        </div>
        <p className="mt-4 text-sm font-black text-slate-600">{title}</p>
        <p className="mt-1 max-w-sm text-xs leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function RatingSummary({
  label,
  average,
  count,
  dark = false,
}: {
  label: string;
  average: number;
  count: number;
  dark?: boolean;
}) {
  return (
    <div className={dark ? "rounded-2xl border border-white/10 bg-white/5 p-4" : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={dark ? "text-[10px] font-bold text-white/45" : "text-[10px] font-bold text-slate-400"}>{label}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={dark ? "text-2xl font-black text-white" : "text-2xl font-black text-slate-900"}>
              {average ? average.toFixed(1) : "—"}
            </span>
            <RatingStars rating={average} size={14} />
          </div>
        </div>
        <div className={dark ? "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300" : "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500"}>
          <Star size={18} fill="currentColor" />
        </div>
      </div>
      <p className={dark ? "mt-2 text-[10px] font-bold text-white/35" : "mt-2 text-[10px] font-bold text-slate-400"}>
        {numberFormat(count)} تقييم
      </p>
    </div>
  );
}

function RateOrderCard({
  order,
  target,
  onSaved,
}: {
  order: Order;
  target: "driver" | "customer";
  onSaved?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submitRating(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!rating) {
      setError("اختار عدد النجوم أولًا.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/orders/${order._id}/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "تعذر حفظ التقييم.");
        return;
      }

      setSaved(true);
      onSaved?.();
    } catch {
      setError("حصل خطأ أثناء إرسال التقييم.");
    } finally {
      setSaving(false);
    }
  }

  if (saved || order.myReview) {
    const currentRating = order.myReview?.rating || rating;
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-900">تم تسجيل التقييم</p>
            <p className="mt-1 text-xs text-slate-500">تقييمك لـ {target === "driver" ? "المندوب" : "العميل"} محفوظ.</p>
          </div>
          <RatingStars rating={currentRating} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitRating} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-900">تجربتك تستاهل تقييمًا</p>
          <p className="mt-1 text-xs leading-6 text-slate-400">
            قيّم {target === "driver" ? "المندوب" : "العميل"} في الطلب #{order._id.slice(-8).toUpperCase()}.
          </p>
        </div>
        <RatingStars rating={rating} interactive onRate={setRating} size={18} />
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={500}
        rows={3}
        placeholder="اكتب تعليقًا اختياريًا عن التجربة..."
        className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
      />

      {error ? <p className="mt-2 text-xs font-bold text-rose-600">{error}</p> : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-400">من نجمة إلى خمس نجوم</span>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
          {saving ? "جارٍ الحفظ..." : "أرسل التقييم"}
        </button>
      </div>
    </form>
  );
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">
            <Star size={13} className="text-amber-500" fill="currentColor" />
            تجربة موثقة داخل المنصة
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">آخر ما قاله أهل Sendly</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">كل رأي هنا مرتبط بتقييم فعلي مسجل في قاعدة البيانات.</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[10px] font-black text-slate-500">لا توجد تقييمات تجريبية</div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="التقييمات لسه في البداية" text="أول عملية تسليم مكتملة وتقييم متبادل هتظهر هنا تلقائيًا." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <div key={review._id} className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.reviewerAvatar ? (
                    <img src={review.reviewerAvatar} alt={review.reviewerName} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-100">
                      <UserRound size={18} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-slate-900">{review.reviewerName}</p>
                    <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                      {review.reviewerRole === "customer" ? "عميل" : "مندوب"} • {dateFormat(review.createdAt)}
                    </p>
                  </div>
                </div>
                <RatingStars rating={review.rating} size={14} />
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] font-black text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                قيّم {review.revieweeName}
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {review.comment ? `“${review.comment}”` : "تقييم بالنجوم بدون تعليق."}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const HERO_CONTENT: Record<
  Role,
  {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
  }
> = {
  guest: {
    eyebrow: "توصيل أسرع، رؤية أوضح",
    title: "شحنك يبدأ هنا",
    highlight: "وتتبعه لحد آخر باب.",
    description: "Sendly يحوّل رحلة الشحنة من خطوات متفرقة إلى تجربة واحدة واضحة: إنشاء، مراجعة، استلام، تتبع، تسليم، ثم تقييم.",
  },
  customer: {
    eyebrow: "مساحتك داخل Sendly",
    title: "كل طلب عندك",
    highlight: "وكل حركة قدام عينك.",
    description: "أنشئ طلبك بسرعة، تابع المندوب، راجع حالة الشحنة، وبعد التسليم قيّم التجربة لتفضل الخدمة أفضل في كل مرة.",
  },
  driver: {
    eyebrow: "مساحة المندوب الذكية",
    title: "شغلك واضح",
    highlight: "من أول طلب لآخر تسليم.",
    description: "طلباتك، الحالات الحالية، قيمة التوصيل، وتقييم العملاء ليك — كل البيانات اللي تساعدك تشتغل بثبات موجودة في مكان واحد.",
  },
  admin: {
    eyebrow: "مركز تشغيل المنصة",
    title: "نبض Sendly",
    highlight: "قدامك لحظة بلحظة.",
    description: "راقب الطلبات، اعرف حجم التشغيل، تابع المندوبين، وشوف طلبات المراجعة من نفس الشاشة بأرقام حقيقية من قاعدة البيانات.",
  },
};

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = (user?.role ?? "guest") as Role;

  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState("");

  async function loadHome(showRefresh = false) {
    try {
      setError("");
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/home", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "تعذر تحميل الصفحة الرئيسية.");
      }

      setData(result);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء تحميل الصفحة.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHome();
  }, [role]);

  async function handleTrack(event: FormEvent) {
    event.preventDefault();

    const value = trackingId.trim();

    if (!value) {
      setTrackingMessage("اكتب رقم الشحنة أولًا.");
      return;
    }

    if (role === "guest") {
      router.push(`/login?redirect=${encodeURIComponent(`/?track=${value.replace(/^#/, "")}`)}`);
      return;
    }

    try {
      setTrackingMessage("");
      setTrackingLoading(true);

      const res = await fetch(
        `/api/orders/track?code=${encodeURIComponent(value)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result = await res.json();

      if (!res.ok) {
        setTrackingMessage(result?.message || "تعذر العثور على الشحنة.");
        return;
      }

      const orderId = result?.orderId;

      if (!orderId) {
        setTrackingMessage("تعذر تحديد الطلب.");
        return;
      }

      router.push(getOrderHref(role, orderId));
    } catch {
      setTrackingMessage("تعذر فتح الشحنة الآن.");
    } finally {
      setTrackingLoading(false);
    }
  }

  const activeOrder = useMemo(
    () =>
      data?.recentOrders?.find((order) =>
        ACTIVE_ORDER_STATUSES.has(order.status),
      ) || null,
    [data?.recentOrders],
  );

  const platform = data?.platform;
  const personalRating = data?.user?.rating;
  const stats = data?.stats;

  // نفس بيانات الـHome القديمة، لكن معروضة بتصميم الـUI الجديد.
  const dashboardStats = useMemo(() => {
    if (role === "customer") {
      return [
        {
          title: "كل طلباتك",
          value: stats?.totalOrders || 0,
          icon: Package,
          tone: "orange" as const,
          href: "/orders",
        },
        {
          title: "طلبات نشطة",
          value: stats?.activeOrders || 0,
          icon: Activity,
          tone: "blue" as const,
          href: "/orders",
        },
        {
          title: "تم تسليمها",
          value: stats?.deliveredOrders || 0,
          icon: CheckCircle2,
          tone: "emerald" as const,
          href: "/orders",
        },
        {
          title: "تقييمك",
          value: personalRating?.average
            ? personalRating.average.toFixed(1)
            : "—",
          icon: Star,
          tone: "violet" as const,
          suffix: personalRating?.count ? "/5" : undefined,
          caption: `${numberFormat(personalRating?.count || 0)} تقييم`,
        },
      ];
    }

    if (role === "driver") {
      return [
        {
          title: "إجمالي شحناتك",
          value: stats?.totalOrders || 0,
          icon: Package,
          tone: "orange" as const,
          href: "/driver/orders",
        },
        {
          title: "على الطريق / قيد التنفيذ",
          value: stats?.activeOrders || 0,
          icon: Truck,
          tone: "blue" as const,
          href: "/driver/orders",
        },
        {
          title: "تسليمات ناجحة",
          value: stats?.deliveredOrders || 0,
          icon: CheckCircle2,
          tone: "emerald" as const,
          href: "/driver/orders",
        },
        {
          title: "أرباح التوصيل",
          value: currency(stats?.completedFees || 0),
          icon: Wallet,
          tone: "violet" as const,
          caption: "من الطلبات المسلّمة",
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          title: "الطلبات كلها",
          value: platform?.totalOrders || 0,
          icon: Package,
          tone: "orange" as const,
          href: "/admin/orders",
        },
        {
          title: "طلبات تحتاج قرار",
          value: stats?.pendingOrders || 0,
          icon: Clock3,
          tone: "amber" as const,
          href: "/admin/orders",
        },
        {
          title: "مندوبون بانتظار المراجعة",
          value: stats?.pendingDrivers || 0,
          icon: Users,
          tone: "blue" as const,
          href: "/admin/drivers",
        },
        {
          title: "إيرادات الشحن المكتملة",
          value: currency(stats?.completedFees || 0),
          icon: Wallet,
          tone: "emerald" as const,
        },
      ];
    }

    return [
      {
        title: "عميل مسجل",
        value: platform?.totalCustomers || 0,
        icon: Users,
        tone: "orange" as const,
      },
      {
        title: "مندوب نشط",
        value: platform?.activeDrivers || 0,
        icon: Truck,
        tone: "blue" as const,
      },
      {
        title: "طلبات مكتملة",
        value: platform?.deliveredOrders || 0,
        icon: CheckCircle2,
        tone: "emerald" as const,
      },
      {
        title: "طلبات قيد التنفيذ",
        value: platform?.activeOrders || 0,
        icon: Activity,
        tone: "violet" as const,
      },
    ];
  }, [platform, personalRating, role, stats]);
  const reviews = data?.recentReviews || [];

  const recommendedReviewee = useMemo(() => {
    if (!reviews.length) return null;

    const groups = new Map<
      string,
      { name: string; avatar: string; total: number; count: number }
    >();

    reviews.forEach((review) => {
      const current = groups.get(review.revieweeName) || {
        name: review.revieweeName,
        avatar: review.reviewerAvatar || "",
        total: 0,
        count: 0,
      };

      current.total += review.rating;
      current.count += 1;
      groups.set(review.revieweeName, current);
    });

    return [...groups.values()]
      .sort((a, b) => b.total / b.count - a.total / a.count)
      .find((item) => item.count > 0) || null;
  }, [reviews]);

  const averageRating =
    platform?.driverRating?.average ||
    platform?.customerRating?.average ||
    0;

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-white text-slate-950 selection:bg-orange-500 selection:text-white">
      <style jsx global>{`
        @keyframes sendlyUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sendlyFloat { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-8px) rotate(.7deg); } }
        @keyframes sendlyDash { to { stroke-dashoffset:-120; } }
        @keyframes sendlyPulse { 0%,100% { transform:scale(.85); opacity:.35; } 50% { transform:scale(1.12); opacity:1; } }
        .sendly-up { animation:sendlyUp .7s cubic-bezier(.16,1,.3,1) both; }
        .sendly-float { animation:sendlyFloat 5s ease-in-out infinite; transform-origin:center; }
        .sendly-dash { animation:sendlyDash 3s linear infinite; }
        .sendly-pulse { animation:sendlyPulse 2.5s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
        @media (prefers-reduced-motion: reduce) { .sendly-up,.sendly-float,.sendly-dash,.sendly-pulse { animation:none !important; } }
      `}</style>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="mx-auto grid min-h-[470px] max-w-[1500px] items-center gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-12 lg:py-10 xl:min-h-[510px]">
          {/* Illustration */}
          <div className="relative order-2 h-[300px] sm:h-[360px] lg:order-1 lg:h-[420px]">
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100 blur-3xl" />

            <svg viewBox="0 0 720 430" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="heroRoad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f7fbff"/><stop offset="1" stopColor="#eaf5ff"/></linearGradient>
                <linearGradient id="vanOrange" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff9f1c"/><stop offset="1" stopColor="#ff6b00"/></linearGradient>
                <linearGradient id="vanBlue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#42b7ff"/><stop offset="1" stopColor="#1976d2"/></linearGradient>
                <linearGradient id="vanGreen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2fd48c"/><stop offset="1" stopColor="#0b9f69"/></linearGradient>
              </defs>
              <path d="M20 315 C120 270 190 340 275 275 S450 220 690 310" fill="none" stroke="#dceeff" strokeWidth="55" strokeLinecap="round"/>
              <path d="M20 315 C120 270 190 340 275 275 S450 220 690 310" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="12 16" className="sendly-dash"/>
              <path d="M90 120 C145 70 205 88 240 120" fill="none" stroke="#c9eaff" strokeWidth="3" strokeDasharray="7 9"/>
              <path d="M500 90 C555 60 620 75 665 118" fill="none" stroke="#ffd4ad" strokeWidth="3" strokeDasharray="7 9"/>

              {/* blue van */}
              <g className="sendly-float">
                <rect x="500" y="125" width="120" height="68" rx="17" fill="url(#vanBlue)"/>
                <path d="M516 125 h55 l27 27 h-82z" fill="#83d6ff"/>
                <circle cx="527" cy="198" r="14" fill="#26364b"/><circle cx="590" cy="198" r="14" fill="#26364b"/>
                <circle cx="527" cy="198" r="5" fill="#fff" opacity=".8"/><circle cx="590" cy="198" r="5" fill="#fff" opacity=".8"/>
              </g>

              {/* green van */}
              <g className="sendly-float" style={{animationDelay:"-1.5s"}}>
                <rect x="500" y="285" width="115" height="65" rx="16" fill="url(#vanGreen)"/>
                <path d="M516 285 h50 l25 25 h-75z" fill="#8df0c6"/>
                <circle cx="528" cy="355" r="13" fill="#26364b"/><circle cx="589" cy="355" r="13" fill="#26364b"/>
              </g>

              {/* orange van */}
              <g className="sendly-float" style={{animationDelay:"-.8s"}}>
                <rect x="150" y="250" width="145" height="82" rx="20" fill="url(#vanOrange)"/>
                <path d="M170 250 h60 l32 30 h-92z" fill="#ffd18d"/>
                <circle cx="181" cy="337" r="16" fill="#26364b"/><circle cx="267" cy="337" r="16" fill="#26364b"/>
                <circle cx="181" cy="337" r="6" fill="#fff" opacity=".8"/><circle cx="267" cy="337" r="6" fill="#fff" opacity=".8"/>
              </g>

              {/* package + pin */}
              <g className="sendly-up">
                <rect x="85" y="285" width="48" height="42" rx="6" fill="#ffb13b"/>
                <path d="M109 285 v42 M85 298 l24 12 24-12" stroke="#e87900" strokeWidth="3" fill="none"/>
                <path d="M388 115 C388 95 404 80 424 80 s36 15 36 35 c0 27-36 60-36 60 s-36-33-36-60z" fill="#ff725e"/>
                <circle cx="424" cy="114" r="11" fill="white"/>
              </g>

              {/* cyclist */}
              <g transform="translate(80 145)">
                <circle cx="15" cy="52" r="17" fill="none" stroke="#172033" strokeWidth="4"/>
                <circle cx="82" cy="52" r="17" fill="none" stroke="#172033" strokeWidth="4"/>
                <path d="M15 52 L40 26 L60 52 L82 52 L58 24 L40 26" fill="none" stroke="#172033" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="53" cy="8" r="9" fill="#ffb13b"/>
                <path d="M50 18 l-12 17 18 4 9-14" fill="#42b7ff" stroke="#1976d2" strokeWidth="3"/>
              </g>

              <circle cx="335" cy="235" r="7" fill="#ff7a00" className="sendly-pulse"/>
              <circle cx="460" cy="275" r="6" fill="#18b981" className="sendly-pulse" style={{animationDelay:".7s"}}/>
              <circle cx="350" cy="85" r="5" fill="#7c3aed" className="sendly-pulse" style={{animationDelay:"1.2s"}}/>
            </svg>
          </div>

          {/* Hero text */}
          <div className="order-1 text-center lg:order-2 lg:text-right">
            <div className="sendly-up mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-black text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              بوابة الشحن الأسرع
            </div>
            <h1 className="sendly-up text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.5rem]" style={{animationDelay:"80ms"}}>
              شحنك يبدأ هنا، هنا،
              <br />
              <span className="bg-gradient-to-l from-orange-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">وتتبعه لحد آخر باب.</span>
            </h1>
            <p className="sendly-up mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-500 sm:text-base lg:mx-0" style={{animationDelay:"150ms"}}>
              توصيل أسرع، رؤية أوضح، وتجربة واحدة واضحة من إنشاء الطلب لحد آخر خطوة.
            </p>

            <form onSubmit={handleTrack} className="sendly-up mx-auto mt-7 flex max-w-xl items-center rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_15px_40px_-18px_rgba(15,23,42,.25)] lg:mx-0" style={{animationDelay:"220ms"}}>
              <MapPinned size={18} className="mr-3 shrink-0 text-slate-300" />
              <input value={trackingId} onChange={(e) => {setTrackingId(e.target.value); if(trackingMessage) setTrackingMessage("");}} placeholder="تتبع شحنتك" className="min-w-0 flex-1 bg-transparent px-2 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400" />
              <button type="submit" disabled={trackingLoading} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
                {trackingLoading ? <Loader2 size={15} className="animate-spin"/> : <Zap size={15} fill="currentColor"/>}
                تتبع شحنتك
              </button>
            </form>
            {trackingMessage ? <p className="mt-2 text-xs font-bold text-rose-500">{trackingMessage}</p> : null}

            <div className="sendly-up mt-5 flex flex-wrap justify-center gap-3 lg:justify-start" style={{animationDelay:"300ms"}}>
              {role === "guest" ? (
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-500">ابدأ الآن <ArrowLeft size={15}/></Link>
              ) : role === "customer" ? (
                <Link href="/orders/create" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600">أنشئ طلب شحن <Package size={15}/></Link>
              ) : role === "driver" ? (
                <Link href="/driver/orders" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600">طلباتك <Truck size={15}/></Link>
              ) : (
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600">لوحة الإدارة <BarChart3 size={15}/></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LIVE STATS ===================== */}
      <section className="relative border-y border-slate-100 bg-[#fbfcfe] px-4 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-blue-600">مؤشرات التشغيل الأسرع</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">مؤشرات التشغيل</h2>
            </div>
            <button onClick={() => loadHome(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black text-slate-500 shadow-sm hover:text-orange-500 disabled:opacity-60">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""}/> تحديث
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? Array.from({length:4}).map((_,i)=><div key={i} className="h-28 animate-pulse rounded-2xl bg-white"/>) : dashboardStats.map((item) => (
              <StatCard key={item.title} {...item} value={typeof item.value === "number" ? <AnimatedNumber value={item.value}/> : item.value}/>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== REVIEWS / RECOMMENDATION ===================== */}
      <section className="px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-7 text-center">
            <p className="text-[10px] font-black text-orange-600">التقييم في الآخر للترشيح</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">التقييم في الآخر للترشيح</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">التقييمات الحقيقية بتخلي التجربة أوضح، وبتساعدك تعرف مين يستحق ترشيحك.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            {/* summary */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-xs font-black text-orange-700">
                <Star size={16} fill="currentColor"/> التقييم
              </div>
              <RatingSummary label="تقييمات المنصة" average={platform?.driverRating.average || 0} count={platform?.driverRating.count || 0}/>
              {role !== "guest" && personalRating ? <div className="mt-5"><RatingSummary label="تقييمك الشخصي" average={personalRating.average} count={personalRating.count}/></div> : null}

              {data?.pendingRatings?.length ? (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black text-slate-800">عندك تقييم مستحق</p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">قيّم آخر تجربة عشان التوصيات تفضل مبنية على تجارب حقيقية.</p>
                  <div className="mt-3">
                    <RateOrderCard key={data.pendingRatings[0]._id} order={data.pendingRatings[0]} target={role === "customer" ? "driver" : "customer"} onSaved={() => loadHome(true)}/>
                  </div>
                </div>
              ) : null}
            </div>

            {/* reviews */}
            <div className="grid gap-4 sm:grid-cols-2">
              {data?.recentReviews?.length ? data.recentReviews.slice(0,4).map((review, index) => (
                <div key={review._id} className={`relative overflow-hidden rounded-[1.5rem] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${index % 2 === 0 ? "border-blue-100" : "border-orange-100"}`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${index % 2 === 0 ? "bg-cyan-400" : "bg-orange-500"}`}/>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {review.reviewerAvatar ? <img src={review.reviewerAvatar} alt={review.reviewerName} className="h-11 w-11 rounded-full object-cover ring-2 ring-white"/> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UserRound size={18}/></div>}
                      <div>
                        <p className="text-xs font-black text-slate-900">{review.reviewerName}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">{review.reviewerRole === "customer" ? "عميل" : "مندوب"}</p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size={13}/>
                  </div>
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs leading-6 text-slate-600">{review.comment || "تقييم بالنجوم بدون تعليق."}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-black text-slate-400">
                    <span>قيّم {review.revieweeName}</span>
                    <span>{dateFormat(review.createdAt)}</span>
                  </div>
                </div>
              )) : (
                <div className="sm:col-span-2"><EmptyState icon={Star} title="لسه مفيش تقييمات" text="بعد أول تسليم وتقييم هتظهر التجارب الحقيقية هنا."/></div>
              )}
            </div>
          </div>

          {recommendedReviewee ? (
            <div className="mt-5 rounded-[1.75rem] border border-violet-100 bg-gradient-to-l from-violet-50 via-white to-orange-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {recommendedReviewee.avatar ? <img src={recommendedReviewee.avatar} alt={recommendedReviewee.name} className="h-14 w-14 rounded-2xl object-cover"/> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm"><Users size={22}/></div>}
                  <div>
                    <p className="text-[10px] font-black text-violet-600">ترشيح مبني على التقييمات</p>
                    <h3 className="mt-1 text-base font-black text-slate-950">{recommendedReviewee.name}</h3>
                    <div className="mt-1 flex items-center gap-2"><RatingStars rating={recommendedReviewee.total / Math.max(recommendedReviewee.count,1)} size={12}/><span className="text-[10px] font-bold text-slate-400">{numberFormat(recommendedReviewee.count)} تقييم</span></div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black text-violet-700 shadow-sm"><Sparkles size={14}/> مرشح من تجارب حقيقية</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ===================== ORDERS ===================== */}
      <section className="border-t border-slate-100 bg-[#fbfcfe] px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400">آخر حركة</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{role === "admin" ? "آخر طلبات المنصة" : "آخر طلباتك"}</h2>
              </div>
              <Link href={role === "admin" ? "/admin/orders" : role === "driver" ? "/driver/orders" : "/orders"} className="text-xs font-black text-orange-500 hover:text-orange-600">عرض الكل</Link>
            </div>
            {loading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100"/>)}</div> : data?.recentOrders?.length ? <div className="space-y-3">{data.recentOrders.map((order)=>{const info=statusInfo(order.status);const Icon=info.icon;return <Link key={order._id} href={getOrderHref(role,order._id)} className="group block rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/20"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500"><Icon size={19}/></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-slate-900">#{order._id.slice(-8).toUpperCase()}</p><span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${info.tone}`}>{info.label}</span></div><p className="mt-1 truncate text-xs text-slate-400">{role === "driver" ? `${order.customer?.fullName || "عميل"} • ${order.delivery?.city || ""}` : role === "admin" ? `${order.customer?.fullName || "عميل"}${order.driver?.fullName ? ` • ${order.driver.fullName}` : " • بدون مندوب"}` : `${order.pickup?.city || "نقطة الاستلام"} ← ${order.delivery?.city || "الوجهة"}`}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><p className="text-sm font-black text-slate-900">{currency(order.deliveryFee)}</p><p className="mt-1 text-[10px] font-bold text-slate-400">{dateFormat(order.createdAt)}</p></div><ChevronLeft size={18} className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500"/></div></div></Link>})}</div> : <EmptyState icon={Package} title="مفيش طلبات لسه" text="أول طلب يظهر هنا مباشرة بعد إنشائه."/>}
          </section>

          <aside className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/60"><ShieldCheck size={13} className="text-orange-400"/> رحلة واضحة من البداية للنهاية</div>
            <h2 className="mt-4 text-2xl font-black">كل شحنة لها قصة.</h2>
            <p className="mt-3 text-sm leading-7 text-white/45">إنشاء، مراجعة، استلام، تتبع، تسليم، ثم تقييم. كل خطوة مربوطة داخل Sendly.</p>
            <div className="mt-7 space-y-3">
              {["إنشاء الطلب", "اختيار المندوب", "التتبع والتسليم", "التقييم والترشيح"].map((item,index)=><div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-black">{index+1}</span><span className="text-xs font-black text-white/75">{item}</span><CheckCircle2 size={15} className="mr-auto text-emerald-400"/></div>)}
            </div>
          </aside>
        </div>
      </section>

      {/* ===================== FOOTER CTA ===================== */}
      <section className="px-4 pb-12 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] bg-gradient-to-l from-orange-500 via-pink-500 to-violet-600 p-8 text-white shadow-2xl shadow-orange-200 sm:p-12">
          <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-right">
            <div>
              <p className="text-xs font-black text-white/70">Sendly</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">شحنتك تبدأ هنا وتوصل لآخر باب.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">خلي رحلة التوصيل أوضح من أول ضغطة لحد آخر تقييم.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {role === "guest" ? <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-orange-600 shadow-lg transition hover:-translate-y-0.5">ابدأ الآن <ArrowLeft size={17}/></Link> : role === "customer" ? <Link href="/orders/create" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-orange-600 shadow-lg transition hover:-translate-y-0.5">أنشئ طلب شحن <Package size={17}/></Link> : role === "driver" ? <Link href="/driver/orders" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-orange-600 shadow-lg transition hover:-translate-y-0.5">افتح الطلبات <Truck size={17}/></Link> : <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-orange-600 shadow-lg transition hover:-translate-y-0.5">لوحة الإدارة <BarChart3 size={17}/></Link>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
