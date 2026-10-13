import type { Metadata } from "next";
import { Checkout } from "@/components/storefront/checkout";

export const metadata: Metadata = {
  title: "Giỏ hàng và đặt hàng",
  description: "Xem giỏ hàng và đặt bánh tai giao tận nhà.",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-7 sm:pb-28 md:pb-7">
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-bold text-brown sm:text-3xl">
          Giỏ hàng &amp; Đặt hàng
        </h1>
      </div>
      <Checkout />
    </section>
  );
}
