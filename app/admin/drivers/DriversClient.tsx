//admin/drivers/driversclint.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Truck,
} from "lucide-react";

type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

type DriverRequest = {
  _id: string;

  fullName: string;
  email: string;
  phone: string;
  avatar?: string;

  driverStatus?: string;

  address?: string;
  city?: string;

  driverApplication?: {
    address?: string;
    addressDetails?: string;

    deliveryFrom?: string;
    deliveryTo?: string;

    submittedAt?: string;

    personalImage?: string;
    nationalIdImage?: string;
    vehicleImage?: string;
    licenseImage?: string;
    workPermitImage?: string;

    status?: ApplicationStatus;
    rejectionReason?: string;

    createdAt?: string;
  };

  status?: ApplicationStatus;
  rejectionReason?: string;
  createdAt?: string;
};

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

  personalImage?: string;
  nationalIdImage?: string;
  vehicleImage?: string;
  licenseImage?: string;
  workPermitImage?: string;

  address?: string;
  addressDetails?: string;

  deliveryFrom?: string;
  deliveryTo?: string;

  status: ApplicationStatus;

  rejectionReason?: string;

  createdAt: string;
};

const statusConfig = {
  pending: {
    label: "قيد المراجعة",
    className: "bg-orange-50 text-orange-600",
  },

  approved: {
    label: "مقبول",
    className: "bg-emerald-50 text-emerald-600",
  },

  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-600",
  },
};

function normalizeRequest(
  request: DriverRequest
): Application {
  const app = request.driverApplication;

  const status =
    app?.status ||
    request.status ||
    (request.driverStatus === "approved"
      ? "approved"
      : request.driverStatus === "rejected"
      ? "rejected"
      : "pending");

  return {
    _id: request._id,

    user: {
      _id: request._id,
      fullName: request.fullName || "بدون اسم",
      email: request.email || "",
      phone: request.phone || "",
      avatar: request.avatar,
      role: "user",
      driverStatus: request.driverStatus,
      address: request.address,
      city: request.city,
    },

    personalImage: app?.personalImage,
    nationalIdImage: app?.nationalIdImage,
    vehicleImage: app?.vehicleImage,
    licenseImage: app?.licenseImage,
    workPermitImage: app?.workPermitImage,

    address:
      app?.address ||
      request.address ||
      "",

    addressDetails:
      app?.addressDetails ||
      "",

    deliveryFrom:
      app?.deliveryFrom ||
      "",

    deliveryTo:
      app?.deliveryTo ||
      "",

    status: status as ApplicationStatus,

    rejectionReason:
      app?.rejectionReason ||
      request.rejectionReason,

    createdAt:
      app?.createdAt ||
      app?.submittedAt ||
      request.createdAt ||
      new Date().toISOString(),
  };
}

