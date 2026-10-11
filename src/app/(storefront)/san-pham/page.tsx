import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { ProductCatalog } from "@/components/storefront/product-catalog";

export const metadata: Metadata = {
  title: "Sản phẩm bánh tai",
  description: "Chọn bánh tai có đường gừng hoặc không đường, 50.000đ / 500g.",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta sm:text-xs">
            Mẻ bánh thơm ngon
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-brown sm:text-3xl">
            Chọn vị bánh bạn thương
          </h1>
          <p className="mt-1 text-xs text-brown/60 sm:text-sm">
            50.000đ / 500g · Ship đồng giá 15.000đ
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-brown/65 sm:inline-flex">
          <Truck className="size-4 text-terracotta" />
          Giao hàng toàn quốc
        </div>
      </div>
      <ProductCatalog />
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-brown/10 bg-white px-4 py-3">
        <p className="text-xs leading-5 text-brown/60 sm:text-sm">
          Đã chọn xong? Tiếp tục nhập thông tin giao hàng.
        </p>
        <Link
          href="/dat-hang"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-4 text-xs font-bold text-white transition hover:bg-terracotta-dark sm:text-sm"
        >
          Đặt hàng <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
