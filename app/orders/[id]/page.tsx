"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
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

interface Driver {
  _id: string;
  fullName: string;
  phone: string;
  avatar?: string;
  city?: string;
}

interface Message {
  _id: string;
  message: string;
  senderRole: "customer" | "admin";
  createdAt: string;
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

  status: Status;

  driver?: Driver | null;

  driverResponseExpiresAt?: string | null;

  driverAcceptedAt?: string | null;

  pickedUpAt?: string | null;

  deliveredAt?: string | null;

  cancelledAt?: string | null;

  cancellationReason?: string;

  adminNotes?: string;

  createdAt: string;
  updatedAt: string;

  messages: Message[];
}

const statusConfig: Record<
  Status,
  {
    label: string;
    description: string;
  }
> = {
  pending_admin: {
    label: "بانتظار مراجعة الإدارة",
    description: "تم استلام طلبك وجاري مراجعته.",
  },

  admin_rejected: {
    label: "تم رفض الطلب",
    description: "تم رفض الطلب من الإدارة.",
  },

  pending_driver: {
    label: "بانتظار المندوب",
    description: "تم إرسال الطلب إلى المندوب في انتظار رده.",
  },

  driver_accepted: {
    label: "المندوب قبل الطلب",
    description: "المندوب وافق على توصيل طلبك.",
  },

  driver_rejected: {
    label: "المندوب رفض الطلب",
    description: "المندوب لم يقبل الطلب.",
  },

  driver_timeout: {
    label: "انتهى وقت المندوب",
    description: "انتهى الوقت المحدد لرد المندوب.",
  },

  picked_up: {
    label: "تم استلام الشحنة",
    description: "المندوب استلم الشحنة.",
  },

  on_the_way: {
    label: "الشحنة في الطريق",
    description: "المندوب في طريقه إلى المستلم.",
  },

  delivered: {
    label: "تم التسليم",
    description: "تم تسليم الشحنة بنجاح.",
  },

  cancelled: {
    label: "تم إلغاء الطلب",
    description: "تم إلغاء هذا الطلب.",
  },
};

