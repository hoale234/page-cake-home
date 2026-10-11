import { z } from "zod";
import { isValidVietnamesePhone } from "@/lib/validation/order";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên của bạn.").max(100),
  phone: z
    .string()
    .trim()
    .refine(isValidVietnamesePhone, "Nhập số điện thoại Việt Nam gồm đúng 10 chữ số."),
  message: z.string().trim().min(5, "Vui lòng nhập nội dung cần hỗ trợ.").max(1500),
  website: z.string().max(0).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
