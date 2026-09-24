import { z } from "zod";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "من فضلك أدخل كلمة المرور الحالية"),

    newPassword: z
      .string()
      .min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل")
      .regex(
        /[A-Z]/,
        "يجب أن تحتوي كلمة المرور على حرف كبير"
      )
      .regex(
        /[a-z]/,
        "يجب أن تحتوي كلمة المرور على حرف صغير"
      )
      .regex(
        /[0-9]/,
        "يجب أن تحتوي كلمة المرور على رقم"
      ),

    confirmPassword: z
      .string()
      .min(1, "من فضلك أكد كلمة المرور الجديدة"),
  })
  .refine(
    (data) =>
      data.newPassword === data.confirmPassword,
    {
      message: "كلمتا المرور غير متطابقتين",
      path: ["confirmPassword"],
    }
  );

export type ChangePasswordType =
  z.infer<typeof ChangePasswordSchema>;