"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { orderStatuses } from "@/lib/admin/orders";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(orderStatuses),
});

export async function updateOrderStatus(input: unknown) {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Thông tin trạng thái không hợp lệ." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Không thể cập nhật trạng thái đơn:", error);
    return { success: false, error: "Chưa thể cập nhật đơn hàng. Vui lòng thử lại." };
  }
  if (!data) {
    return { success: false, error: "Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  return { success: true };
}
