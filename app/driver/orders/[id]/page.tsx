"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  User,
  XCircle,
} from "lucide-react";

type Status =
  | "pending_admin"
  | "admin_rejected"
  | "pending_driver"
  | "driver_accepted"
  | "driver_rejected"
  | "driver_timeout"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

interface Order {
  _id: string;

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

  paymentMethod:
    | "cash_on_delivery"
    | "card";

  deliveryFee: number;

  status: Status;

  driverResponseExpiresAt?: string | null;

  driverAcceptedAt?: string | null;

  pickedUpAt?: string | null;

  deliveredAt?: string | null;

  cancelledAt?: string | null;

  cancellationReason?: string;

  driverRejectionReason?: string;

  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
  } | null;

  createdAt: string;
}

const statusConfig: Record<
  Status,
  {
    label: string;
    description: string;
  }
> = {
  pending_admin: {
    label: "بانتظار الإدارة",
    description:
      "الطلب لم يتم إسناده للمندوب بعد.",
  },

  admin_rejected: {
    label: "مرفوض من الإدارة",
    description:
      "تم رفض الطلب من الإدارة.",
  },

  pending_driver: {
    label: "بانتظار موافقتك",
    description:
      "تم إرسال الطلب إليك وفي انتظار ردك.",
  },

  driver_accepted: {
    label: "تمت الموافقة",
    description:
      "وافقت على توصيل الطلب.",
  },

  driver_rejected: {
    label: "تم الرفض",
    description:
      "قمت برفض هذا الطلب.",
  },

  driver_timeout: {
    label: "انتهى الوقت",
    description:
      "انتهى الوقت المحدد للرد على الطلب.",
  },

  picked_up: {
    label: "تم الاستلام",
    description:
      "تم استلام الشحنة من العميل.",
  },

  on_the_way: {
    label: "في الطريق",
    description:
      "أنت الآن في طريقك إلى المستلم.",
  },

  delivered: {
    label: "تم التسليم",
    description:
      "تم تسليم الشحنة بنجاح.",
  },

  cancelled: {
    label: "الطلب ملغي",
    description:
      "تم إلغاء الطلب.",
  },
};

