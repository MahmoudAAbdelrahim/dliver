// src/validations/login.ts

import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم")
    .min(8, "يجب ألا تقل كلمة المرور عن 8 أحرف")
});

export type LoginType =
  z.infer<
    typeof LoginSchema
  >;