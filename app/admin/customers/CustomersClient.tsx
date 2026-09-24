"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  Ban,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  role: "customer";
  isVerified: boolean;
  isBlocked: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

type Filter =
  | "all"
  | "active"
  | "blocked";

export default function CustomersClient() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [deleteCustomer, setDeleteCustomer] =
    useState<Customer | null>(null);

  async function loadCustomers(
    silent = false
  ) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (filter !== "all") {
        params.set(
          "status",
          filter
        );
      }

      const query =
        params.toString();

      const res = await fetch(
        `/api/admin/customers${
          query
            ? `?${query}`
            : ""
        }`,
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
            "فشل تحميل العملاء."
        );
      }

      setCustomers(
        data.customers || []
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء تحميل العملاء."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [filter]);

  const stats = useMemo(() => {
    const total =
      customers.length;

    const blocked =
      customers.filter(
        (customer) =>
          customer.isBlocked
      ).length;

    const active =
      total - blocked;

    return {
      total,
      active,
      blocked,
    };
  }, [customers]);

  async function toggleBlock(
    customer: Customer
  ) {
    try {
      setActionLoading(
        customer._id
      );

      setError("");
      setMessage("");

      const res = await fetch(
        `/api/admin/customers/${customer._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action:
              customer.isBlocked
                ? "unblock"
                : "block",
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل تحديث حالة العميل."
        );
      }

      setMessage(
        data.message
      );

      await loadCustomers(
        true
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء تحديث حالة العميل."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteCustomer) {
      return;
    }

    try {
      setActionLoading(
        deleteCustomer._id
      );

      setError("");
      setMessage("");

      const res = await fetch(
        `/api/admin/customers/${deleteCustomer._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل حذف الحساب."
        );
      }

      setDeleteCustomer(null);

      setMessage(
        data.message
      );

      await loadCustomers(
        true
      );
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء حذف الحساب."
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] px-4 py-8 md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-500">
              إدارة المنصة
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              العملاء
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              عرض وإدارة جميع حسابات العملاء.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadCustomers(true)
            }
            disabled={
              loading ||
              refreshing
            }
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

        {/* Messages */}

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {/* Stats */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <StatCard
            title="إجمالي العملاء"
            value={stats.total}
            icon={
              <UsersRound
                size={22}
              />
            }
          />

          <StatCard
            title="الحسابات النشطة"
            value={stats.active}
            icon={
              <CheckCircle2
                size={22}
              />
            }
          />

          <StatCard
            title="الحسابات الموقوفة"
            value={stats.blocked}
            icon={
              <Ban size={22} />
            }
          />
        </div>

        {/* Filters */}

        <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    loadCustomers();
                  }
                }}
                placeholder="ابحث بالاسم أو الهاتف أو البريد..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as Filter
                )
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none focus:border-orange-400"
            >
              <option value="all">
                كل العملاء
              </option>

              <option value="active">
                النشطون
              </option>

              <option value="blocked">
                الموقوفون
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                loadCustomers()
              }
              className="rounded-2xl bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:bg-orange-500"
            >
              بحث
            </button>
          </div>
        </section>

        {/* Customers */}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : customers.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <UsersRound
              size={50}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-black text-slate-700">
              لا يوجد عملاء
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              لم يتم العثور على عملاء بهذه البيانات.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map(
              (customer) => (
                <CustomerCard
                  key={
                    customer._id
                  }
                  customer={
                    customer
                  }
                  actionLoading={
                    actionLoading ===
                    customer._id
                  }
                  onToggleBlock={() =>
                    toggleBlock(
                      customer
                    )
                  }
                  onDelete={() =>
                    setDeleteCustomer(
                      customer
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}

      {deleteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2
                size={24}
              />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              حذف حساب العميل؟
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              سيتم إخفاء الحساب من قائمة
              العملاء وتعطيل دخوله للنظام.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-800">
                {
                  deleteCustomer.fullName
                }
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {
                  deleteCustomer.email
                }
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteCustomer(
                    null
                  )
                }
                disabled={
                  !!actionLoading
                }
                className="rounded-xl border border-slate-200 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  !!actionLoading
                }
                className="rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading
                  ? "جاري الحذف..."
                  : "حذف الحساب"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CustomerCard({
  customer,
  actionLoading,
  onToggleBlock,
  onDelete,
}: {
  customer: Customer;
  actionLoading: boolean;
  onToggleBlock: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="p-6">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          {/* User */}

          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
              {customer.avatar ? (
                <Image
                  src={
                    customer.avatar
                  }
                  alt={
                    customer.fullName
                  }
                  fill
                  className="object-cover"
                />
              ) : (
                <UserRound
                  size={27}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-black text-slate-900">
                  {
                    customer.fullName
                  }
                </h2>

                {customer.isVerified && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">
                    موثق
                  </span>
                )}

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                    customer.isBlocked
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {customer.isBlocked
                    ? "موقوف"
                    : "نشط"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                ID:{" "}
                {customer._id}
              </p>
            </div>
          </div>

          {/* Actions */}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                onToggleBlock
              }
              disabled={
                actionLoading
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition disabled:opacity-50 ${
                customer.isBlocked
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
              }`}
            >
              {customer.isBlocked ? (
                <>
                  <CheckCircle2
                    size={17}
                  />
                  إعادة التفعيل
                </>
              ) : (
                <>
                  <Ban
                    size={17}
                  />
                  إيقاف الحساب
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={
                actionLoading
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2
                size={17}
              />
              حذف الحساب
            </button>
          </div>
        </div>

        {/* Details */}

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2 xl:grid-cols-4">

          <Detail
            icon={
              <Mail size={16} />
            }
            label="البريد الإلكتروني"
            value={
              customer.email
            }
          />

          <Detail
            icon={
              <Phone size={16} />
            }
            label="الهاتف"
            value={
              customer.phone
            }
          />

          <Detail
            icon={
              <MapPin size={16} />
            }
            label="المدينة"
            value={
              customer.city ||
              "غير محددة"
            }
          />

          <Detail
            icon={
              <Clock3 size={16} />
            }
            label="تاريخ التسجيل"
            value={new Date(
              customer.createdAt
            ).toLocaleString(
              "ar-EG"
            )}
          />
        </div>

        {customer.address && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-400">
              العنوان
            </p>

            <p className="mt-2 text-sm font-bold text-slate-700">
              {
                customer.address
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 truncate text-sm font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>
      </div>
    </div>
  );
}