import Image from "next/image";
import { Star } from "lucide-react";
import { ProductActions } from "@/components/storefront/product-actions";
import { createPublicSupabaseClient, type StoreProduct } from "@/lib/supabase/public";

const previewProducts: StoreProduct[] = [
  {
    id: "preview-banh-tai-duong-gung",
    name: "Bánh tai có đường",
    slug: "banh-tai-duong-gung",
    description: "Bánh tai truyền thống thơm vị gừng, ngọt dịu vừa ăn.",
    price: 50000,
    unit: "500g",
    image_url: "/images/banh-tai-san-pham-tam.png",
  },
  {
    id: "preview-banh-tai-khong-duong",
    name: "Bánh tai không đường",
    slug: "banh-tai-khong-duong",
    description: "Bánh tai truyền thống vị nguyên bản, không thêm đường.",
    price: 50000,
    unit: "500g",
    image_url: "/images/banh-tai-san-pham-tam.png",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price);
}

export async function ProductCatalog() {
  const supabase = createPublicSupabaseClient();
  let products: StoreProduct[];
  let isPreview = false;

  if (!supabase) {
    products = previewProducts;
    isPreview = true;
  } else {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, price, unit, image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Không thể tải danh sách sản phẩm:", error);
      return (
        <p role="alert" className="rounded-2xl bg-amber-50 p-5 text-center text-sm text-amber-900">
          Chưa tải được sản phẩm. Vui lòng thử tải lại trang sau ít phút.
        </p>
      );
    }

    products = (data ?? []) as StoreProduct[];
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-brown/65">
        Shop đang chuẩn bị mẻ bánh mới. Bạn vui lòng quay lại sau nhé.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-[1.75rem] border border-brown/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brown/10"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-[#ead5b8]">
              <Image
                src={product.image_url}
                alt={`Ảnh ${product.name}`}
                fill
                loading="eager"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-terracotta shadow-sm">
                {index === 0 ? "Vị được yêu thích" : "Vị truyền thống"}
              </span>
              {index === 0 ? (
                <span className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-gold text-brown shadow-md">
                  <Star className="size-5 fill-current" />
                </span>
              ) : null}
            </div>
            <div className="p-5 sm:p-7">
              <h3 className="font-serif text-xl font-bold text-brown sm:text-2xl">
                {product.name}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-brown/65">
                {product.description}
              </p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-brown/10 pt-5">
                <div>
                  <p className="text-xs font-medium text-brown/55">Giá bán</p>
                  <p className="mt-1 text-lg font-extrabold text-terracotta">
                    {formatPrice(product.price)}đ{" "}
                    <span className="text-sm font-semibold text-brown/60">/ {product.unit}</span>
                  </p>
                </div>
                <ProductActions
                  product={{
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image_url,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-brown/55">
        {isPreview
          ? "* Đang hiển thị sản phẩm xem trước. Cấu hình Supabase để tải dữ liệu sản phẩm và nhận đơn hàng."
          : "* Ảnh sản phẩm hiện là ảnh tạm, shop có thể thay bằng ảnh thật trong trang quản trị."}
      </p>
    </>
  );
}
