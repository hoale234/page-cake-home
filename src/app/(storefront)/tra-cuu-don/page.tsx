import type { Metadata } from "next";
import { OrderLookup } from "@/components/storefront/order-lookup";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng",
  description: "Tra cứu sản phẩm và thông tin đơn bánh đã đặt.",
};

export default function OrderLookupPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto mb-5 w-full max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta sm:text-xs">
          Đơn hàng của bạn
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-brown sm:text-3xl">
          Lịch sử đơn hàng
        </h1>
      </div>
      <OrderLookup />
    </section>
  );
}
