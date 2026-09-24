"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // =========================
  // Handle change
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
    setSuccess("");
  }

  // =========================
  // Submit
  // =========================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.currentPassword) {
      setError(
        "من فضلك أدخل كلمة المرور الحالية."
      );
      return;
    }

    if (form.newPassword.length < 8) {
      setError(
        "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل."
      );
      return;
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "كلمتا المرور الجديدتان غير متطابقتين."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/profile/change-password",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تغيير كلمة المرور."
        );
      }

      setSuccess(
        data.message ||
          "تم تغيير كلمة المرور بنجاح."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // رجوع للملف الشخصي بعد ثانيتين
      setTimeout(() => {
        router.replace("/profile");
      }, 1800);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تغيير كلمة المرور."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        {/* Header */}

        <div className="mb-6 flex items-center gap-4">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              تغيير كلمة المرور
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              حافظ على أمان حسابك بتحديث كلمة المرور
            </p>
          </div>

        </div>

        {/* Card */}

        <div className="rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

          {/* Security Header */}

          <div className="mb-7 flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                حماية الحساب
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                استخدم كلمة مرور قوية تحتوي على حروف
                كبيرة وصغيرة وأرقام.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Current Password */}

            <PasswordField
              label="كلمة المرور الحالية"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الحالية"
              icon={<Lock size={19} />}
              show={showCurrent}
              setShow={setShowCurrent}
              disabled={loading}
            />

            {/* New Password */}

            <PasswordField
              label="كلمة المرور الجديدة"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الجديدة"
              icon={<KeyRound size={19} />}
              show={showNew}
              setShow={setShowNew}
              disabled={loading}
            />

            {/* Password Rules */}

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="mb-2 text-xs font-bold text-slate-600">
                كلمة المرور يجب أن تحتوي على:
              </p>

              <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-3">

                <span>
                  • 8 أحرف على الأقل
                </span>

                <span>
                  • حرف كبير وصغير
                </span>

                <span>
                  • رقم واحد على الأقل
                </span>

              </div>

            </div>

            {/* Confirm */}

            <PasswordField
              label="تأكيد كلمة المرور الجديدة"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="أعد كتابة كلمة المرور الجديدة"
              icon={<KeyRound size={19} />}
              show={showConfirm}
              setShow={setShowConfirm}
              disabled={loading}
            />

            {/* Error */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                <span className="mt-0.5">!</span>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">

                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p>{success}</p>

                  <p className="mt-1 text-xs font-medium text-emerald-500">
                    سيتم إعادتك إلى الملف الشخصي...
                  </p>
                </div>

              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg shadow-slate-950/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  جاري تحديث كلمة المرور...
                </>
              ) : (
                <>
                  <ShieldCheck size={19} />

                  تحديث كلمة المرور
                </>
              )}

            </button>

          </form>

        </div>

      </div>
    </main>
  );
}

// =================================
// Password Field
// =================================

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  show,
  setShow,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  icon: React.ReactNode;
  show: boolean;
  setShow: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  disabled: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          name={name}
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() =>
            setShow((prev) => !prev)
          }
          disabled={disabled}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-500 disabled:opacity-50"
          aria-label={
            show
              ? "إخفاء كلمة المرور"
              : "إظهار كلمة المرور"
          }
        >
          {show ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>

      </div>

    </div>
  );
}