export default function DriverOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [showReject, setShowReject] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState("");

  const [remaining, setRemaining] =
    useState(0);

  useEffect(() => {
    async function init() {
      const resolved =
        await params;

      setId(resolved.id);

      await loadOrder(
        resolved.id
      );
    }

    init();
  }, [params]);

  useEffect(() => {
    if (
      !order?.driverResponseExpiresAt
    ) {
      setRemaining(0);
      return;
    }

    function updateTimer() {
      const expires =
        new Date(
          order!.driverResponseExpiresAt!
        ).getTime();

      setRemaining(
        Math.max(
          0,
          expires - Date.now()
        )
      );
    }

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000
      );

    return () =>
      clearInterval(interval);
  }, [
    order?.driverResponseExpiresAt,
  ]);

  useEffect(() => {
    if (!id) return;

    const interval =
      setInterval(() => {
        loadOrder(
          id,
          true
        );
      }, 10000);

    return () =>
      clearInterval(interval);
  }, [id]);

  async function loadOrder(
    orderId: string,
    silent = false
  ) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res =
        await fetch(
          `/api/driver/orders/${orderId}`,
          {
            credentials:
              "include",
            cache: "no-store",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تحميل الطلب."
        );
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAction(
    action:
      | "accept"
      | "reject"
      | "pickup"
      | "on_the_way"
      | "delivered",
    reason?: string
  ) {
    if (!id) return;

    try {
      setActionLoading(true);
      setError("");
      setNotice("");

      const res =
        await fetch(
          `/api/driver/orders/${id}`,
          {
            method: "PATCH",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action,
              reason,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تنفيذ العملية."
        );
      }

      setNotice(
        data.message
      );

      setShowReject(false);
      setRejectReason("");

      await loadOrder(
        id,
        true
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء تنفيذ العملية."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function formatTimer(
    milliseconds: number
  ) {
    const seconds =
      Math.floor(
        milliseconds / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return `${minutes
      .toString()
      .padStart(
        2,
        "0"
      )}:${remainingSeconds
      .toString()
      .padStart(
        2,
        "0"
      )}`;
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FAFC] p-8"
      >
        <div className="mx-auto max-w-5xl">
          <div className="h-64 animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FAFC] p-8"
      >
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-12 text-center">
          <XCircle
            size={50}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-xl font-black">
            الطلب غير موجود
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <Link
            href="/driver/orders"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            العودة للطلبات
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus =
    statusConfig[
      order.status
    ];

  const canAccept =
    order.status ===
    "pending_driver";

  const canPickup =
    order.status ===
    "driver_accepted";

  const canMove =
    order.status ===
    "picked_up";

  const canDeliver =
    order.status ===
    "on_the_way";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/driver/orders"
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-orange-500"
            >
              <ArrowRight
                size={17}
              />
              العودة للطلبات
            </Link>

            <h1 className="text-3xl font-black text-slate-950">
              تفاصيل الطلب
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              #
              {order._id
                .slice(-8)
                .toUpperCase()}
            </p>
          </div>

          {refreshing && (
            <RefreshCw
              size={19}
              className="animate-spin text-orange-500"
            />
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600">
            <CheckCircle2
              size={19}
            />

            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAIN */}

          <div className="space-y-6 lg:col-span-2">

            {/* STATUS */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-orange-500">
                    الحالة الحالية
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {
                      currentStatus.label
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {
                      currentStatus.description
                    }
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
                  {
                    order.deliveryFee
                  }{" "}
                  جنيه
                </span>
              </div>

              <Timeline
                status={
                  order.status
                }
              />

              {order.status ===
                "pending_driver" &&
                remaining > 0 && (
                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-orange-50 p-5">
                    <div>
                      <p className="text-xs font-bold text-orange-500">
                        وقت الرد المتبقي
                      </p>

                      <p className="mt-1 text-3xl font-black text-orange-600">
                        {
                          formatTimer(
                            remaining
                          )
                        }
                      </p>
                    </div>

                    <Clock3
                      size={30}
                      className="text-orange-500"
                    />
                  </div>
                )}
            </section>

            {/* CUSTOMER */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <User
                    size={20}
                  />
                }
                title="بيانات العميل"
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Info
                  label="الاسم"
                  value={
                    order
                      .customer
                      ?.fullName ||
                    "غير متوفر"
                  }
                />

                <Info
                  label="الهاتف"
                  value={
                    order
                      .customer
                      ?.phone ||
                    "غير متوفر"
                  }
                />

                <Info
                  label="البريد"
                  value={
                    order
                      .customer
                      ?.email ||
                    "غير متوفر"
                  }
                />
              </div>
            </section>

            {/* DELIVERY */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <MapPin
                    size={20}
                  />
                }
                title="تفاصيل الشحنة"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <LocationBox
                  title="الاستلام"
                  city={
                    order
                      .pickup
                      .city
                  }
                  address={
                    order
                      .pickup
                      .address
                  }
                  details={
                    order
                      .pickup
                      .details
                  }
                />

                <LocationBox
                  title="التسليم"
                  city={`${order.delivery.governorate} - ${order.delivery.city}`}
                  address={
                    order
                      .delivery
                      .address
                  }
                  details={
                    order
                      .delivery
                      .details
                  }
                />
              </div>

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
                <Info
                  label="اسم المستلم"
                  value={
                    order
                      .delivery
                      .recipientName
                  }
                />

                <Info
                  label="هاتف المستلم"
                  value={
                    order
                      .delivery
                      .recipientPhone
                  }
                />
              </div>
            </section>
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* PAYMENT */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <CreditCard
                    size={20}
                  />
                }
                title="الدفع"
              />

              <div className="flex justify-between">
                <span className="text-sm text-slate-400">
                  الطريقة
                </span>

                <span className="font-black">
                  {order.paymentMethod ===
                  "card"
                    ? "بطاقة"
                    : "كاش عند الاستلام"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-400">
                  رسوم التوصيل
                </span>

                <span className="text-2xl font-black text-orange-500">
                  {
                    order.deliveryFee
                  }{" "}
                  جنيه
                </span>
              </div>
            </section>

            {/* ACTIONS */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <Truck
                    size={20}
                  />
                }
                title="إجراءات الطلب"
              />

              {canAccept && (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      handleAction(
                        "accept"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <CheckCircle2
                      size={19}
                    />

                    {actionLoading
                      ? "جاري التنفيذ..."
                      : "قبول الطلب"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      setShowReject(
                        true
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-4 font-black text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle
                      size={19}
                    />

                    رفض الطلب
                  </button>
                </div>
              )}

              {canPickup && (
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleAction(
                      "pickup"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-4 font-black text-white transition hover:bg-indigo-600 disabled:opacity-50"
                >
                  <Package
                    size={19}
                  />

                  تم استلام الشحنة
                </button>
              )}

              {canMove && (
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleAction(
                      "on_the_way"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 py-4 font-black text-white transition hover:bg-purple-600 disabled:opacity-50"
                >
                  <Truck
                    size={19}
                  />

                  في الطريق
                </button>
              )}

              {canDeliver && (
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleAction(
                      "delivered"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckCircle2
                    size={19}
                  />

                  تم التسليم
                </button>
              )}

              {order.status ===
                "cancelled" && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                  هذا الطلب تم إلغاؤه.
                </div>
              )}

              {order.status ===
                "driver_rejected" &&
                order.driverRejectionReason && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-400">
                      سبب الرفض
                    </p>

                    <p className="mt-2 text-sm font-bold leading-6 text-red-600">
                      {
                        order.driverRejectionReason
                      }
                    </p>
                  </div>
                )}
            </section>

            {/* ORDER INFO */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <Clock3
                    size={20}
                  />
                }
                title="معلومات الطلب"
              />

              <Info
                label="رقم الطلب"
                value={`#${order._id
                  .slice(-8)
                  .toUpperCase()}`}
              />

              <div className="mt-4">
                <Info
                  label="وقت إنشاء الطلب"
                  value={new Date(
                    order.createdAt
                  ).toLocaleString(
                    "ar-EG"
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* REJECT MODAL */}

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <XCircle
                size={25}
              />
            </div>

            <h2 className="text-xl font-black">
              رفض الطلب؟
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              اكتب سبب رفضك للطلب
              حتى تستطيع الإدارة
              التعامل معه.
            </p>

            <textarea
              value={
                rejectReason
              }
              onChange={(e) =>
                setRejectReason(
                  e.target.value
                )
              }
              rows={4}
              placeholder="سبب رفض الطلب..."
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-red-400"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowReject(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 py-3 font-bold text-slate-600"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={
                  actionLoading ||
                  !rejectReason.trim()
                }
                onClick={() =>
                  handleAction(
                    "reject",
                    rejectReason.trim()
                  )
                }
                className="rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
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

function Timeline({
  status,
}: {
  status: Status;
}) {
  const steps = [
    "تم إرسال الطلب",
    "تمت موافقة الإدارة",
    "تم إرساله إليك",
    "تمت الموافقة",
    "تم الاستلام",
    "في الطريق",
    "تم التسليم",
  ];

  const statusOrder = [
    "pending_admin",
    "pending_driver",
    "driver_accepted",
    "picked_up",
    "on_the_way",
    "delivered",
  ];

  let activeIndex =
    statusOrder.indexOf(
      status
    );

  if (
    status === "pending_admin"
  ) {
    activeIndex = 0;
  }

  if (
    status === "admin_rejected"
  ) {
    activeIndex = -1;
  }

  if (
    status === "driver_rejected" ||
    status === "driver_timeout"
  ) {
    activeIndex = 2;
  }

  if (status === "cancelled") {
    activeIndex = -1;
  }

  return (
    <div className="mt-7">
      {steps.map(
        (step, index) => {
          const completed =
            index <=
            activeIndex + 1;

          return (
            <div
              key={step}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    completed
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2
                      size={18}
                    />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  )}
                </div>

                {index <
                  steps.length -
                    1 && (
                  <div
                    className={`h-8 w-px ${
                      completed
                        ? "bg-emerald-200"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              <p
                className={`pt-2 text-sm font-black ${
                  completed
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        }
      )}
    </div>
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

      <h2 className="font-black text-slate-900">
        {title}
      </h2>
    </div>
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

      <p className="break-words text-sm font-black text-slate-700">
        {value}
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
    <div className="rounded-2xl bg-slate-50 p-5">
      <h3 className="font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm font-black text-orange-500">
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