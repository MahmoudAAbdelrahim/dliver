"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  status: OrderStatus;

  driver?: {
    _id: string;
    fullName: string;
    phone: string;
    avatar?: string;
    city?: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

const statusMap: Record<
  OrderStatus,
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

  admin_rejected: {
    label: "مرفوض من الإدارة",
    className:
      "bg-red-50 text-red-600",
  },

  pending_driver: {
    label: "بانتظار المندوب",
    className:
      "bg-blue-50 text-blue-600",
  },

  driver_accepted: {
    label: "المندوب قبل الطلب",
    className:
      "bg-emerald-50 text-emerald-600",
  },

  driver_rejected: {
    label: "المندوب رفض الطلب",
    className:
      "bg-red-50 text-red-600",
  },

  driver_timeout: {
    label: "انتهى وقت المندوب",
    className:
      "bg-red-50 text-red-600",
  },

  picked_up: {
    label: "تم استلام الشحنة",
    className:
      "bg-indigo-50 text-indigo-600",
  },

  on_the_way: {
    label: "الشحنة في الطريق",
    className:
      "bg-purple-50 text-purple-600",
  },

  delivered: {
    label: "تم التسليم",
    className:
      "bg-emerald-50 text-emerald-600",
  },

  cancelled: {
    label: "تم إلغاء الطلب",
    className:
      "bg-red-50 text-red-600",
  },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [filter, setFilter] =
    useState<"all" | OrderStatus>("all");

  const [error, setError] =
    useState("");

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
        "/api/orders",
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
  }, []);

  const filteredOrders =
    useMemo(() => {
      if (filter === "all") {
        return orders;
      }

      return orders.filter(
        (order) =>
          order.status === filter
      );
    }, [orders, filter]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FAFC] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-500">
              حسابي
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              طلباتي
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              تابع جميع طلبات الشحن الخاصة بك.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {refreshing && (
              <RefreshCw
                size={18}
                className="animate-spin text-orange-500"
              />
            )}

            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
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

            <Link
              href="/orders/create"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
            >
              طلب شحن جديد
            </Link>
          </div>
        </div>

        {/* Filters */}

        <div className="mb-6 overflow-x-auto rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="flex min-w-max gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() =>
                setFilter("all")
              }
            >
              الكل
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "pending_admin"
              }
              onClick={() =>
                setFilter(
                  "pending_admin"
                )
              }
            >
              بانتظار الإدارة
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "pending_driver"
              }
              onClick={() =>
                setFilter(
                  "pending_driver"
                )
              }
            >
              بانتظار المندوب
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "driver_accepted"
              }
              onClick={() =>
                setFilter(
                  "driver_accepted"
                )
              }
            >
              المندوب قبل
            </FilterButton>

            <FilterButton
              active={
                filter === "picked_up"
              }
              onClick={() =>
                setFilter(
                  "picked_up"
                )
              }
            >
              تم الاستلام
            </FilterButton>

            <FilterButton
              active={
                filter === "on_the_way"
              }
              onClick={() =>
                setFilter(
                  "on_the_way"
                )
              }
            >
              في الطريق
            </FilterButton>

            <FilterButton
              active={
                filter === "delivered"
              }
              onClick={() =>
                setFilter(
                  "delivered"
                )
              }
            >
              تم التسليم
            </FilterButton>

            <FilterButton
              active={
                filter === "cancelled"
              }
              onClick={() =>
                setFilter(
                  "cancelled"
                )
              }
            >
              ملغي
            </FilterButton>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}

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
        ) : filteredOrders.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Package
              size={48}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-black text-slate-700">
              لا توجد طلبات
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              لا توجد طلبات مطابقة لهذا
              التصنيف.
            </p>

            <Link
              href="/orders/create"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-500"
            >
              إنشاء طلب شحن
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(
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

                      {/* Top */}

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

                      {/* Route */}

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <InfoBox
                          title="من"
                          value={`${order.pickup.city} - ${order.pickup.address}`}
                          icon={
                            <MapPinIcon />
                          }
                        />

                        <InfoBox
                          title="إلى"
                          value={`${order.delivery.city} - ${order.delivery.address}`}
                          icon={
                            <Truck
                              size={17}
                            />
                          }
                        />
                      </div>

                      {/* Bottom */}

                      <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                          <span>
                            المستلم:{" "}
                            <strong className="text-slate-700">
                              {
                                order
                                  .delivery
                                  .recipientName
                              }
                            </strong>
                          </span>

                          <span>
                            المندوب:{" "}
                            <strong className="text-slate-700">
                              {order
                                .driver
                                ?.fullName ||
                                "لم يتم التحديد"}
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
                          href={`/orders/${order._id}`}
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

function FilterButton({
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
      className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
        active
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-500"
      }`}
    >
      {children}
    </button>
  );
}

function InfoBox({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        {icon}
        {title}
      </div>

      <p className="mt-2 truncate text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MapPinIcon() {
  return (
    <span className="text-orange-500">
      📍
    </span>
  );
}