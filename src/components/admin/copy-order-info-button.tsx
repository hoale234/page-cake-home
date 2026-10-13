"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyOrderInfoButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã sao chép ${label.toLowerCase()}.`);
    } catch (error) {
      console.error(`Không thể sao chép ${label.toLowerCase()}:`, error);
      toast.error("Không thể sao chép. Vui lòng thử lại.");
    }
  }

  return (
    <button
      type="button"
      aria-label={`Sao chép ${label.toLowerCase()}`}
      onClick={() => void copyValue()}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brown/45 transition hover:bg-cream hover:text-terracotta"
    >
      <Copy aria-hidden="true" className="size-3.5" />
    </button>
  );
}
