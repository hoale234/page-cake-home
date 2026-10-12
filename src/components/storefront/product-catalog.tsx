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
    description: "Bánh tai không đường, thơm béo.",
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
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-brown/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brown/10"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#ead5b8] sm:aspect-[16/9]">
              <Image
                src={product.image_url}
                alt={`Ảnh ${product.name}`}
                fill
                loading="eager"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-terracotta shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                {index === 0 ? "Vị được yêu thích" : "Vị truyền thống"}
              </span>
              {index === 0 ? (
                <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-gold text-brown shadow-md sm:bottom-4 sm:right-4 sm:size-10">
                  <Star className="size-4 fill-current sm:size-5" />
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-7">
              <h3 className="line-clamp-2 min-h-10 font-serif text-base font-bold leading-5 text-brown sm:min-h-16 sm:text-2xl sm:leading-8">
                {product.name}
              </h3>
              <p className="mt-2 line-clamp-3 h-[3.75rem] text-xs leading-5 text-brown/65 sm:h-[4.5rem] sm:text-sm sm:leading-6">
                {product.description}
              </p>
              <div className="mt-auto flex flex-col items-start gap-3 border-t border-brown/10 pt-3 sm:mt-auto sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pt-5">
                <div>
                  <p className="text-[10px] font-medium text-brown/55 sm:text-xs">Giá bán</p>
                  <p className="mt-1 text-base font-extrabold text-terracotta sm:text-lg">
                    {formatPrice(product.price)}đ{" "}
                    <span className="text-[11px] font-semibold text-brown/60 sm:text-sm">/ {product.unit}</span>
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
    </>
  );
}