export default function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [remaining, setRemaining] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [messageLoading, setMessageLoading] =
    useState(false);

  const [price, setPrice] =
    useState("");

  const [priceReason, setPriceReason] =
    useState("");

  const [priceLoading, setPriceLoading] =
    useState(false);

  const [driverReason, setDriverReason] =
    useState("");

  const [driverLoading, setDriverLoading] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("");

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [showCancel, setShowCancel] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function init() {
      const resolved = await params;

      setId(resolved.id);

      await loadOrder(resolved.id);
    }

    init();
  }, [params]);

  useEffect(() => {
    if (!order?.driverResponseExpiresAt) {
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
        loadOrder(id, true);
      }, 10000);

    return () =>
      clearInterval(interval);
  }, [id]);

  async function loadOrder(
    orderId: string,
    silent = false
  ) {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const res = await fetch(
        `/api/orders/${orderId}`,
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
    } catch (err: any) {
      if (!silent) {
        setError(
          err.message ||
            "حدث خطأ أثناء تحميل الطلب."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function sendMessage() {
    if (!id || !message.trim()) return;

    try {
      setMessageLoading(true);
      setNotice("");
      setError("");

      const res = await fetch(
        `/api/orders/${id}/message`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              message.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل إرسال الرسالة."
        );
      }

      setMessage("");
      setNotice(
        "تم إرسال رسالتك بنجاح."
      );

      await loadOrder(id, true);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء إرسال الرسالة."
      );
    } finally {
      setMessageLoading(false);
    }
  }

  async function requestPriceChange() {
    if (!id) return;

    const parsedPrice =
      Number(price);

    if (
      !price.trim() ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      setError(
        "أدخل سعرًا صحيحًا."
      );
      return;
    }

    if (!priceReason.trim()) {
      setError(
        "اكتب سبب طلب تغيير السعر."
      );
      return;
    }

    try {
      setPriceLoading(true);
      setError("");
      setNotice("");

      const res = await fetch(
        `/api/orders/${id}/change-price`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            newPrice: parsedPrice,
            reason:
              priceReason.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل إرسال طلب تغيير السعر."
        );
      }

      setPrice("");
      setPriceReason("");

      setNotice(
        "تم إرسال طلب تغيير السعر إلى الإدارة."
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء طلب تغيير السعر."
      );
    } finally {
      setPriceLoading(false);
    }
  }

  async function requestDriverChange() {
    if (!id) return;

    if (!driverReason.trim()) {
      setError(
        "اكتب سبب طلب تغيير المندوب."
      );
      return;
    }

    try {
      setDriverLoading(true);
      setError("");
      setNotice("");

      const res = await fetch(
        `/api/orders/${id}/change-driver`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason:
              driverReason.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل إرسال طلب تغيير المندوب."
        );
      }

      setDriverReason("");

      setNotice(
        "تم إرسال طلب تغيير المندوب إلى الإدارة."
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء طلب تغيير المندوب."
      );
    } finally {
      setDriverLoading(false);
    }
  }

  async function cancelOrder() {
    if (!id) return;

    try {
      setCancelLoading(true);
      setError("");
      setNotice("");

      const res = await fetch(
        `/api/orders/${id}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason:
              cancelReason.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل إلغاء الطلب."
        );
      }

      setShowCancel(false);
      setCancelReason("");

      setNotice(
        "تم إلغاء الطلب بنجاح."
      );

      await loadOrder(id);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء إلغاء الطلب."
      );
    } finally {
      setCancelLoading(false);
    }
  }

  function formatTime(ms: number) {
    const totalSeconds =
      Math.floor(ms / 1000);

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    return [
      hours
        .toString()
        .padStart(2, "0"),
      minutes
        .toString()
        .padStart(2, "0"),
      seconds
        .toString()
        .padStart(2, "0"),
    ].join(":");
  }

  function canCancel(status: Status) {
    return [
      "pending_admin",
      "pending_driver",
      "driver_rejected",
      "driver_timeout",
    ].includes(status);
  }

  function canRequestDriverChange(
    status: Status
  ) {
    return [
      "pending_driver",
      "driver_accepted",
    ].includes(status);
  }

  function canRequestPriceChange(
    status: Status
  ) {
    return ![
      "delivered",
      "cancelled",
      "admin_rejected",
    ].includes(status);
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FAFC] px-4 py-10"
      >
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-5">
            <div className="h-12 rounded-2xl bg-white" />
            <div className="h-72 rounded-3xl bg-white" />
            <div className="h-56 rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FAFC] px-4 py-10"
      >
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-12 text-center shadow-sm">
          <XCircle
            size={52}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-4 text-2xl font-black text-slate-900">
            الطلب غير موجود
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {error ||
              "تعذر تحميل بيانات الطلب."}
          </p>

          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus =
    statusConfig[order.status];

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
              href="/orders"
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-orange-500"
            >
              <ArrowRight size={17} />
              العودة للوحة التحكم
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

          <div className="flex items-center gap-3">
            {refreshing && (
              <RefreshCw
                size={18}
                className="animate-spin text-orange-500"
              />
            )}

            <StatusBadge
              status={order.status}
            />
          </div>
        </div>

        {/* NOTICES */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600">
            <CheckCircle2 size={19} />
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAIN */}

          <div className="space-y-6 lg:col-span-2">

            {/* STATUS */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-bold text-orange-500">
                  حالة الطلب الحالية
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  {currentStatus.label}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {currentStatus.description}
                </p>
              </div>

              <Timeline
                status={order.status}
              />

              {order.status ===
                "pending_driver" &&
                remaining > 0 && (
                  <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-orange-500">
                          الوقت المتبقي لرد المندوب
                        </p>

                        <p className="mt-1 text-2xl font-black text-orange-600">
                          {formatTime(
                            remaining
                          )}
                        </p>
                      </div>

                      <Clock3
                        size={30}
                        className="text-orange-500"
                      />
                    </div>
                  </div>
                )}
            </section>

            {/* DRIVER */}

            {order.driver && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={<Truck size={20} />}
                  title="المندوب"
                />

                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                    {order.driver.avatar ? (
                      <Image
                        src={
                          order.driver.avatar
                        }
                        alt={
                          order.driver.fullName
                        }
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User
                        size={25}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {
                        order.driver
                          .fullName
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {
                        order.driver
                          .phone
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        order.driver
                          .city ||
                        "غير محدد"
                      }
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* CUSTOMER */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<User size={20} />}
                title="بيانات المستلم"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Info
                  label="الاسم"
                  value={
                    order.delivery
                      .recipientName
                  }
                />

                <Info
                  label="الهاتف"
                  value={
                    order.delivery
                      .recipientPhone
                  }
                />
              </div>
            </section>

            {/* ROUTE */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<MapPin size={20} />}
                title="مسار الشحنة"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <LocationBox
                  title="مكان الاستلام"
                  city={
                    order.pickup
                      .city
                  }
                  address={
                    order.pickup
                      .address
                  }
                  details={
                    order.pickup
                      .details
                  }
                />

                <LocationBox
                  title="مكان التسليم"
                  city={`${order.delivery.governorate} - ${order.delivery.city}`}
                  address={
                    order.delivery
                      .address
                  }
                  details={
                    order.delivery
                      .details
                  }
                />
              </div>
            </section>

            {/* IMAGES */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={<Package size={20} />}
                title="صور الشحنة"
              />

              {order.images.length ===
              0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                  لا توجد صور مرفقة.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {order.images.map(
                    (image, index) => (
                      <a
                        key={`${image}-${index}`}
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <img
                          src={image}
                          alt={`صورة ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )
                  )}
                </div>
              )}
            </section>

            {/* MESSAGES */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <SectionTitle
                icon={
                  <MessageCircle
                    size={20}
                  />
                }
                title="الرسائل"
              />

              <div className="space-y-3">
                {order.messages
                  ?.length > 0 ? (
                  order.messages.map(
                    (item) => (
                      <div
                        key={item._id}
                        className={`rounded-2xl p-4 ${
                          item.senderRole ===
                          "customer"
                            ? "mr-8 bg-slate-50"
                            : "ml-8 bg-orange-50"
                        }`}
                      >
                        <p className="text-sm font-bold leading-6 text-slate-700">
                          {
                            item.message
                          }
                        </p>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {new Date(
                            item.createdAt
                          ).toLocaleString(
                            "ar-EG"
                          )}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                    لا توجد رسائل حتى الآن.
                  </div>
                )}
              </div>

              <div className="mt-5">
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="اكتب رسالة للإدارة..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
                />

                <button
                  type="button"
                  onClick={
                    sendMessage
                  }
                  disabled={
                    messageLoading ||
                    !message.trim()
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 font-black text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle
                    size={18}
                  />

                  {messageLoading
                    ? "جاري الإرسال..."
                    : "إرسال الرسالة"}
                </button>
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

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  طريقة الدفع
                </span>

                <span className="font-black text-slate-800">
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

            {/* PRICE CHANGE */}

            {canRequestPriceChange(
              order.status
            ) && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={
                    <CreditCard
                      size={20}
                    />
                  }
                  title="طلب تغيير السعر"
                />

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  placeholder="السعر الجديد"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-orange-400"
                />

                <textarea
                  value={priceReason}
                  onChange={(e) =>
                    setPriceReason(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="سبب تغيير السعر"
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-orange-400"
                />

                <button
                  type="button"
                  onClick={
                    requestPriceChange
                  }
                  disabled={
                    priceLoading
                  }
                  className="mt-3 w-full rounded-xl bg-slate-950 py-3 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {priceLoading
                    ? "جاري الإرسال..."
                    : "طلب تغيير السعر"}
                </button>
              </section>
            )}

            {/* DRIVER CHANGE */}

            {canRequestDriverChange(
              order.status
            ) && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={
                    <Truck size={20} />
                  }
                  title="طلب تغيير المندوب"
                />

                <textarea
                  value={driverReason}
                  onChange={(e) =>
                    setDriverReason(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="لماذا تريد تغيير المندوب؟"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-orange-400"
                />

                <button
                  type="button"
                  onClick={
                    requestDriverChange
                  }
                  disabled={
                    driverLoading
                  }
                  className="mt-3 w-full rounded-xl border border-orange-200 bg-orange-50 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-500 hover:text-white disabled:opacity-50"
                >
                  {driverLoading
                    ? "جاري الإرسال..."
                    : "طلب تغيير المندوب"}
                </button>
              </section>
            )}

            {/* NOTES */}

            {order.adminNotes && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={
                    <FileText
                      size={20}
                    />
                  }
                  title="ملاحظة الإدارة"
                />

                <p className="text-sm leading-7 text-slate-600">
                  {
                    order.adminNotes
                  }
                </p>
              </section>
            )}

            {/* CANCEL */}

            {canCancel(
              order.status
            ) && (
              <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setShowCancel(
                      true
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 text-sm font-black text-red-500 transition hover:bg-red-50"
                >
                  <XCircle
                    size={18}
                  />

                  إلغاء الطلب
                </button>
              </section>
            )}

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
                  label="تاريخ الإنشاء"
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

      {/* CANCEL MODAL */}

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <XCircle size={25} />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              إلغاء الطلب؟
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              سيتم إلغاء الطلب ولن
              يتمكن من متابعة رحلة
              التوصيل.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) =>
                setCancelReason(
                  e.target.value
                )
              }
              rows={4}
              placeholder="سبب الإلغاء"
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-red-400"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowCancel(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 py-3 font-bold text-slate-600"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={
                  cancelOrder
                }
                disabled={
                  cancelLoading
                }
                className="rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {cancelLoading
                  ? "جاري الإلغاء..."
                  : "تأكيد الإلغاء"}
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
    {
      key: "created",
      label: "تم إرسال الطلب",
    },
    {
      key: "admin",
      label: "مراجعة الإدارة",
    },
    {
      key: "driver",
      label: "تم إرساله للمندوب",
    },
    {
      key: "accepted",
      label: "المندوب قبل الطلب",
    },
    {
      key: "picked",
      label: "تم استلام الشحنة",
    },
    {
      key: "moving",
      label: "المندوب في الطريق",
    },
    {
      key: "delivered",
      label: "تم التسليم",
    },
  ];

  const orderSteps = [
    "pending_admin",
    "pending_driver",
    "driver_accepted",
    "picked_up",
    "on_the_way",
    "delivered",
  ];

  const statusIndex =
    orderSteps.indexOf(status);

  const getCompleted = (
    index: number
  ) => {
    if (
      status === "admin_rejected" ||
      status === "cancelled"
    ) {
      return false;
    }

    if (
      status === "driver_rejected" ||
      status === "driver_timeout"
    ) {
      return index <= 2;
    }

    return (
      index <= statusIndex + 1
    );
  };

  return (
    <div className="space-y-0">
      {steps.map(
        (step, index) => {
          const completed =
            getCompleted(
              index
            );

          return (
            <div
              key={step.key}
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
                    className={`h-10 w-px ${
                      completed
                        ? "bg-emerald-200"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              <div className="pb-8 pt-1">
                <p
                  className={`text-sm font-black ${
                    completed
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {
                    step.label
                  }
                </p>
              </div>
            </div>
          );
        }
      )}

      {(status ===
        "driver_rejected" ||
        status ===
          "driver_timeout") && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          {status ===
          "driver_rejected"
            ? "المندوب رفض الطلب."
            : "انتهى وقت رد المندوب."}
        </div>
      )}

      {status ===
        "admin_rejected" && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          تم رفض الطلب من الإدارة.
        </div>
      )}

      {status === "cancelled" && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          تم إلغاء الطلب.
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const config: Record<
    Status,
    string
  > = {
    pending_admin:
      "bg-orange-50 text-orange-600",
    admin_rejected:
      "bg-red-50 text-red-600",
    pending_driver:
      "bg-blue-50 text-blue-600",
    driver_accepted:
      "bg-emerald-50 text-emerald-600",
    driver_rejected:
      "bg-red-50 text-red-600",
    driver_timeout:
      "bg-red-50 text-red-600",
    picked_up:
      "bg-indigo-50 text-indigo-600",
    on_the_way:
      "bg-purple-50 text-purple-600",
    delivered:
      "bg-emerald-50 text-emerald-600",
    cancelled:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-black ${config[status]}`}
    >
      {statusConfig[status].label}
    </span>
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