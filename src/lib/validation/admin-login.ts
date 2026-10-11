import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Email chưa đúng định dạng.").max(254),
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(256),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
