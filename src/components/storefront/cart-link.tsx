"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

export function CartLink() {
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <a
      href="#dat-hang"
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-brown/15 bg-white px-3.5 text-sm font-bold text-brown shadow-sm transition hover:border-terracotta hover:text-terracotta sm:px-4"
      aria-label={`Giỏ hàng, ${count} sản phẩm`}
    >
      <ShoppingBag className="size-4" />
      <span className="hidden sm:inline">Giỏ hàng</span>
      <span className="flex size-5 items-center justify-center rounded-full bg-terracotta text-[11px] text-white">
        {count}
      </span>
    </a>
  );
}
