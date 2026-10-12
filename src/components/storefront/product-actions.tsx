"use client";

import { useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
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
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div
          className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start"
          role="group"
          aria-label={`Số lượng ${product.name}`}
        >
          <button
            type="button"
            aria-label={`Giảm ${product.name}`}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            className="flex size-7 items-center justify-center rounded-full border border-brown/15 text-brown hover:bg-cream disabled:opacity-40 sm:size-8"
          >
            <Minus className="size-3 sm:size-3.5" />
          </button>
          <span className="min-w-4 text-center text-sm font-bold sm:min-w-5" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={`Tăng ${product.name}`}
            onClick={() => setQuantity((current) => Math.min(10, current + 1))}
            disabled={quantity >= 10}
            className="flex size-7 items-center justify-center rounded-full border border-brown/15 text-brown hover:bg-cream disabled:opacity-40 sm:size-8"
          >
            <Plus className="size-3 sm:size-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-brown px-2.5 text-xs font-bold text-white transition hover:bg-terracotta sm:h-10 sm:w-auto sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ShoppingBag className="size-3.5 sm:size-4" />
          <span className="sm:hidden">Thêm</span>
          <span className="hidden sm:inline">Thêm vào giỏ</span>
          <ArrowRight className="hidden size-4 sm:inline" />
        </button>
      </div>
    </div>
  );
}
