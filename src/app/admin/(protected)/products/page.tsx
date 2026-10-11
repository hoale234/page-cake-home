import { requireAdmin } from "@/lib/auth/require-admin";
import { ProductEditor } from "@/components/admin/product-editor";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, unit, image_url, is_active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Không thể tải danh sách sản phẩm quản trị:", error);
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm leading-6 text-red-800">
        Chưa tải được sản phẩm. Hãy kiểm tra migration, quyền admin và tải lại trang.
      </p>
    );
  }

  const products = (data ?? []) as ProductRow[];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Danh mục cửa hàng</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brown">Sản phẩm</h1>
        <p className="mt-1 text-sm text-brown/60">
          Cập nhật giá bán, trạng thái hiển thị và ảnh sản phẩm.
        </p>
      </div>
      {products.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-brown/60">
          Chưa có sản phẩm. Hãy chạy migration seed trong Supabase SQL Editor.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {products.map((product) => (
            <ProductEditor
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              unit={product.unit}
              imageUrl={product.image_url}
              isActive={product.is_active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
