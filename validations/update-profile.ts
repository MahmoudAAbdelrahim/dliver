import { z } from "zod";

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(50, "الاسم طويل جدًا"),

  phone: z
    .string()
    .trim()
    .min(11, "رقم الهاتف يجب أن يكون 11 رقمًا على الأقل")
    .max(15, "رقم الهاتف غير صحيح"),

  address: z
    .string()
    .trim()
    .max(200, "العنوان طويل جدًا")
    .optional()
    .default(""),

  city: z
    .string()
    .trim()
    .max(100, "اسم المدينة طويل جدًا")
    .optional()
    .default(""),
});

export type UpdateProfileType =
  z.infer<typeof UpdateProfileSchema>;