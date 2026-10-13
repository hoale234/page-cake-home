import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProductUnit } from "@/lib/storefront/product-unit";

export type CartProduct = {
  slug: string;
  name: string;
  price: number;
  unit: string;
  image: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, quantity: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity) =>
        set((state) => {
          const normalizedProduct = {
            ...product,
            unit: getProductUnit(product.slug, product.unit),
          };
          const existing = state.items.find((item) => item.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.slug === product.slug
                  ? { ...item, ...normalizedProduct, quantity: Math.min(item.quantity + quantity, 10) }
                  : item,
              ),
            };
          }
          return {
            items: [...state.items, { ...normalizedProduct, quantity: Math.min(quantity, 10) }],
          };
        }),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.slug !== slug)
              : state.items.map((item) =>
                  item.slug === slug
                    ? { ...item, quantity: Math.min(quantity, 10) }
                    : item,
                ),
        })),
      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((item) => item.slug !== slug),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "banh-tai-cart",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const { items } = persistedState as { items: CartItem[] };
        return {
          items: items.map((item) => ({
            ...item,
            unit: getProductUnit(item.slug, item.unit),
          })),
        };
      },
    },
  ),
);
