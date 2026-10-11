import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartProduct = {
  slug: string;
  name: string;
  price: number;
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
          const existing = state.items.find((item) => item.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.slug === product.slug
                  ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
                  : item,
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity: Math.min(quantity, 99) }],
          };
        }),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.slug !== slug)
              : state.items.map((item) =>
                  item.slug === slug
                    ? { ...item, quantity: Math.min(quantity, 99) }
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
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
