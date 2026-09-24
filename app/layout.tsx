import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/navbar"

import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://elitecarec.vercel.app"),

  title: {
    default: "إليت كير | Elite Care",
    template: "%s | إليت كير",
  },

  description:
    "إليت كير منصة وعيادة طبية ذكية متكاملة لإدارة المواعيد والملفات الطبية والعلاجات والمتابعة الطبية الرقمية بين المريض والطبيب بأعلى درجات الأمان والخصوصية.",

  keywords: [
    "إليت كير",
    "Elite Care",
    "عيادة",
    "عيادة ذكية",
    "حجز مواعيد",
    "حجز كشف",
    "طبيب",
    "دكتور",
    "ملف طبي",
    "سجل طبي",
    "متابعة علاج",
    "عيادات مصر",
    "عيادة قلب",
    "عيادة باطنة",
    "حجز طبيب اونلاين",
    "إدارة عيادات",
    "نظام عيادات",
    "Medical Clinic",
    "Healthcare",
    "Patient Management",
    "Medical Records",
    "Clinic Management System",
    "Doctor Appointment",
  ],

  authors: [
    {
      name: "Elite Care",
    },
  ],

  creator: "Elite Care",

  publisher: "Elite Care",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    title:
      "إليت كير | Elite Care Smart Clinic",

    description:
      "منصة طبية ذكية لإدارة المواعيد والملفات الطبية ومتابعة العلاج والتواصل بين الطبيب والمريض.",

    url:
      "https://elitecarec.vercel.app",

    siteName:
      "Elite Care",

    locale: "ar_EG",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Elite Care",

    description:
      "منصة طبية ذكية لإدارة العيادات والملفات الطبية ومتابعة المرضى.",
  },

  category: "Healthcare",
};

  export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

const token =
  cookieStore.get("accessToken")?.value;

let initialUser = null;

if (token) {
  try {
    initialUser = verifyAccessToken(token);
  } catch {}
}
  return (
    <html
      lang="en"
       dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
  <meta
    name="theme-color"
    content="#2563eb"
  />

  <meta
    name="application-name"
    content="Elite Care"
  />

  <meta
    name="apple-mobile-web-app-title"
    content="Elite Care"
  />

  <meta
    name="format-detection"
    content="telephone=no"
  />

  <link
    rel="canonical"
    href="https://elitecarec.vercel.app"
  />
</head>
      <body className="min-h-full flex flex-col">
<Navbar initialUser={initialUser} />

        <main className="flex-grow">
          {children}
        </main>

        
      </body>
    </html>
  );
}