export default function DriversClient() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<"all" | ApplicationStatus>("all");

  async function loadApplications() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/drivers/requests",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "حدث خطأ أثناء تحميل الطلبات."
        );
      }

      /*
       * الـ API الشغال عندك يرجع:
       *
       * {
       *   success: true,
       *   requests: [...]
       * }
       *
       * لذلك نأخذ requests
       * ثم نحولها فقط للشكل الذي يحتاجه التصميم.
       */

      const requests: DriverRequest[] =
        Array.isArray(data?.requests)
          ? data.requests
          : [];

      const normalized =
        requests.map(normalizeRequest);

      setApplications(normalized);
    } catch (error) {
      console.error(
        "LOAD DRIVER REQUESTS:",
        error
      );

      setApplications([]);

      alert(
        error instanceof Error
          ? error.message
          : "تعذر تحميل طلبات المندوبين."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const filtered =
    filter === "all"
      ? applications
      : applications.filter(
          (item) =>
            item.status === filter
        );

  const pending =
    applications.filter(
      (x) => x.status === "pending"
    ).length;

  const approved =
    applications.filter(
      (x) => x.status === "approved"
    ).length;

  const rejected =
    applications.filter(
      (x) => x.status === "rejected"
    ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] pb-20 text-slate-900"
    >
      {/* Header */}

      <section className="bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-orange-400">

                <Truck size={20} />

                <span className="text-sm font-bold">
                  إدارة المندوبين
                </span>

              </div>

              <h1 className="text-3xl font-black">
                طلبات الانضمام
              </h1>

              <p className="mt-3 text-sm text-slate-400">
                راجع بيانات المتقدمين واعتمد
                المندوبين المناسبين.
              </p>

            </div>

            <button
              type="button"
              onClick={loadApplications}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              تحديث

            </button>

          </div>

        </div>
      </section>

      {/* Stats */}

      <section className="mx-auto -mt-7 max-w-7xl px-4">

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Stat
            title="كل الطلبات"
            value={applications.length}
            icon={
              <Users size={21} />
            }
            className="bg-slate-100 text-slate-700"
          />

          <Stat
            title="قيد المراجعة"
            value={pending}
            icon={
              <Clock3 size={21} />
            }
            className="bg-orange-50 text-orange-600"
          />

          <Stat
            title="المقبولون"
            value={approved}
            icon={
              <CheckCircle2 size={21} />
            }
            className="bg-emerald-50 text-emerald-600"
          />

          <Stat
            title="المرفوضون"
            value={rejected}
            icon={
              <XCircle size={21} />
            }
            className="bg-red-50 text-red-600"
          />

        </div>

      </section>

      {/* Filters */}

      <section className="mx-auto mt-10 max-w-7xl px-4">

        <div className="mb-6 flex flex-wrap gap-3">

          <Filter
            active={filter === "all"}
            onClick={() =>
              setFilter("all")
            }
          >
            الكل
          </Filter>

          <Filter
            active={filter === "pending"}
            onClick={() =>
              setFilter("pending")
            }
          >
            قيد المراجعة
          </Filter>

          <Filter
            active={filter === "approved"}
            onClick={() =>
              setFilter("approved")
            }
          >
            المقبولون
          </Filter>

          <Filter
            active={filter === "rejected"}
            onClick={() =>
              setFilter("rejected")
            }
          >
            المرفوضون
          </Filter>

        </div>

        {/* Content */}

        {loading ? (

          <Loading />

        ) : filtered.length === 0 ? (

          <Empty />

        ) : (

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filtered.map(
              (application) => (

                <ApplicationCard
                  key={application._id}
                  application={application}
                />

              )
            )}

          </div>

        )}

      </section>
    </main>
  );
}

function ApplicationCard({
  application,
}: {
  application: Application;
}) {
  const status =
    statusConfig[
      application.status
    ] ?? statusConfig.pending;

  const user =
    application.user;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 transition hover:-translate-y-1">

      <div className="p-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            {user?.avatar ? (

              <img
                src={user.avatar}
                alt={
                  user.fullName
                }
                className="h-14 w-14 rounded-2xl object-cover"
              />

            ) : (

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <Users size={25} />

              </div>

            )}

            <div>

              <h3 className="font-black">

                {user?.fullName ||
                  "بدون اسم"}

              </h3>

              <p className="mt-1 text-xs text-slate-400">

                {user?.phone ||
                  "لا يوجد رقم"}

              </p>

            </div>

          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black ${status.className}`}
          >
            {status.label}
          </span>

        </div>

        <div className="mt-6 space-y-3">

          <Info
            label="البريد"
            value={
              user?.email ||
              "غير محدد"
            }
          />

          <Info
            label="المدينة"
            value={
              user?.city ||
              "غير محدد"
            }
          />

          <Info
            label="العنوان"
            value={
              application.address ||
              user?.address ||
              "غير محدد"
            }
          />

          <Info
            label="تفاصيل العنوان"
            value={
              application.addressDetails ||
              "غير محدد"
            }
          />

          <Info
            label="منطقة التوصيل"
            value={`${application.deliveryFrom || "غير محدد"} → ${
              application.deliveryTo ||
              "غير محدد"
            }`}
          />

          <Info
            label="تاريخ الطلب"
            value={
              application.createdAt
                ? new Date(
                    application.createdAt
                  ).toLocaleDateString(
                    "ar-EG"
                  )
                : "غير محدد"
            }
          />

        </div>

      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 p-4">

        <Link
          href={`/admin/drivers/${application._id}`}
          
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
        >

          <Eye size={17} />

          عرض التفاصيل

        </Link>

      </div>

    </div>
  );
}

function Stat({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/30">

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
      >
        {icon}
      </div>

      <p className="text-sm font-bold text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>

    </div>
  );
}

function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-lg"
          : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500"
      }`}
    >
      {children}
    </button>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">

      <span className="shrink-0 font-bold text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-left font-bold text-slate-700">
        {value}
      </span>

    </div>
  );
}

function Loading() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center">

      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

      <p className="mt-4 text-sm font-bold text-slate-400">
        جاري تحميل الطلبات...
      </p>

    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

      <Users
        size={45}
        className="mx-auto text-slate-300"
      />

      <h3 className="mt-4 text-lg font-black">
        لا توجد طلبات
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        لا توجد طلبات مندوبين في هذا التصنيف.
      </p>

    </div>
  );
}