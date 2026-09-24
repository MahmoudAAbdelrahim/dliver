"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Package,
  RefreshCw,
  Truck,
  XCircle,
  Wallet,
} from "lucide-react";

type OrderStatus =
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

  status: OrderStatus;

  driverResponseExpiresAt?: string | null;

  driverAcceptedAt?: string | null;

  pickedUpAt?: string | null;

  deliveredAt?: string | null;

  createdAt: string;

  customer?: {
    fullName?: string;
    phone?: string;
  } | null;
}

const statusMap: Record<
  OrderStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending_admin: {
    label: "بانتظار الإدارة",
    className:
      "bg-orange-50 text-orange-600",
  },

  admin_rejected: {
    label: "مرفوض من الإدارة",
    className:
      "bg-red-50 text-red-600",
  },

  pending_driver: {
    label: "بانتظار موافقتك",
    className:
      "bg-blue-50 text-blue-600",
  },

  driver_accepted: {
    label: "تمت الموافقة",
    className:
      "bg-emerald-50 text-emerald-600",
  },

  driver_rejected: {
    label: "تم الرفض",
    className:
      "bg-red-50 text-red-600",
  },

  driver_timeout: {
    label: "انتهى الوقت",
    className:
      "bg-red-50 text-red-600",
  },

  picked_up: {
    label: "تم الاستلام",
    className:
      "bg-indigo-50 text-indigo-600",
  },

  on_the_way: {
    label: "في الطريق",
    className:
      "bg-purple-50 text-purple-600",
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

export default function DriverDashboardPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [remainingMap, setRemainingMap] =
    useState<Record<string, number>>({});

  async function loadOrders(
    silent = false
  ) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch(
        "/api/driver/orders",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تحميل الطلبات."
        );
      }

      setOrders(
        data.orders || []
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء تحميل بيانات لوحة التحكم."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const interval =
      setInterval(() => {
        loadOrders(true);
      }, 10000);

    return () =>
      clearInterval(interval);
  }, []);

  /*
   * Countdown للطلبات التي تنتظر موافقة المندوب
   */
  useEffect(() => {
    function updateTimers() {
      const next: Record<
        string,
        number
      > = {};

      for (const order of orders) {
        if (
          order.status ===
            "pending_driver" &&
          order.driverResponseExpiresAt
        ) {
          const expires =
            new Date(
              order.driverResponseExpiresAt
            ).getTime();

          next[order._id] =
            Math.max(
              0,
              expires -
                Date.now()
            );
        }
      }

      setRemainingMap(next);
    }

    updateTimers();

    const interval =
      setInterval(
        updateTimers,
        1000
      );

    return () =>
      clearInterval(interval);
  }, [orders]);

  const todayStart =
    useMemo(() => {
      const date = new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      return date.getTime();
    }, []);

  const todayOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          new Date(
            order.createdAt
          ).getTime() >=
          todayStart
      );
    }, [
      orders,
      todayStart,
    ]);

  const pendingOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          order.status ===
          "pending_driver"
      );
    }, [orders]);

  const activeOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          [
            "driver_accepted",
            "picked_up",
            "on_the_way",
          ].includes(
            order.status
          )
      );
    }, [orders]);

  const deliveredToday =
    useMemo(() => {
      return orders.filter(
        (order) => {
          if (
            order.status !==
            "delivered"
          ) {
            return false;
          }

          const date =
            order.deliveredAt
              ? new Date(
                  order.deliveredAt
                ).getTime()
              : new Date(
                  order.createdAt
                ).getTime();

          return (
            date >=
            todayStart
          );
        }
      );
    }, [
      orders,
      todayStart,
    ]);

  const deliveredRevenue =
    useMemo(() => {
      return deliveredToday.reduce(
        (total, order) =>
          total +
          Number(
            order.deliveryFee ||
              0
          ),
        0
      );
    }, [deliveredToday]);

  const currentOrder =
    activeOrders[0] ||
    null;

  const recentOrders =
    orders.slice(0, 5);

  function formatTimer(
    milliseconds: number
  ) {
    const totalSeconds =
      Math.floor(
        milliseconds / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${minutes
      .toString()
      .padStart(
        2,
        "0"
      )}:${seconds
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
        className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-40 animate-pulse rounded-3xl bg-white" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-3xl bg-white lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-500">
              لوحة المندوب
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              الرئيسية
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              تابع طلباتك الحالية وأدائك اليومي.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadOrders(true)
            }
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            تحديث
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="طلبات اليوم"
            value={String(
              todayOrders.length
            )}
            icon={
              <Package size={21} />
            }
          />

          <StatCard
            title="طلبات تحتاج ردك"
            value={String(
              pendingOrders.length
            )}
            icon={
              <Clock3 size={21} />
            }
            highlight={
              pendingOrders.length >
              0
            }
          />

          <StatCard
            title="طلبات قيد التنفيذ"
            value={String(
              activeOrders.length
            )}
            icon={
              <Truck size={21} />
            }
          />

          <StatCard
            title="تم تسليمها اليوم"
            value={String(
              deliveredToday.length
            )}
            icon={
              <CheckCircle2
                size={21}
              />
            }
          />
        </div>

        {/* SECOND STATS */}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">
                  رسوم التوصيل للطلبات المسلّمة اليوم
                </p>

                <p className="mt-2 text-3xl font-black">
                  {
                    deliveredRevenue
                  }{" "}
                  جنيه
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
                <Wallet
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">
                  إجمالي الطلبات
                </p>

                <p className="mt-2 text-3xl font-black text-slate-950">
                  {
                    orders.length
                  }
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Package
                  size={22}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* CURRENT ORDER */}

          <section className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-orange-500">
                  الآن
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  الطلب الحالي
                </h2>
              </div>

              <Truck
                size={22}
                className="text-orange-500"
              />
            </div>

            {!currentOrder ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <Package
                  size={45}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-black text-slate-700">
                  لا يوجد طلب قيد التنفيذ
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  عند قبول طلب جديد سيظهر هنا.
                </p>

                {pendingOrders.length >
                  0 && (
                  <Link
                    href={`/driver/orders/${pendingOrders[0]._id}`}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                  >
                    عرض الطلبات الجديدة
                    <ArrowLeft
                      size={16}
                    />
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      رقم الطلب
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-950">
                      #
                      {currentOrder._id
                        .slice(
                          -8
                        )
                        .toUpperCase()}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      statusMap[
                        currentOrder
                          .status
                      ].className
                    }`}
                  >
                    {
                      statusMap[
                        currentOrder
                          .status
                      ].label
                    }
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoBox
                    title="الاستلام"
                    value={`${currentOrder.pickup.city} - ${currentOrder.pickup.address}`}
                  />

                  <InfoBox
                    title="التسليم"
                    value={`${currentOrder.delivery.city} - ${currentOrder.delivery.address}`}
                    sub={
                      currentOrder
                        .delivery
                        .recipientName
                    }
                  />
                </div>

                <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      رسوم التوصيل
                    </p>

                    <p className="mt-1 text-2xl font-black text-orange-500">
                      {
                        currentOrder.deliveryFee
                      }{" "}
                      جنيه
                    </p>
                  </div>

                  <Link
                    href={`/driver/orders/${currentOrder._id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                  >
                    فتح الطلب
                    <ArrowLeft
                      size={17}
                    />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* NEW ORDERS */}

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-orange-500">
                  تحتاج ردك
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  الطلبات الجديدة
                </h2>
              </div>

              {pendingOrders.length >
                0 && (
                <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600">
                  {
                    pendingOrders.length
                  }
                </span>
              )}
            </div>

            {pendingOrders.length ===
            0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <CheckCircle2
                  size={35}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-3 text-sm font-bold text-slate-600">
                  لا توجد طلبات جديدة
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders
                  .slice(0, 3)
                  .map(
                    (order) => (
                      <Link
                        key={order._id}
                        href={`/driver/orders/${order._id}`}
                        className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-300 hover:bg-orange-50/30"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-400">
                              #
                              {order._id
                                .slice(
                                  -8
                                )
                                .toUpperCase()}
                            </p>

                            <p className="mt-2 font-black text-slate-800">
                              {
                                order
                                  .delivery
                                  .city
                              }
                            </p>
                          </div>

                          <div className="text-left">
                            <p className="text-sm font-black text-orange-500">
                              {
                                order.deliveryFee
                              }{" "}
                              ج
                            </p>

                            {remainingMap[
                              order
                                ._id
                            ] >
                              0 && (
                              <p className="mt-1 text-xs font-bold text-red-500">
                                {formatTimer(
                                  remainingMap[
                                    order._id
                                  ]
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  )}

                {pendingOrders.length >
                  3 && (
                  <Link
                    href="/driver/orders"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-black text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
                  >
                    عرض كل الطلبات
                    <ArrowLeft
                      size={16}
                    />
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* RECENT ORDERS */}

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-orange-500">
                آخر النشاط
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                آخر الطلبات
              </h2>
            </div>

            <Link
              href="/driver/orders"
              className="flex items-center gap-1 text-sm font-bold text-slate-400 transition hover:text-orange-500"
            >
              كل الطلبات
              <ArrowLeft
                size={16}
              />
            </Link>
          </div>

          {recentOrders.length ===
          0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <Package
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-bold text-slate-500">
                لا توجد طلبات حتى الآن.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(
                (order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Package
                          size={20}
                        />
                      </div>

                      <div>
                        <p className="font-black text-slate-900">
                          #
                          {order._id
                            .slice(
                              -8
                            )
                            .toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            order
                              .delivery
                              .recipientName
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-black ${
                          statusMap[
                            order.status
                          ].className
                        }`}
                      >
                        {
                          statusMap[
                            order.status
                          ].label
                        }
                      </span>

                      <span className="font-black text-orange-500">
                        {
                          order.deliveryFee
                        }{" "}
                        جنيه
                      </span>

                      <Link
                        href={`/driver/orders/${order._id}`}
                        className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-500"
                      >
                        <Eye
                          size={15}
                        />
                        عرض
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/driver/orders"
            className="group rounded-3xl bg-slate-950 p-6 text-white shadow-sm transition hover:bg-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black">
                  كل الطلبات
                </p>

                <p className="mt-1 text-sm text-slate-400 group-hover:text-orange-100">
                  إدارة ومتابعة الطلبات المسندة إليك
                </p>
              </div>

              <ArrowLeft
                size={22}
              />
            </div>
          </Link>

          <Link
            href="/profile"
            className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-slate-900">
                  الملف الشخصي
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  بيانات الحساب والمركبة
                </p>
              </div>

              <ArrowLeft
                size={22}
                className="text-slate-400"
              />
            </div>
          </Link>

          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-slate-900">
                  حالة الحساب
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  الحساب مفعل
                </p>
              </div>

              <CheckCircle2
                size={24}
                className="text-emerald-500"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl bg-white p-6 shadow-sm ${
        highlight
          ? "border border-orange-200"
          : "border border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            highlight
              ? "bg-orange-500 text-white"
              : "bg-orange-50 text-orange-500"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold text-slate-400">
        {title}
      </p>

      <p className="mt-2 truncate text-sm font-black text-slate-800">
        {value}
      </p>

      {sub && (
        <p className="mt-1 truncate text-xs text-slate-400">
          {sub}
        </p>
      )}
    </div>
  );
}