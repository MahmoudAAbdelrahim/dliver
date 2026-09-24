"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Clock3,
  Eye,
  Package,
  RefreshCw,
  Truck,
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

export default function DriverOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

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
          "حدث خطأ أثناء تحميل الطلبات."
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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-500">
              لوحة المندوب
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              طلباتي
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              الطلبات التي تم إسنادها إليك.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadOrders(true)
            }
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
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

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : orders.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Package
              size={50}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-black text-slate-700">
              لا توجد طلبات
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              لا توجد طلبات مسندة إليك حاليًا.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(
              (order) => {
                const statusInfo =
                  statusMap[
                    order.status
                  ];

                return (
                  <div
                    key={order._id}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="p-6">

                      {/* TOP */}

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                            <Package
                              size={22}
                            />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-400">
                              رقم الطلب
                            </p>

                            <p className="mt-1 font-black text-slate-950">
                              #
                              {order._id
                                .slice(
                                  -8
                                )
                                .toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-black ${statusInfo.className}`}
                          >
                            {
                              statusInfo.label
                            }
                          </span>

                          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                            {
                              order.deliveryFee
                            }{" "}
                            جنيه
                          </span>
                        </div>
                      </div>

                      {/* DETAILS */}

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <InfoBox
                          title="العميل"
                          value={
                            order
                              .customer
                              ?.fullName ||
                            "غير متوفر"
                          }
                          sub={
                            order
                              .customer
                              ?.phone
                          }
                        />

                        <InfoBox
                          title="الاستلام"
                          value={`${order.pickup.city} - ${order.pickup.address}`}
                        />

                        <InfoBox
                          title="التسليم"
                          value={`${order.delivery.city} - ${order.delivery.address}`}
                          sub={
                            order
                              .delivery
                              .recipientName
                          }
                        />
                      </div>

                      {/* BOTTOM */}

                      <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                          <span>
                            الدفع:{" "}
                            <strong className="text-slate-700">
                              {order.paymentMethod ===
                              "card"
                                ? "بطاقة"
                                : "كاش عند الاستلام"}
                            </strong>
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock3
                              size={13}
                            />

                            {new Date(
                              order.createdAt
                            ).toLocaleString(
                              "ar-EG"
                            )}
                          </span>
                        </div>

                        <Link
                          href={`/driver/orders/${order._id}`}
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                        >
                          <Eye
                            size={17}
                          />

                          تفاصيل الطلب

                          <ArrowLeft
                            size={16}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
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
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-400">
        {title}
      </p>

      <p className="mt-2 truncate font-black text-slate-800">
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