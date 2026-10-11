import type { Metadata } from "next";
import { Checkout } from "@/components/storefront/checkout";

export const metadata: Metadata = {
  title: "Giỏ hàng và đặt hàng",
  description: "Xem giỏ hàng và đặt bánh tai giao tận nhà.",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta sm:text-xs">
          Hoàn tất trong một phút
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-brown sm:text-3xl">
          Giỏ hàng &amp; Đặt hàng
        </h1>
        <p className="mt-1 text-xs text-brown/60 sm:text-sm">
          Điền thông tin nhận bánh, shop sẽ gọi xác nhận đơn.
        </p>
      </div>
      <Checkout />
    </section>
  );
}
