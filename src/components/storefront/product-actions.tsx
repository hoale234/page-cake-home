"use client";

import { useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, type CartProduct } from "@/lib/store/cart";

export function ProductActions({ product }: { product: CartProduct }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  function addToCart() {
    addItem(product, quantity);
    toast.success(`Đã thêm ${quantity} phần ${product.name} vào giỏ.`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`quantity-${product.slug}`}>
          Số phần {product.name}
        </label>
        <select
          id={`quantity-${product.slug}`}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-10 rounded-xl border border-brown/15 bg-white px-2 text-sm font-semibold outline-none focus:border-terracotta"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} phần
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addToCart}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brown px-4 text-sm font-bold text-white transition hover:bg-terracotta"
        >
          <ShoppingBag className="size-4" />
          Thêm vào giỏ
          <ArrowRight className="hidden size-4 sm:inline" />
        </button>
      </div>
    </div>
  );
}
