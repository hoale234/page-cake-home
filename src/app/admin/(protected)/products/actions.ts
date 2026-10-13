"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";

const productIdSchema = z.string().uuid();
const productUpdateSchema = z.object({
  id: productIdSchema,
  description: z.string().trim().max(500),
  price: z.number().int().min(1).max(10_000_000),
  is_active: z.boolean(),
});
const productImageSchema = z.object({
  id: productIdSchema,
  image_url: z.string().url().max(2000),
});

export async function updateProduct(input: unknown) {
  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Giá bán hoặc trạng thái sản phẩm không hợp lệ." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({
      description: parsed.data.description,
      price: parsed.data.price,
      is_active: parsed.data.is_active,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Không thể cập nhật sản phẩm:", error);
    return { success: false, error: "Chưa thể lưu sản phẩm. Vui lòng thử lại." };
  }
  if (!data) {
    return { success: false, error: "Không tìm thấy sản phẩm hoặc bạn không có quyền cập nhật." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "page");
  revalidatePath("/san-pham");
  return { success: true };
}

export async function updateProductImage(input: unknown) {
  const parsed = productImageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Đường dẫn ảnh sản phẩm không hợp lệ." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return { success: false, error: "Chưa cấu hình địa chỉ Supabase." };
  }

  let imageUrl: URL;
  let projectUrl: URL;
  try {
    imageUrl = new URL(parsed.data.image_url);
    projectUrl = new URL(supabaseUrl);
  } catch {
    return { success: false, error: "Đường dẫn ảnh Supabase chưa đúng." };
  }

  if (
    imageUrl.origin !== projectUrl.origin ||
    !imageUrl.pathname.startsWith("/storage/v1/object/public/product-images/")
  ) {
    return { success: false, error: "Ảnh phải thuộc bucket product-images của shop." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({ image_url: imageUrl.toString() })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Không thể cập nhật ảnh sản phẩm:", error);
    return { success: false, error: "Chưa thể lưu ảnh. Vui lòng thử lại." };
  }
  if (!data) {
    return { success: false, error: "Không tìm thấy sản phẩm hoặc bạn không có quyền cập nhật." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "page");
  return { success: true };
}
