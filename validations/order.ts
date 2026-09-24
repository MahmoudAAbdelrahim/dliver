import { z } from "zod";

export const CreateOrderSchema =
  z.object({
    pickup: z.object({
      method: z.enum([
        "hand_to_hand",
        "drop_off",
      ]),

      address: z
        .string()
        .min(3, "عنوان الاستلام مطلوب"),

      city: z
        .string()
        .min(2, "مدينة الاستلام مطلوبة"),

      details: z
        .string()
        .max(500)
        .optional()
        .default(""),
    }),

    delivery: z.object({
      recipientName: z
        .string()
        .min(3, "اسم المستلم مطلوب")
        .max(100),

      recipientPhone: z
        .string()
        .min(11, "رقم الهاتف غير صحيح")
        .max(15),

      governorate: z
        .string()
        .min(2, "المحافظة مطلوبة"),

      city: z
        .string()
        .min(2, "المدينة مطلوبة"),

      address: z
        .string()
        .min(3, "العنوان مطلوب"),

      details: z
        .string()
        .min(3, "اكتب العنوان بالتفصيل")
        .max(500),
    }),

    images: z
      .array(z.string().url())
      .max(5)
      .default([]),

    paymentMethod: z.enum([
      "cash_on_delivery",
      "card",
    ]),

    driver: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "المندوب غير صحيح"
      )
      .nullable()
      .optional(),

    deliveryFee: z
      .number()
      .min(0)
      .max(100000),
  });

export type CreateOrderType =
  z.infer<typeof CreateOrderSchema>;