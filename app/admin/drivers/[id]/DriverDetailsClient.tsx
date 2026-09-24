"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Clock3,
} from "lucide-react";

type Application = {
  _id: string;

  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
    role?: string;
    driverStatus?: string;
    address?: string;
    city?: string;
  };

  personalPhoto?: string;
  nationalIdImage?: string;
  vehicleImage?: string;
  drivingLicenseImage?: string;
  workPermitImage?: string;

  address?: {
    governorate?: string;
    city?: string;
    street?: string;
    details?: string;
  };

  deliveryAreas?: string[];

  status:
    | "pending"
    | "approved"
    | "rejected";

  rejectionReason?: string;

  reviewedBy?: {
    _id?: string;
    fullName: string;
    email?: string;
  };

  reviewedAt?: string;

  createdAt: string;
};

export default function DriverDetailsClient({
  id,
}: {
  id: string;
}) {
  const [application, setApplication] =
    useState<Application | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showReject, setShowReject] =
    useState(false);

  const [reason, setReason] =
    useState("");

const [statusLoading, setStatusLoading] =
  useState(false);

  async function loadApplication() {
    try {
      setLoading(true);

      console.log(
        "LOADING DRIVER USER:",
        id
      );

      const res = await fetch(
        `/api/admin/drivers/applications/${id}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const data =
        await res.json();

      console.log(
        "DRIVER DETAILS RESPONSE:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "تعذر تحميل بيانات المندوب."
        );
      }

      if (!data?.application) {
        throw new Error(
          "بيانات المندوب غير موجودة."
        );
      }

      setApplication(
        data.application
      );
    } catch (error) {
      console.error(
        "LOAD DRIVER DETAILS:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "تعذر تحميل بيانات المندوب."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplication();
  }, [id]);
async function updateDriverStatus(
  action: "suspend" | "activate"
) {
  if (!application?.user?._id) {
    return;
  }

  const message =
    action === "suspend"
      ? "هل أنت متأكد من إيقاف حساب هذا المندوب مؤقتًا؟"
      : "هل تريد إعادة تفعيل حساب هذا المندوب؟";

  if (!confirm(message)) {
    return;
  }

  try {
    setStatusLoading(true);

    const res = await fetch(
      `/api/admin/drivers/${application.user._id}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data?.message ||
          "حدث خطأ أثناء تحديث حالة الحساب."
      );

      return;
    }

    alert(
      data?.message ||
        "تم تحديث حالة الحساب."
    );

    await loadApplication();
  } catch (error) {
    console.error(
      "UPDATE DRIVER STATUS:",
      error
    );

    alert(
      "حدث خطأ أثناء تحديث حالة الحساب."
    );
  } finally {
    setStatusLoading(false);
  }
}
  async function approve() {
    if (
      !confirm(
        "هل أنت متأكد من الموافقة على هذا المندوب؟"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/drivers/applications/${id}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data?.message ||
            "حدث خطأ أثناء الموافقة."
        );

        return;
      }

      alert(
        data?.message ||
          "تم قبول المندوب بنجاح."
      );

      await loadApplication();
    } catch (error) {
      console.error(
        "APPROVE DRIVER:",
        error
      );

      alert(
        "حدث خطأ أثناء الموافقة."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function reject() {
    const cleanReason =
      reason.trim();

    if (!cleanReason) {
      alert(
        "اكتب سبب الرفض أولاً."
      );

      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/drivers/applications/${id}/reject`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            reason:
              cleanReason,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data?.message ||
            "حدث خطأ أثناء الرفض."
        );

        return;
      }

      alert(
        data?.message ||
          "تم رفض طلب المندوب."
      );

      setShowReject(false);
      setReason("");

      await loadApplication();
    } catch (error) {
      console.error(
        "REJECT DRIVER:",
        error
      );

      alert(
        "حدث خطأ أثناء الرفض."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#FAFAFA] p-6"
      >
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-20 text-center shadow-xl">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

          <p className="mt-4 font-bold text-slate-400">
            جاري تحميل بيانات المندوب...
          </p>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#FAFAFA] p-6"
      >
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-20 text-center shadow-xl">
          <p className="font-bold text-red-500">
            لم يتم العثور على الطلب.
          </p>

          <Link
            href="/admin/drivers"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            العودة إلى المندوبين
          </Link>
        </div>
      </main>
    );
  }

  const user =
    application.user;

  const isPending =
    application.status ===
    "pending";

  const address =
    application.address;

  const deliveryAreas =
    Array.isArray(
      application.deliveryAreas
    )
      ? application.deliveryAreas
      : [];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] pb-24 text-slate-900"
    >
      {/* HEADER */}

      <section className="bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/drivers"
            className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
          >
            <ArrowRight size={18} />

            العودة إلى المندوبين
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                  <User size={35} />
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-orange-400">
                  طلب انضمام كمندوب
                </p>

                <h1 className="mt-1 text-3xl font-black">
                  {user.fullName ||
                    "بدون اسم"}
                </h1>
              </div>
            </div>

        
            <div className="flex flex-wrap items-center gap-3">
  <Status
    status={
      application.user.driverStatus
    }
  />

  {application.user.driverStatus ===
    "approved" && (
    <button
      type="button"
      disabled={
        statusLoading
      }
      onClick={() =>
        updateDriverStatus(
          "suspend"
        )
      }
      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <XCircle size={17} />

      {statusLoading
        ? "جاري التنفيذ..."
        : "إيقاف الحساب مؤقتًا"}
    </button>
  )}

  {application.user.driverStatus ===
    "suspended" && (
    <button
      type="button"
      disabled={
        statusLoading
      }
      onClick={() =>
        updateDriverStatus(
          "activate"
        )
      }
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-black text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <CheckCircle2
        size={17}
      />

      {statusLoading
        ? "جاري التنفيذ..."
        : "إعادة تشغيل الحساب"}
    </button>
  )}
</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        {/* ACTIONS */}

        {isPending && (
          <div className="relative -mt-6 mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={
                  actionLoading
                }
                onClick={approve}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                <CheckCircle2
                  size={19}
                />

                {actionLoading
                  ? "جاري التنفيذ..."
                  : "قبول المندوب"}
              </button>

              <button
                disabled={
                  actionLoading
                }
                onClick={() =>
                  setShowReject(
                    !showReject
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-3.5 font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={19} />

                رفض الطلب
              </button>
            </div>

            {showReject && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <label className="mb-2 block text-sm font-black">
                  سبب الرفض
                </label>

                <textarea
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="اكتب سبب رفض طلب المندوب..."
                  className="w-full resize-none rounded-xl border border-slate-200 p-4 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-500/5"
                />

                <button
                  disabled={
                    actionLoading
                  }
                  onClick={reject}
                  className="mt-3 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  تأكيد الرفض
                </button>
              </div>
            )}
          </div>
        )}

        {/* PERSONAL */}

        <Section
          title="البيانات الشخصية"
          icon={<User size={19} />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Data
              icon={<User />}
              label="الاسم"
              value={
                user.fullName
              }
            />

            <Data
              icon={<Phone />}
              label="الهاتف"
              value={
                user.phone
              }
            />

            <Data
              icon={<Mail />}
              label="البريد الإلكتروني"
              value={
                user.email
              }
            />

            <Data
              icon={<Clock3 />}
              label="تاريخ التقديم"
              value={
                application.createdAt
                  ? new Date(
                      application.createdAt
                    ).toLocaleString(
                      "ar-EG"
                    )
                  : ""
              }
            />
          </div>
        </Section>

        {/* DOCUMENTS */}

        <Section
          title="المستندات والصور"
          icon={
            <FileText size={19} />
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DocumentCard
              title="الصورة الشخصية"
              src={
                application.personalPhoto
              }
            />

            <DocumentCard
              title="صورة البطاقة"
              src={
                application.nationalIdImage
              }
            />

            <DocumentCard
              title="صورة السيارة / الموتوسيكل"
              src={
                application.vehicleImage
              }
            />

            <DocumentCard
              title="رخصة القيادة"
              src={
                application.drivingLicenseImage
              }
            />

            {application.workPermitImage && (
              <DocumentCard
                title="تصريح العمل"
                src={
                  application.workPermitImage
                }
              />
            )}
          </div>
        </Section>

        {/* ADDRESS */}

        <Section
          title="عنوان المندوب"
          icon={<MapPin size={19} />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Data
              icon={<MapPin />}
              label="المحافظة"
              value={
                address?.governorate
              }
            />

            <Data
              icon={<MapPin />}
              label="المدينة"
              value={
                address?.city ||
                user.city
              }
            />

            <Data
              icon={<MapPin />}
              label="العنوان"
              value={
                address?.street
              }
            />

            <Data
              icon={<MapPin />}
              label="التفاصيل"
              value={
                address?.details
              }
            />
          </div>
        </Section>

        {/* DELIVERY */}

        <Section
          title="مناطق التوصيل"
          icon={<Car size={19} />}
        >
          {deliveryAreas.length ===
          0 ? (
            <p className="text-sm text-slate-400">
              لم يحدد مناطق التوصيل.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {deliveryAreas.map(
                (
                  area,
                  index
                ) => (
                  <span
                    key={`${area}-${index}`}
                    className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600"
                  >
                    {area}
                  </span>
                )
              )}
            </div>
          )}
        </Section>

        {/* REJECTION */}

        {application.status ===
          "rejected" &&
          application.rejectionReason && (
            <Section
              title="سبب الرفض"
              icon={
                <XCircle size={19} />
              }
            >
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold leading-7 text-red-700">
                {
                  application.rejectionReason
                }
              </div>
            </Section>
          )}

        {/* APPROVAL */}

        {application.status ===
          "approved" && (
            <Section
              title="معلومات الاعتماد"
              icon={
                <ShieldCheck
                  size={19}
                />
              }
            >
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="font-black text-emerald-700">
                  تم اعتماد هذا المندوب.
                </p>

                {application
                  .reviewedBy
                  ?.fullName && (
                  <p className="mt-2 text-sm font-bold text-emerald-600">
                    تمت المراجعة بواسطة:{" "}
                    {
                      application
                        .reviewedBy
                        .fullName
                    }
                  </p>
                )}

                {application.reviewedAt && (
                  <p className="mt-1 text-xs text-emerald-500">
                    {new Date(
                      application.reviewedAt
                    ).toLocaleString(
                      "ar-EG"
                    )}
                  </p>
                )}
              </div>
            </Section>
          )}
      </section>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/20 md:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          {icon}
        </div>

        <h2 className="text-lg font-black">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Data({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
        {icon}
        {label}
      </div>

      <p className="break-words font-bold text-slate-800">
        {value ||
          "غير محدد"}
      </p>
    </div>
  );
}

function DocumentCard({
  title,
  src,
}: {
  title: string;
  src?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-[4/3] bg-slate-100">
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            لا توجد صورة
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-4">
        <ImageIcon
          size={17}
          className="text-orange-500"
        />

        <span className="text-sm font-black">
          {title}
        </span>
      </div>
    </div>
  );
}

function Status({
  status,
}: {
  status:
    | string
    | undefined;
}) {
  if (
    status ===
    "approved"
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-5 py-2.5 text-sm font-black text-emerald-400">
        <ShieldCheck size={17} />
        مندوب معتمد
      </span>
    );
  }

  if (
    status ===
    "rejected"
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-black text-red-400">
        <XCircle size={17} />
        مرفوض
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-5 py-2.5 text-sm font-black text-orange-400">
      <Clock3 size={17} />
      قيد المراجعة
    </span>
  );
}