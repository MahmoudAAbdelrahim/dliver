"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, UserCircle, Navigation } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface NavbarProps {
  initialUser: any;
}

type Role = "guest" | "customer" | "driver" | "admin";

export default function Navbar({ initialUser }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // نخلي zustand يقرا الـ localStorage الأول (كاش بس، مش مصدر الحقيقة)
    useAuthStore.persist.rehydrate();

    if (initialUser) {
      // السيرفر (كوكي متحقق منها) هو الحقيقة المطلقة دايمًا
      setUser(initialUser);
    } else {
      // مفيش توكن صالح على السيرفر = مفيش يوزر، نضف أي كاش قديم
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  const role: Role = initialUser?.role ?? user?.role ?? "guest";

  const [isOpen, setIsOpen] = useState(false);

  const publicLinks = [
    { title: "الرئيسية", href: "/" },
    { title: "من نحن", href: "/about" },
    { title: "تواصل معنا", href: "/contact" },
  ];

  const roleLinks = {
    guest: [
      { title: "تسجيل الدخول", href: "/login", isOutline: true },
      { title: "إنشاء حساب", href: "/register", isOutline: false },
    ],
    customer: [
      { title: "لوحة التحكم", href: "/orders", isOutline: true },
      { title: "اشحن طلب الآن", href: "/orders/create", isOutline: false },
    ],
    driver: [
      { title: "طلباتي", href: "/driver/orders", isOutline: true },
      { title: "لوحة التحكم", href: "/driver/dashboard", isOutline: false },
    ],
    admin: [
      { title: "لوحة التحكم", href: "/admin/dashboard", isOutline: false },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 transition-transform group-hover:rotate-12">
            <Navigation className="h-5 w-5 fill-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Sendly
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-orange-500 after:absolute after:bottom-[-29px] after:left-0 after:h-[2px] after:w-0 after:bg-orange-500 after:transition-all hover:after:w-full"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {roleLinks[role].map((link) =>
            link.isOutline ? (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                {link.title}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95"
              >
                {link.title}
              </Link>
            )
          )}

          {role !== "guest" && (
            <Link
              href="/profile"
              className="ml-2 border-r border-slate-200 pr-4 text-slate-600 transition-colors hover:text-orange-500"
            >
              <UserCircle size={30} strokeWidth={1.5} />
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute inset-x-0 top-20 z-50 border-b border-slate-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-5 duration-200 lg:hidden">
          <div className="flex flex-col gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-base font-semibold text-slate-600 hover:text-orange-500"
              >
                {link.title}
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100" />

            <div className="flex flex-col gap-3">
              {roleLinks[role].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    link.isOutline
                      ? "border border-slate-200 text-slate-700 bg-white"
                      : "bg-slate-900 text-white hover:bg-orange-500"
                  }`}
                >
                  {link.title}
                </Link>
              ))}

              {role !== "guest" && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-700"
                >
                  <UserCircle size={18} />
                  <span>الملف الشخصي</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}