"use client";

import { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
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

  paymentMethod:
    | "cash_on_delivery"
    | "card";

  driver?: {
    _id: string;
    fullName: string;
    phone: string;
    avatar?: string;
    address?: string;
    city?: string;
  } | null;

  deliveryFee: number;

  status: OrderStatus;

  driverResponseExpiresAt?: string | null;

  createdAt: string;
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
    label: "قبله المندوب",
    className:
      "bg-emerald-50 text-emerald-600",
  },

  driver_rejected: {
    label: "رفضه المندوب",
    className:
      "bg-red-50 text-red-600",
  },

  driver_timeout: {
    label: "انتهى وقت المندوب",
    className:
      "bg-red-50 text-red-600",
  },

  picked_up: {
    label: "تم استلام الطلب",
    className:
      "bg-indigo-50 text-indigo-600",
  },

  on_the_way: {
    label: "في الطريق",
    className:
      "bg-purple-50 text-purple-600",
  },

  delivered: {
    label: "تم التوصيل",
    className:
      "bg-emerald-50 text-emerald-600",
  },

  cancelled: {
    label: "ملغي",
    className:
      "bg-red-50 text-red-600",
  },
};

export default function AdminOrdersClient() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  async function loadOrders() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (status !== "all") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      const res = await fetch(
        `/api/admin/orders?${params.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [status]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] px-4 py-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-bold text-orange-500">
              إدارة المنصة
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              جميع الطلبات
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              متابعة ومراجعة جميع عمليات الشحن.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            تحديث
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadOrders();
                  }
                }}
                placeholder="ابحث باسم العميل أو الهاتف أو البريد..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none focus:border-orange-400"
            >
              <option value="all">
                كل الطلبات
              </option>

              <option value="pending_admin">
                بانتظار الإدارة
              </option>

              <option value="pending_driver">
                بانتظار المندوب
              </option>

              <option value="driver_accepted">
                قبلها المندوب
              </option>

              <option value="picked_up">
                تم الاستلام
              </option>

              <option value="on_the_way">
                في الطريق
              </option>

              <option value="delivered">
                تم التوصيل
              </option>

              <option value="cancelled">
                ملغي
              </option>
            </select>

            <button
              onClick={loadOrders}
              className="rounded-2xl bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:bg-orange-500"
            >
              بحث
            </button>

          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-3xl bg-white"
                />
              )
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">

            <Package
              size={45}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-black text-slate-700">
              لا توجد طلبات
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              لم يتم العثور على طلبات بهذه البيانات.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">

            {orders.map((order) => {
              const statusInfo =
                statusMap[order.status];

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="p-6">

                    {/* Top */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                          <Package size={22} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            رقم الطلب
                          </p>

                          <p className="font-black text-slate-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>

                      </div>

                      <div className="flex flex-wrap items-center gap-3">

                        <span
                          className={`rounded-full px-4 py-2 text-xs font-black ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>

                        <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                          {order.deliveryFee} جنيه
                        </span>

                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                      <InfoBox
                        title="العميل"
                        value={
                          order.customerInfo
                            .fullName
                        }
                        sub={
                          order.customerInfo
                            .phone
                        }
                      />

                      <InfoBox
                        title="من"
                        value={`${order.pickup.city} - ${order.pickup.address}`}
                        sub={
                          order.pickup.method ===
                          "hand_to_hand"
                            ? "استلام يد بيد"
                            : "مكان تسليم"
                        }
                      />

                      <InfoBox
                        title="إلى"
                        value={`${order.delivery.city} - ${order.delivery.address}`}
                        sub={
                          order.delivery
                            .recipientName
                        }
                      />

                    </div>

                    {/* Bottom */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">

                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">

                        <span>
                          الدفع:{" "}
                          <strong className="text-slate-700">
                            {order.paymentMethod ===
                            "card"
                              ? "فيزا"
                              : "كاش عند الاستلام"}
                          </strong>
                        </span>

                        <span>
                          المندوب:{" "}
                          <strong className="text-slate-700">
                            {order.driver
                              ?.fullName ||
                              "لم يتم التحديد"}
                          </strong>
                        </span>

                        <span>
                          <Clock3
                            size={13}
                            className="ml-1 inline"
                          />

                          {new Date(
                            order.createdAt
                          ).toLocaleString(
                            "ar-EG"
                          )}
                        </span>

                      </div>

                      <a
                        href={`/admin/orders/${order._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                      >
                        <Eye size={17} />

                        تفاصيل الطلب
                      </a>

                    </div>

                  </div>
                </div>
              );
            })}

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