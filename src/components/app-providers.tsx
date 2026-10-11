"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useCartStore } from "@/lib/store/cart";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <Toaster closeButton position="top-center" richColors />
    </>
  );
}
