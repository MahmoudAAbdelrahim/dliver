"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  Users,
  UserCheck,
  ArrowLeft,
  RefreshCw,
  Wallet,
} from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingAdmin: number;
  pendingDriver: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  customers: number;
  drivers: number;
  approvedDrivers: number;
  revenue: number;
}

export default function AdminDashboardClient() {
  const [stats, setStats] =
    useState<Stats | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/dashboard",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = stats
    ? [
        {
          title: "إجمالي الطلبات",
          value: stats.totalOrders,
          icon: Package,
          href: "/admin/orders",
        },
        {
          title: "طلبات تحتاج مراجعة",
          value: stats.pendingAdmin,
          icon: Clock3,
          href: "/admin/orders?status=pending_admin",
        },
        {
          title: "بانتظار المندوب",
          value: stats.pendingDriver,
          icon: Truck,
          href: "/admin/orders?status=pending_driver",
        },
        {
          title: "طلبات نشطة",
          value: stats.activeOrders,
          icon: Truck,
          href: "/admin/orders",
        },
        {
          title: "طلبات مكتملة",
          value: stats.deliveredOrders,
          icon: CheckCircle2,
          href: "/admin/orders?status=delivered",
        },
        {
          title: "طلبات ملغاة",
          value: stats.cancelledOrders,
          icon: XCircle,
          href: "/admin/orders",
        },
        {
          title: "العملاء",
          value: stats.customers,
          icon: Users,
          href: "/admin/customers",
        },
        {
          title: "المندوبون المعتمدون",
          value: stats.approvedDrivers,
          icon: UserCheck,
          href: "/admin/drivers",
        },
      ]
    : [];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] px-4 py-8 text-slate-900"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="mb-1 text-sm font-bold text-orange-500">
              لوحة الإدارة
            </p>

            <h1 className="text-3xl font-black text-slate-950">
              لوحة تحكم Sendly
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              إدارة الطلبات والمندوبين والعملاء.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:border-orange-400 hover:text-orange-500"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            تحديث البيانات
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {loading
            ? Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-3xl bg-white"
                  />
                )
              )
            : cards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">

                      <div>
                        <p className="text-sm font-bold text-slate-400">
                          {card.title}
                        </p>

                        <p className="mt-3 text-3xl font-black text-slate-950">
                          {card.value.toLocaleString("ar-EG")}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                        <Icon size={22} />
                      </div>

                    </div>
                  </Link>
                );
              })}
        </div>

        {/* Revenue */}
        {stats && (
          <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-bold text-slate-400">
                  إجمالي رسوم التوصيل للطلبات المكتملة
                </p>

                <p className="mt-2 text-3xl font-black">
                  {stats.revenue.toLocaleString("ar-EG")} جنيه
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500">
                <Wallet size={25} />
              </div>

            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          <Link
            href="/admin/orders"
            className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-lg"
          >
            <div>
              <h2 className="font-black">
                إدارة الطلبات
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                مراجعة وقبول ورفض الطلبات
              </p>
            </div>

            <ArrowLeft
              size={20}
              className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500"
            />
          </Link>

          <Link
            href="/admin/drivers"
            className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-lg"
          >
            <div>
              <h2 className="font-black">
                إدارة المندوبين
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                مراجعة واعتماد المندوبين
              </p>
            </div>

            <ArrowLeft
              size={20}
              className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500"
            />
          </Link>

          <Link
            href="/admin/customers"
            className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-lg"
          >
            <div>
              <h2 className="font-black">
                العملاء
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                عرض وإدارة حسابات العملاء
              </p>
            </div>

            <ArrowLeft
              size={20}
              className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-orange-500"
            />
          </Link>

        </div>

      </div>
    </main>
  );
}