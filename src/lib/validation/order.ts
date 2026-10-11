import { z } from "zod";

const vietnamesePhonePattern = /^(03|05|07|08|09)\d{8}$/;

export function isValidVietnamesePhone(value: string) {
  return vietnamesePhonePattern.test(value);
}

export const checkoutFormSchema = z.object({
  customer_name: z.string().trim().min(2, "Vui lòng nhập họ tên.").max(100),
  phone: z
    .string()
    .trim()
    .regex(vietnamesePhonePattern, "Nhập số điện thoại Việt Nam gồm đúng 10 chữ số."),
  address: z.string().trim().min(8, "Vui lòng nhập địa chỉ nhận hàng.").max(500),
  note: z.string().trim().max(1000, "Ghi chú tối đa 1.000 ký tự.").default(""),
  payment_method: z.enum(["cod", "bank_transfer"]),
  website: z.string().max(0).optional(),
});

export const checkoutSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(100),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Giỏ hàng đang trống.")
    .max(20, "Giỏ hàng có quá nhiều sản phẩm."),
});

export type CheckoutInput = z.input<typeof checkoutFormSchema>;
export type CheckoutValues = z.output<typeof checkoutFormSchema>;

export const savedCustomerInfoSchema = z.object({
  phone: z.string().regex(vietnamesePhonePattern),
  customer_name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(8).max(500),
});

export type SavedCustomerInfo = z.infer<typeof savedCustomerInfoSchema>;
