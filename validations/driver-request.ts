import { z } from "zod";

export const DriverRequestSchema = z.object({
  nationalId: z
    .string()
    .min(14, "رقم البطاقة يجب أن يكون 14 رقمًا")
    .max(14, "رقم البطاقة يجب أن يكون 14 رقمًا"),

  birthDate: z
    .string()
    .min(1, "تاريخ الميلاد مطلوب"),

  governorate: z
    .string()
    .min(2, "المحافظة مطلوبة"),

  city: z
    .string()
    .min(2, "المدينة مطلوبة"),

  address: z
    .string()
    .min(5, "يرجى كتابة العنوان بالتفصيل"),

  vehicleType: z
    .string()
    .min(2, "نوع المركبة مطلوب"),

  licenseNumber: z
    .string()
    .min(3, "رقم الرخصة مطلوب"),

  nationalIdFront: z
    .string()
    .url(),

  nationalIdBack: z
    .string()
    .url(),

  licenseImage: z
    .string()
    .url(),

  personalPhoto: z
    .string()
    .url(),

  workPermit: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500)
    .optional()
    .default(""),
});

export type DriverRequestInput =
  z.infer<typeof DriverRequestSchema>;