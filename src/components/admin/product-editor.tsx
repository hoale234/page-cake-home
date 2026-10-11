"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageUp, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  updateProduct,
  updateProductImage,
} from "@/app/admin/(protected)/products/actions";

type ProductEditorProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  isActive: boolean;
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxImageSize = 5 * 1024 * 1024;

export function ProductEditor(product: ProductEditorProps) {
  const [price, setPrice] = useState(String(product.price));
  const [isActive, setIsActive] = useState(product.isActive);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function saveProduct() {
    const nextPrice = Number(price);
    if (!Number.isSafeInteger(nextPrice) || nextPrice < 1 || nextPrice > 10_000_000) {
      toast.error("Giá bán phải là số nguyên từ 1 đến 10.000.000đ.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProduct({
        id: product.id,
        price: nextPrice,
        is_active: isActive,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã lưu thông tin sản phẩm.");
    } catch (error) {
      console.error("Không thể lưu sản phẩm:", error);
      toast.error("Chưa thể lưu sản phẩm. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    if (!allowedImageTypes.has(file.type)) {
      toast.error("Ảnh cần có định dạng JPG, PNG, WebP hoặc AVIF.");
      return;
    }
    if (file.size > maxImageSize) {
      toast.error("Ảnh tối đa 5MB. Vui lòng chọn ảnh nhẹ hơn.");
      return;
    }

    setUploading(true);
    let storagePath: string | null = null;
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    try {
      supabase = createSupabaseBrowserClient();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      storagePath = `${product.id}/${crypto.randomUUID()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Không thể tải ảnh sản phẩm lên:", uploadError);
        toast.error("Chưa tải được ảnh. Hãy kiểm tra quyền bucket product-images.");
        return;
      }

      const publicUrl = supabase.storage.from("product-images").getPublicUrl(storagePath).data.publicUrl;
      const result = await updateProductImage({ id: product.id, image_url: publicUrl });
      if (!result.success) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([storagePath]);
        if (cleanupError) {
          console.error("Không thể xóa ảnh tải lên nhưng chưa được gắn sản phẩm:", cleanupError);
        }
        toast.error(result.error);
        return;
      }

      setImageUrl(publicUrl);
      toast.success("Đã cập nhật ảnh sản phẩm.");
    } catch (error) {
      console.error("Không thể cập nhật ảnh sản phẩm:", error);
      toast.error("Chưa thể tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-brown/10 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-cream">
        <Image
          src={imageUrl}
          alt={`Ảnh ${product.name}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
            isActive ? "bg-green-100 text-green-800" : "bg-brown/10 text-brown/60"
          }`}
        >
          {isActive ? "Đang bán" : "Đã ẩn"}
        </span>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-brown">{product.name}</h2>
          <p className="mt-2 min-h-12 text-sm leading-6 text-brown/60">{product.description}</p>
        </div>
        <label className="block text-sm font-semibold text-brown">
          Giá bán / {product.unit}
          <div className="relative mt-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={10_000_000}
              step={1000}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3 pr-12 text-base font-bold outline-none focus:border-terracotta"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brown/50">đ</span>
          </div>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-cream/70 p-3 text-sm font-semibold">
          <span>{isActive ? "Đang hiển thị trên cửa hàng" : "Đang ẩn khỏi cửa hàng"}</span>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-5 accent-terracotta"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={saveProduct}
            disabled={saving || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-terracotta px-4 text-sm font-bold text-white transition hover:bg-terracotta-dark disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={saving || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-brown/15 px-4 text-sm font-bold text-brown transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
          >
            {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            {uploading ? "Đang tải ảnh..." : "Đổi ảnh"}
          </button>
        </div>
      </div>
    </article>
  );
}
