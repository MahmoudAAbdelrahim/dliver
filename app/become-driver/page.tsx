"use client";

import {
  useState,
  type ChangeEvent,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  User,
} from "lucide-react";

import { useRouter } from "next/navigation";

type ImageField =
  | "personalPhoto"
  | "nationalIdFront"
  | "nationalIdBack"
  | "licenseImage"
  | "workPermit";

export default function BecomeDriverPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState<ImageField | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    nationalId: "",
    birthDate: "",
    governorate: "",
    city: "",
    address: "",
    vehicleType: "",
    licenseNumber: "",

    personalPhoto: "",
    nationalIdFront: "",
    nationalIdBack: "",
    licenseImage: "",
    workPermit: "",

    notes: "",
  });

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function uploadImage(
    e: ChangeEvent<HTMLInputElement>,
    field: ImageField
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setUploading(field);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch(
        "/api/upload/driver",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل رفع الصورة."
        );
      }

      setForm((prev) => ({
        ...prev,
        [field]: data.url,
      }));
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء رفع الصورة."
      );
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.personalPhoto ||
      !form.nationalIdFront ||
      !form.nationalIdBack ||
      !form.licenseImage
    ) {
      setError(
        "يرجى رفع جميع الصور المطلوبة."
      );

      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/driver/request",
        {
          method: "POST",
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
            "حدث خطأ أثناء إرسال الطلب."
        );
      }

      setMessage(
        "تم إرسال طلبك بنجاح. سيتم مراجعته من الإدارة."
      );

      setTimeout(() => {
        router.push("/profile");
      }, 1800);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء إرسال الطلب."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] pb-20"
    >
      {/* Header */}

      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.10),transparent_55%)]" />

        <div className="relative mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              router.push("/profile")
            }
            className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
          >
            <ArrowRight size={18} />
            العودة إلى الحساب
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <Car size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                انضم إلينا كمندوب
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                قدم بياناتك وسنراجع طلبك قبل تفعيل حساب المندوب.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-4xl px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-8"
        >
          {/* البيانات الشخصية */}

          <div>
            <SectionTitle
              icon={<User size={20} />}
              title="البيانات الشخصية"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="الرقم القومي"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                placeholder="14 رقم"
                required
              />

              <Input
                label="تاريخ الميلاد"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* العنوان */}

          <div>
            <SectionTitle
              icon={<MapPin size={20} />}
              title="العنوان بالتفصيل"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="المحافظة"
                name="governorate"
                value={form.governorate}
                onChange={handleChange}
                placeholder="مثال: أسيوط"
                required
              />

              <Input
                label="المدينة / المركز"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="مثال: أسيوط"
                required
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  العنوان بالتفصيل
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="الشارع، المنطقة، رقم المنزل..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>

          {/* المركبة */}

          <div>
            <SectionTitle
              icon={<Car size={20} />}
              title="بيانات المركبة"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  نوع المركبة
                </label>

                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none focus:border-orange-500"
                >
                  <option value="">
                    اختر نوع المركبة
                  </option>

                  <option value="motorcycle">
                    موتوسيكل
                  </option>

                  <option value="car">
                    سيارة
                  </option>

                  <option value="van">
                    فان
                  </option>
                </select>
              </div>

              <Input
                label="رقم الرخصة"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="رقم رخصة القيادة"
                required
              />
            </div>
          </div>

          {/* الصور */}

          <div>
            <SectionTitle
              icon={<ImagePlus size={20} />}
              title="المستندات والصور"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <UploadBox
                title="الصورة الشخصية"
                required
                value={form.personalPhoto}
                loading={
                  uploading === "personalPhoto"
                }
                onChange={(e) =>
                  uploadImage(
                    e,
                    "personalPhoto"
                  )
                }
              />

              <UploadBox
                title="وجه البطاقة"
                required
                value={form.nationalIdFront}
                loading={
                  uploading ===
                  "nationalIdFront"
                }
                onChange={(e) =>
                  uploadImage(
                    e,
                    "nationalIdFront"
                  )
                }
              />

              <UploadBox
                title="ظهر البطاقة"
                required
                value={form.nationalIdBack}
                loading={
                  uploading ===
                  "nationalIdBack"
                }
                onChange={(e) =>
                  uploadImage(
                    e,
                    "nationalIdBack"
                  )
                }
              />

              <UploadBox
                title="رخصة القيادة"
                required
                value={form.licenseImage}
                loading={
                  uploading === "licenseImage"
                }
                onChange={(e) =>
                  uploadImage(
                    e,
                    "licenseImage"
                  )
                }
              />

              <UploadBox
                title="تصريح العمل"
                value={form.workPermit}
                loading={
                  uploading === "workPermit"
                }
                onChange={(e) =>
                  uploadImage(
                    e,
                    "workPermit"
                  )
                }
              />
            </div>
          </div>

          {/* ملاحظات */}

          <div>
            <SectionTitle
              icon={<FileText size={20} />}
              title="ملاحظات إضافية"
            />

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="أي معلومات إضافية تريد إخبار الإدارة بها..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 outline-none focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600">
              <CheckCircle2 size={20} />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 font-black text-white shadow-xl transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                جاري إرسال الطلب...
              </>
            ) : (
              <>
                إرسال طلب الانضمام
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <h2 className="text-lg font-black text-slate-800">
        {title}
      </h2>
    </div>
  );
}

function Input({
  label,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
      />
    </div>
  );
}

function UploadBox({
  title,
  value,
  loading,
  required,
  onChange,
}: {
  title: string;
  value: string;
  loading: boolean;
  required?: boolean;
  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <label className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 transition hover:border-orange-400 hover:bg-orange-50/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">
            {title}
            {required && (
              <span className="mr-1 text-red-500">
                *
              </span>
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            JPG / PNG — حتى 5MB
          </p>
        </div>

        {loading ? (
          <Loader2
            className="animate-spin text-orange-500"
            size={22}
          />
        ) : value ? (
          <CheckCircle2
            className="text-emerald-500"
            size={22}
          />
        ) : (
          <ImagePlus
            className="text-slate-400 group-hover:text-orange-500"
            size={22}
          />
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onChange}
      />

      {value && (
        <div className="mt-3 overflow-hidden rounded-xl">
          <img
            src={value}
            alt={title}
            className="h-32 w-full object-cover"
          />
        </div>
      )}
    </label>
  );
}