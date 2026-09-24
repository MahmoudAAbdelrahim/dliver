"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  Phone,
  CreditCard,
  User,
  Truck,
  X,
  Wallet,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";

type Driver = {
  _id: string;
  fullName: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
};

type PickupMethod =
  | "hand_to_hand"
  | "drop_off";

type PaymentMethod =
  | "cash_on_delivery"
  | "card";

export default function CreateOrderPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [selectedDriver, setSelectedDriver] =
    useState("");

  const [pickupMethod, setPickupMethod] =
    useState<PickupMethod>("hand_to_hand");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");

  const [form, setForm] = useState({
    pickupDetails: "",

    recipientName: "",
    recipientPhone: "",
    governorate: "",
    city: "",
    address: "",
    deliveryDetails: "",

    deliveryFee: "",
  });

  // =========================
  // Load Drivers
  // =========================

  useEffect(() => {
    async function loadDrivers() {
      try {
        setLoadingDrivers(true);

        const res = await fetch(
          "/api/orders/drivers",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "تعذر تحميل المندوبين."
          );
        }

        setDrivers(data.drivers || []);
      } catch (err: any) {
        setError(
          err.message ||
            "حدث خطأ أثناء تحميل المندوبين."
        );
      } finally {
        setLoadingDrivers(false);
      }
    }

    loadDrivers();
  }, []);

  // =========================
  // Change input
  // =========================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  // =========================
  // Cloudinary Upload
  // =========================

  async function uploadImages(
    files: FileList
  ) {
    if (images.length + files.length > 5) {
      setError(
        "يمكنك رفع 5 صور كحد أقصى."
      );
      return;
    }

    try {
      setError("");
      setUploadingImages(true);

      const uploaded: string[] = [];

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            "حجم الصورة يجب ألا يتجاوز 5MB."
          );
        }

        const cloudinaryData =
          new FormData();

        cloudinaryData.append(
          "file",
          file
        );

        cloudinaryData.append(
          "upload_preset",
          process.env
            .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        const cloudName =
          process.env
            .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        const response =
          await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: cloudinaryData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "فشل رفع الصورة."
          );
        }

        uploaded.push(
          data.secure_url
        );
      }

      setImages((prev) => [
        ...prev,
        ...uploaded,
      ]);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء رفع الصور."
      );
    } finally {
      setUploadingImages(false);
    }
  }

  function removeImage(
    index: number
  ) {
    setImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  // =========================
  // Selected driver
  // =========================

  const selectedDriverData =
    useMemo(
      () =>
        drivers.find(
          (driver) =>
            driver._id ===
            selectedDriver
        ),
      [drivers, selectedDriver]
    );

  // =========================
  // Submit
  // =========================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!user) {
      setError(
        "يجب تسجيل الدخول أولًا."
      );
      return;
    }

    if (!user.address || !user.city) {
      setError(
        "يجب إضافة عنوانك ومدينة الإقامة من الملف الشخصي أولًا."
      );
      return;
    }

    if (!form.recipientName.trim()) {
      setError(
        "اكتب اسم المستلم."
      );
      return;
    }

    if (!form.recipientPhone.trim()) {
      setError(
        "اكتب رقم هاتف المستلم."
      );
      return;
    }

    if (!form.governorate.trim()) {
      setError(
        "اكتب محافظة المستلم."
      );
      return;
    }

    if (!form.city.trim()) {
      setError(
        "اكتب مدينة المستلم."
      );
      return;
    }

    if (!form.address.trim()) {
      setError(
        "اكتب عنوان المستلم."
      );
      return;
    }

    if (
      !form.deliveryDetails.trim()
    ) {
      setError(
        "اكتب عنوان المستلم بالتفصيل."
      );
      return;
    }

    if (!selectedDriver) {
      setError(
        "اختر مندوبًا لتوصيل الطلب."
      );
      return;
    }

    const deliveryFee =
      Number(form.deliveryFee);

    if (
      !Number.isFinite(
        deliveryFee
      ) ||
      deliveryFee <= 0
    ) {
      setError(
        "اكتب سعر توصيل صحيح."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/orders/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            pickup: {
              method: pickupMethod,

              // العنوان يأتي من الحساب
              address:
                user.address,

              city:
                user.city,

              details:
                pickupMethod ===
                "drop_off"
                  ? form.pickupDetails
                  : "",
            },

            delivery: {
              recipientName:
                form.recipientName,

              recipientPhone:
                form.recipientPhone,

              governorate:
                form.governorate,

              city:
                form.city,

              address:
                form.address,

              details:
                form.deliveryDetails,
            },

            images,

            paymentMethod,

            driver:
              selectedDriver,

            deliveryFee,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "فشل إنشاء الطلب."
        );
      }

      setMessage(
        "تم إرسال الطلب بنجاح، وهو الآن بانتظار مراجعة الإدارة."
      );

      setTimeout(() => {
        router.push("/orders");
      }, 1800);
    } catch (err: any) {
      setError(
        err.message ||
          "حدث خطأ أثناء إنشاء الطلب."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAFAFA] pb-24"
    >
      {/* Header */}

      <div className="bg-slate-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() =>
              router.back()
            }
            className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
          >
            <ArrowRight size={18} />
            الرجوع
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <Package size={27} />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                إنشاء طلب شحن
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                أرسل طلبك واختر المندوب المناسب
                لك.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto -mt-6 max-w-5xl space-y-6 px-4"
      >
        {/* Messages */}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 font-bold text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 font-bold text-emerald-600 shadow-sm">
            {message}
          </div>
        )}

        {/* Customer Information */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={<User size={20} />}
            title="بياناتك"
            description="هذه البيانات مأخوذة تلقائيًا من حسابك."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ReadOnlyInput
              label="الاسم بالكامل"
              value={user?.fullName}
            />

            <ReadOnlyInput
              label="البريد الإلكتروني"
              value={user?.email}
              ltr
            />

            <ReadOnlyInput
              label="رقم الهاتف"
              value={user?.phone}
              ltr
            />

            <ReadOnlyInput
              label="المدينة"
              value={user?.city}
            />

            <div className="md:col-span-2">
              <ReadOnlyInput
                label="عنوان الاستلام"
                value={user?.address}
              />
            </div>
          </div>
        </section>

        {/* Pickup */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={<MapPin size={20} />}
            title="طريقة استلام الشحنة"
            description="حدد كيف سيستلم المندوب الشحنة منك."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Choice
              selected={
                pickupMethod ===
                "hand_to_hand"
              }
              onClick={() =>
                setPickupMethod(
                  "hand_to_hand"
                )
              }
              icon={<Truck size={21} />}
              title="يدًا بيد"
              description="تسليم الشحنة للمندوب مباشرة."
            />

            <Choice
              selected={
                pickupMethod ===
                "drop_off"
              }
              onClick={() =>
                setPickupMethod(
                  "drop_off"
                )
              }
              icon={<MapPin size={21} />}
              title="مكان محدد"
              description="اترك الشحنة في مكان يحدده العميل."
            />
          </div>

          {pickupMethod ===
            "drop_off" && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                تفاصيل مكان ترك الشحنة
              </label>

              <textarea
                name="pickupDetails"
                value={
                  form.pickupDetails
                }
                onChange={
                  handleChange
                }
                rows={3}
                placeholder="مثال: الشحنة عند الأمن، برج 5، الدور الأرضي..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          )}
        </section>

        {/* Delivery */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={<MapPin size={20} />}
            title="بيانات المستلم"
            description="اكتب المكان الذي سيذهب إليه الطلب بالتفصيل."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="اسم المستلم"
              name="recipientName"
              value={
                form.recipientName
              }
              onChange={
                handleChange
              }
              placeholder="محمد أحمد"
              icon={<User size={18} />}
            />

            <Input
              label="رقم هاتف المستلم"
              name="recipientPhone"
              value={
                form.recipientPhone
              }
              onChange={
                handleChange
              }
              placeholder="01xxxxxxxxx"
              icon={<Phone size={18} />}
              ltr
            />

            <Input
              label="المحافظة"
              name="governorate"
              value={
                form.governorate
              }
              onChange={
                handleChange
              }
              placeholder="أسيوط"
            />

            <Input
              label="المدينة"
              name="city"
              value={form.city}
              onChange={
                handleChange
              }
              placeholder="أسيوط"
            />

            <div className="md:col-span-2">
              <Input
                label="العنوان"
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                placeholder="اسم الشارع، رقم العقار..."
                icon={
                  <MapPin
                    size={18}
                  />
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                العنوان بالتفصيل
              </label>

              <textarea
                name="deliveryDetails"
                value={
                  form.deliveryDetails
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="الدور، الشقة، علامة مميزة، أقرب محل أو شارع..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>
        </section>

        {/* Images */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={
              <ImagePlus size={20} />
            }
            title="صور الشحنة"
            description="يمكنك رفع حتى 5 صور لتوضيح محتوى الشحنة."
          />

          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-orange-400 hover:bg-orange-50/30">
            {uploadingImages ? (
              <>
                <Loader2
                  className="mb-2 animate-spin text-orange-500"
                  size={30}
                />
                <span className="font-bold text-slate-500">
                  جاري رفع الصور...
                </span>
              </>
            ) : (
              <>
                <ImagePlus
                  className="mb-2 text-orange-500"
                  size={30}
                />

                <span className="font-bold text-slate-700">
                  اضغط لإضافة صور
                </span>

                <span className="mt-1 text-xs text-slate-400">
                  PNG / JPG / WEBP — حتى 5MB
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={
                uploadingImages ||
                images.length >= 5
              }
              onChange={(e) => {
                if (
                  e.target.files
                ) {
                  uploadImages(
                    e.target.files
                  );
                }

                e.target.value = "";
              }}
            />
          </label>

          {images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {images.map(
                (image, index) => (
                  <div
                    key={image}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <img
                      src={image}
                      alt={`صورة الشحنة ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Payment */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={
              <CreditCard size={20} />
            }
            title="طريقة الدفع"
            description="حدد الطريقة المناسبة لدفع تكلفة التوصيل."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Choice
              selected={
                paymentMethod ===
                "cash_on_delivery"
              }
              onClick={() =>
                setPaymentMethod(
                  "cash_on_delivery"
                )
              }
              icon={
                <Wallet size={21} />
              }
              title="نقدًا عند الاستلام"
              description="الدفع نقدًا عند وصول الطلب."
            />

            <Choice
              selected={
                paymentMethod === "card"
              }
              onClick={() =>
                setPaymentMethod(
                  "card"
                )
              }
              icon={
                <CreditCard
                  size={21}
                />
              }
              title="بطاقة"
              description="الدفع باستخدام البطاقة."
            />
          </div>
        </section>

        {/* Drivers */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={<Truck size={20} />}
            title="اختر المندوب"
            description="اختر المندوب الذي تريد إرسال الطلب إليه."
          />

          {loadingDrivers ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2
                className="ml-2 animate-spin"
                size={22}
              />
              جاري تحميل المندوبين...
            </div>
          ) : drivers.length ===
            0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              لا يوجد مندوبون متاحون حاليًا.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {drivers.map(
                (driver) => {
                  const selected =
                    selectedDriver ===
                    driver._id;

                  return (
                    <button
                      type="button"
                      key={
                        driver._id
                      }
                      onClick={() =>
                        setSelectedDriver(
                          driver._id
                        )
                      }
                      className={`relative flex items-center gap-4 rounded-2xl border p-4 text-right transition-all ${
                        selected
                          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10"
                          : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        {driver.avatar ? (
                          <img
                            src={
                              driver.avatar
                            }
                            alt={
                              driver.fullName
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <User
                              size={28}
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-slate-800">
                          {
                            driver.fullName
                          }
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {driver.city ||
                            "غير محدد"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {driver.address ||
                            "العنوان غير متوفر"}
                        </p>
                      </div>

                      {selected && (
                        <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
                          <Check
                            size={16}
                          />
                        </div>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {selectedDriverData && (
            <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    المندوب المختار
                  </p>

                  <p className="mt-1 font-black">
                    {
                      selectedDriverData.fullName
                    }
                  </p>
                </div>

                <Truck
                  className="text-orange-500"
                  size={25}
                />
              </div>
            </div>
          )}
        </section>

        {/* Delivery Fee */}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
          <SectionTitle
            icon={<Wallet size={20} />}
            title="سعر التوصيل"
            description="حدد السعر المقترح لخدمة التوصيل."
          />

          <div className="relative">
            <input
              name="deliveryFee"
              type="number"
              min="1"
              value={
                form.deliveryFee
              }
              onChange={
                handleChange
              }
              placeholder="75"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 pl-20 text-xl font-black outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />

            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
              جنيه
            </span>
          </div>
        </section>

        {/* Submit */}

        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl md:p-8">
          <div className="mb-6">
            <p className="text-sm text-slate-400">
              بعد إرسال الطلب
            </p>

            <h2 className="mt-1 text-xl font-black">
              سيتم إرسال الطلب إلى الإدارة للمراجعة
            </h2>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              uploadingImages
            }
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 py-4 font-black text-white shadow-xl shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={21}
                  className="animate-spin"
                />
                جاري إرسال الطلب...
              </>
            ) : (
              <>
                <Check size={21} />
                تأكيد إنشاء الطلب
              </>
            )}
          </button>
        </section>
      </form>
    </main>
  );
}

/* =========================
   Components
========================= */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  ltr,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={ltr ? "ltr" : "rtl"}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 ${
            icon
              ? "pr-11"
              : ""
          }`}
        />
      </div>
    </div>
  );
}

function ReadOnlyInput({
  label,
  value,
  ltr,
}: {
  label: string;
  value?: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </label>

      <div
        dir={ltr ? "ltr" : "rtl"}
        className="min-h-[50px] rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 font-semibold text-slate-700"
      >
        {value || "غير مضاف"}
      </div>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border p-5 text-right transition-all ${
        selected
          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10"
          : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-orange-500 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="font-black text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-slate-300"
        }`}
      >
        {selected && (
          <Check size={14} />
        )}
      </div>
    </button>
  );
}