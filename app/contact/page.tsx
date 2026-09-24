"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const subjects = [
  "استفسار عام",
  "مشكلة في طلب",
  "مشكلة في الحساب",
  "اقتراح أو تطوير",
  "شكوى",
  "شراكة",
  "أخرى",
];

export default function ContactPage() {
  const [form, setForm] =
    useState<FormData>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء إرسال الرسالة."
        );
      }

      setSuccess(data.message);

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء إرسال الرسالة."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-white text-slate-900"
    >
      {/* =====================================
          HERO
      ====================================== */}

      <section className="relative overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="absolute right-1/3 top-1/2 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:45px_45px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Text */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <Sparkles className="h-4 w-4 text-orange-400" />

                نحن هنا لمساعدتك
              </div>

              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                تواصل معنا
                <br />

                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                  وخلي رسالتك توصل
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-9 text-slate-300">
                عندك سؤال، مشكلة، اقتراح أو محتاج
                مساعدة؟
                <br />
                فريق Sendly موجود علشان يساعدك.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-900 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  العودة للرئيسية

                  <ArrowLeft className="h-4 w-4" />
                </Link>

                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  إرسال رسالة

                  <Send className="h-4 w-4 text-orange-400" />
                </a>
              </div>
            </div>

            {/* Visual */}

            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-square">
                {/* Glow */}

                <div className="absolute inset-10 rounded-full bg-gradient-to-br from-orange-500/20 via-cyan-400/10 to-violet-500/20 blur-3xl" />

                {/* Circle */}

                <div className="absolute inset-12 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm" />

                {/* Route */}

                <svg
                  viewBox="0 0 500 500"
                  className="absolute inset-0 h-full w-full"
                  fill="none"
                >
                  <path
                    d="M110 360 C120 170 260 100 390 170 C455 205 420 315 340 340 C270 360 230 300 270 245"
                    stroke="url(#contactGradient)"
                    strokeWidth="4"
                    strokeDasharray="10 12"
                  />

                  <defs>
                    <linearGradient
                      id="contactGradient"
                      x1="80"
                      y1="100"
                      x2="420"
                      y2="400"
                    >
                      <stop
                        stopColor="#f97316"
                      />

                      <stop
                        offset=".5"
                        stopColor="#06b6d4"
                      />

                      <stop
                        offset="1"
                        stopColor="#8b5cf6"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center card */}

                <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-400 shadow-2xl shadow-orange-500/30">
                  <MessageCircle className="h-16 w-16 text-white" />
                </div>

                {/* Mail */}

                <div className="absolute left-4 top-20 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-300 shadow-xl backdrop-blur-xl">
                  <Mail className="h-7 w-7" />
                </div>

                {/* Phone */}

                <div className="absolute right-5 top-24 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300 shadow-xl backdrop-blur-xl">
                  <Phone className="h-7 w-7" />
                </div>

                {/* Shield */}

                <div className="absolute bottom-16 left-16 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-violet-300 shadow-xl backdrop-blur-xl">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                {/* Clock */}

                <div className="absolute bottom-20 right-12 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-amber-300 shadow-xl backdrop-blur-xl">
                  <Clock3 className="h-7 w-7" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTACT CONTENT
      ====================================== */}

      <section
        id="contact-form"
        className="relative bg-slate-50 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            {/* Info */}

            <div className="space-y-5">
              <div>
                <span className="font-bold text-orange-500">
                  Contact Sendly
                </span>

                <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                  كيف يمكننا مساعدتك؟
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  اكتب لنا تفاصيل طلبك وسنقوم بمراجعة
                  رسالتك والتواصل معك في أقرب وقت.
                </p>
              </div>

              {/* Email */}

              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Mail className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      البريد الإلكتروني
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      support@sendly.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}

              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                    <Phone className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      الهاتف
                    </h3>

                    <p
                      dir="ltr"
                      className="mt-1 text-sm text-slate-500"
                    >
                      +20 100 000 0000
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}

              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      موقعنا
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      مصر
                    </p>
                  </div>
                </div>
              </div>

              {/* Response */}

              <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-7 text-white shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Clock3 className="h-6 w-6 text-orange-400" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      وقت الاستجابة
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      نسعى للرد على جميع الرسائل في
                      أقرب وقت ممكن.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 lg:p-10">
              <div className="mb-8">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                  <Send className="h-6 w-6" />
                </div>

                <h2 className="text-2xl font-black text-slate-950">
                  أرسل لنا رسالة
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  املأ البيانات التالية وسنتواصل معك.
                </p>
              </div>

              {/* Success */}

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p className="text-sm font-semibold">
                    {success}
                  </p>
                </div>
              )}

              {/* Error */}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Name + Email */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      الاسم *
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        updateField(
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="اكتب اسمك"
                      required
                      maxLength={100}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      البريد الإلكتروني *
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="example@email.com"
                      required
                      maxLength={150}
                      dir="ltr"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>
                </div>

                {/* Phone + Subject */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      رقم الهاتف
                    </label>

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="01xxxxxxxxx"
                      maxLength={30}
                      dir="ltr"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      نوع الرسالة *
                    </label>

                    <select
                      value={form.subject}
                      onChange={(e) =>
                        updateField(
                          "subject",
                          e.target.value
                        )
                      }
                      required
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    >
                      <option value="">
                        اختر نوع الرسالة
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={subject}
                          value={subject}
                        >
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    الرسالة *
                  </label>

                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      updateField(
                        "message",
                        e.target.value
                      )
                    }
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 leading-7 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />

                  <div className="mt-2 text-left text-xs text-slate-400">
                    {form.message.length}/5000
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-6 py-4 font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      إرسال الرسالة

                      <Send className="h-5 w-5 transition group-hover:-translate-x-1" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-6 text-slate-400">
                  بإرسال الرسالة أنت توافق على استخدام
                  البيانات اللازمة للرد على استفسارك.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          BOTTOM CTA
      ====================================== */}

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-12 text-center shadow-2xl sm:px-12">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                <MessageCircle className="h-7 w-7" />
              </div>

              <h2 className="text-3xl font-black text-white">
                محتاج مساعدة في طلبك؟
              </h2>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-300">
                فريق Sendly جاهز لمساعدتك ومتابعة
                مشكلتك.
              </p>

              <a
                href="#contact-form"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-bold text-slate-950 transition hover:-translate-y-1 hover:shadow-xl"
              >
                تواصل معنا

                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}