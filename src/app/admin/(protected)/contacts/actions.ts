"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";

const contactReadSchema = z.object({
  id: z.string().uuid(),
  is_read: z.boolean(),
});

export async function updateContactRead(input: unknown) {
  const parsed = contactReadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Thông tin tin nhắn không hợp lệ." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contacts")
    .update({ is_read: parsed.data.is_read })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Không thể cập nhật trạng thái tin nhắn:", error);
    return { success: false, error: "Chưa thể cập nhật tin nhắn. Vui lòng thử lại." };
  }
  if (!data) {
    return { success: false, error: "Không tìm thấy tin nhắn hoặc bạn không có quyền cập nhật." };
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: true };
}
