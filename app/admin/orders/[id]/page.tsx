"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  User,
  XCircle,
  Truck,
  CreditCard,
} from "lucide-react";

interface Driver {
  _id: string;
  fullName: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
}

interface Order {
  _id: string;

  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };

  pickup: {
    method: "hand_to_hand" | "drop_off";
    address: string;
    city: string;
    details: string;
  };

  delivery: {
    recipientName: string;
    recipientPhone: string;
    governorate: string;
    city: string;
    address: string;
    details: string;
  };

  images: string[];

  paymentMethod: "cash_on_delivery" | "card";

  deliveryFee: number;

  status: string;

  driver?: Driver | null;

  createdAt: string;
}

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [selectedDriver, setSelectedDriver] =
    useState("");

  const [adminNotes, setAdminNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showReject, setShowReject] =
    useState(false);

  const [id, setId] =
    useState<string>("");

  useEffect(() => {
    async function init() {
      const resolved = await params;

      setId(resolved.id);

      await Promise.all([
        loadOrder(resolved.id),
        loadDrivers(),
      ]);
    }

    init();
  }, [params]);

  async function loadOrder(orderId: string) {
    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تحميل الطلب."
        );
      }

      setOrder(data.order);

      if (data.order.driver?._id) {
        setSelectedDriver(
          data.order.driver._id
        );
      }
    } catch (error: any) {
      alert(
        error.message ||
          "حدث خطأ."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDrivers() {
    try {
      const res = await fetch(
        "/api/drivers",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDrivers(data.drivers || []);
      }
    } catch {
      console.error(
        "Failed to load drivers"
      );
    }
  }

  async function handleAction(
    action: "approve" | "reject"
  ) {
    if (!id) return;

    if (
      action === "approve" &&
      !selectedDriver
    ) {
      alert(
        "اختر مندوب أولاً."
      );
      return;
    }

    if (
      action === "reject" &&
      !adminNotes.trim()
    ) {
      alert(
        "اكتب سبب رفض الطلب."
      );
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/orders/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            driverId:
              action === "approve"
                ? selectedDriver
                : undefined,
            adminNotes,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تنفيذ العملية."
        );
      }

      alert(data.message);

      window.location.href =
        "/admin/dashboard";
    } catch (error: any) {
      alert(
        error.message ||
          "حدث خطأ."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50 p-8"
      >
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-bold text-slate-400">
            جاري تحميل بيانات الطلب...
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50 p-8"
      >
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-12 text-center">
          <XCircle
            className="mx-auto text-red-500"
            size={50}
          />

          <h1 className="mt-4 text-xl font-black">
            الطلب غير موجود
          </h1>

          <Link
            href="/admin/dashboard"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-500"
            >
              <ArrowRight size={17} />
              العودة للوحة التحكم
            </Link>

            <h1 className="text-3xl font-black">
              مراجعة الطلب
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              #{order._id}
            </p>
          </div>

          <StatusBadge
            status={order.status}
          />

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main */}

          <div className="space-y-6 lg:col-span-2">

            {/* Customer */}

            <Card
              title="بيانات العميل"
              icon={<User size={20} />}
            >
              <div className="grid gap-4 md:grid-cols-3">

                <Info
                  label="الاسم"
                  value={
                    order.customerInfo
                      .fullName
                  }
                />

                <Info
                  label="الهاتف"
                  value={
                    order.customerInfo
                      .phone
                  }
                />

                <Info
                  label="البريد الإلكتروني"
                  value={
                    order.customerInfo
                      .email
                  }
                />

              </div>
            </Card>

            {/* Route */}

            <Card
              title="تفاصيل الشحن"
              icon={<MapPin size={20} />}
            >

              <div className="grid gap-5 md:grid-cols-2">

                <LocationBox
                  title="مكان الاستلام"
                  city={
                    order.pickup.city
                  }
                  address={
                    order.pickup.address
                  }
                  details={
                    order.pickup.details
                  }
                />

                <LocationBox
                  title="مكان التسليم"
                  city={`${order.delivery.governorate} - ${order.delivery.city}`}
                  address={
                    order.delivery.address
                  }
                  details={
                    order.delivery.details
                  }
                />

              </div>

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">

                <Info
                  label="طريقة الاستلام"
                  value={
                    order.pickup
                      .method ===
                    "hand_to_hand"
                      ? "استلام يد بيد"
                      : "تركها في المكان المحدد"
                  }
                />

                <Info
                  label="المستلم"
                  value={
                    order.delivery
                      .recipientName
                  }
                />

                <Info
                  label="هاتف المستلم"
                  value={
                    order.delivery
                      .recipientPhone
                  }
                />

              </div>

            </Card>

            {/* Images */}

            <Card
              title="صور الشحنة"
              icon={<Package size={20} />}
            >
              {order.images.length ===
              0 ? (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                  لا توجد صور مرفقة.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                  {order.images.map(
                    (image, index) => (
                      <a
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        key={image}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <Image
                          src={image}
                          alt={`صورة الشحنة ${index + 1}`}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </a>
                    )
                  )}

                </div>
              )}
            </Card>

          </div>

          {/* Sidebar */}

          <aside className="space-y-6">

            {/* Payment */}

            <Card
              title="تفاصيل الدفع"
              icon={
                <CreditCard
                  size={20}
                />
              }
            >

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  طريقة الدفع
                </span>

                <span className="font-bold">
                  {order.paymentMethod ===
                  "card"
                    ? "بطاقة"
                    : "نقد عند الاستلام"}
                </span>

              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                <span className="text-sm text-slate-400">
                  رسوم التوصيل
                </span>

                <span className="text-xl font-black text-orange-500">
                  {order.deliveryFee} جنيه
                </span>

              </div>

            </Card>

            {/* Driver */}

            {order.status ===
              "pending_admin" && (
              <Card
                title="اختيار المندوب"
                icon={
                  <Truck size={20} />
                }
              >

                <div className="space-y-3">

                  {drivers.length ===
                  0 ? (
                    <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-500">
                      لا يوجد مندوبون متاحون حالياً.
                    </div>
                  ) : (
                    drivers.map(
                      (driver) => (
                        <button
                          type="button"
                          key={driver._id}
                          onClick={() =>
                            setSelectedDriver(
                              driver._id
                            )
                          }
                          className={`w-full rounded-2xl border p-4 text-right transition ${
                            selectedDriver ===
                            driver._id
                              ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500/10"
                              : "border-slate-200 hover:border-orange-300"
                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">

                              {driver.avatar ? (
                                <Image
                                  src={
                                    driver.avatar
                                  }
                                  alt={
                                    driver.fullName
                                  }
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <User
                                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400"
                                  size={22}
                                />
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-black">
                                {
                                  driver.fullName
                                }
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                <Phone
                                  size={12}
                                />
                                {
                                  driver.phone
                                }
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                <MapPin
                                  size={12}
                                />
                                {driver.city ||
                                  "غير محدد"}
                              </p>

                            </div>

                          </div>

                        </button>
                      )
                    )
                  )}

                </div>

              </Card>
            )}

            {/* Notes */}

            {order.status ===
              "pending_admin" && (
              <Card
                title="ملاحظات الإدارة"
                icon={
                  <Clock3
                    size={20}
                  />
                }
              >

                <textarea
                  value={adminNotes}
                  onChange={(e) =>
                    setAdminNotes(
                      e.target.value
                    )
                  }
                  placeholder="اكتب ملاحظات أو سبب الرفض..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />

              </Card>
            )}

            {/* Actions */}

            {order.status ===
              "pending_admin" && (
              <div className="space-y-3">

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleAction(
                      "approve"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckCircle2
                    size={19}
                  />
                  {actionLoading
                    ? "جاري التنفيذ..."
                    : "الموافقة وإرسال للمندوب"}
                </button>

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() => {
                    setShowReject(
                      true
                    );

                    if (
                      !adminNotes.trim()
                    ) {
                      setAdminNotes(
                        "تم رفض الطلب من الإدارة."
                      );
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-4 font-black text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle
                    size={19}
                  />
                  رفض الطلب
                </button>

              </div>
            )}

            {order.status ===
              "pending_driver" && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <div className="flex items-center gap-3 text-blue-600">

                  <Truck size={22} />

                  <div>
                    <p className="font-black">
                      الطلب عند المندوب
                    </p>

                    <p className="mt-1 text-xs text-blue-500">
                      بانتظار قبول أو رفض المندوب.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </aside>

        </div>

      </div>

      {/* Reject Confirmation */}

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <XCircle size={25} />
            </div>

            <h2 className="text-xl font-black">
              رفض الطلب؟
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              سيتم تسجيل الطلب كمرفوض من الإدارة.
            </p>

            <textarea
              value={adminNotes}
              onChange={(e) =>
                setAdminNotes(
                  e.target.value
                )
              }
              placeholder="سبب الرفض"
              rows={4}
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-500"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowReject(false)
                }
                className="rounded-xl border border-slate-200 py-3 font-bold text-slate-600"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  handleAction(
                    "reject"
                  )
                }
                className="rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                تأكيد الرفض
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}

/* ========================= */

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          {icon}
        </div>

        <h2 className="font-black">
          {title}
        </h2>

      </div>

      {children}

    </section>
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
    <div>
      <p className="mb-1 text-xs font-bold text-slate-400">
        {label}
      </p>

      <p className="break-words text-sm font-bold text-slate-700">
        {value || "غير متوفر"}
      </p>
    </div>
  );
}

function LocationBox({
  title,
  city,
  address,
  details,
}: {
  title: string;
  city: string;
  address: string;
  details: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <h3 className="mb-4 font-black text-slate-800">
        {title}
      </h3>

      <p className="text-sm font-bold text-orange-500">
        {city}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {address}
      </p>

      {details && (
        <p className="mt-2 border-t border-slate-200 pt-2 text-xs leading-5 text-slate-400">
          {details}
        </p>
      )}

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    pending_admin: {
      label: "بانتظار مراجعة الإدارة",
      className:
        "bg-orange-50 text-orange-600",
    },

    pending_driver: {
      label: "بانتظار المندوب",
      className:
        "bg-blue-50 text-blue-600",
    },

    driver_accepted: {
      label: "المندوب وافق",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    driver_rejected: {
      label: "المندوب رفض",
      className:
        "bg-red-50 text-red-600",
    },

    delivered: {
      label: "تم التسليم",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    cancelled: {
      label: "ملغي",
      className:
        "bg-red-50 text-red-600",
    },
  };

  const item =
    config[status] || {
      label: status,
      className:
        "bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${item.className}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {item.label}
    </span>
  );
}