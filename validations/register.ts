// src/validations/register.ts

import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(3)
    .max(50),

  email: z
    .string()
    .email(),

  phone: z
    .string()
    .min(11)
    .max(15),

  password: z
    .string()
    .min(8)
    .min(8, "يجب ألا تقل كلمة المرور عن 8 أحرف")
});

export type RegisterType =
  z.infer<
    typeof RegisterSchema
  >;