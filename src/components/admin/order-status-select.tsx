"use client";

import { useState } from "react";
import { Check, ChevronDown, CircleDot, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { orderStatuses, orderStatusLabels, type OrderStatus } from "@/lib/admin/orders";
import { updateOrderStatus } from "@/app/admin/(protected)/orders/actions";

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function changeStatus(nextStatus: OrderStatus) {
    if (nextStatus === value) {
      setOpen(false);
      return;
    }

    const previousStatus = value;
    setValue(nextStatus);
    setSaving(true);
    setOpen(false);
    try {
      const result = await updateOrderStatus({ id, status: nextStatus });
      if (!result.success) {
        setValue(previousStatus);
        toast.error(result.error);
        return;
      }
      toast.success("Đã cập nhật trạng thái đơn hàng.");
    } catch (error) {
      console.error("Không thể cập nhật trạng thái đơn:", error);
      setValue(previousStatus);
      toast.error("Chưa thể cập nhật đơn hàng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  const currentStatus = orderStatusLabels[value];
  const CurrentIcon = value === "new" ? CircleDot : ClipboardCheck;
  const currentStyle = value === "new"
    ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
    : "border-green-200 bg-green-50 text-green-800 hover:bg-green-100";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={`Trạng thái đơn hàng: ${currentStatus}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={saving}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`inline-flex h-9 min-w-28 items-center justify-between gap-2 rounded-full border px-3 text-xs font-semibold transition disabled:opacity-60 ${currentStyle}`}
      >
        <span className="inline-flex items-center gap-1.5">
          <CurrentIcon className="size-3.5" />
          {currentStatus}
        </span>
        <ChevronDown className="size-3.5 opacity-60" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Chọn trạng thái đơn hàng"
          className="absolute right-0 top-10 z-20 min-w-36 rounded-xl border border-brown/10 bg-white p-1.5 shadow-lg"
        >
          {orderStatuses.map((statusOption) => {
            const OptionIcon = statusOption === "new" ? CircleDot : ClipboardCheck;
            const optionStyle = statusOption === "new"
              ? "text-amber-800 hover:bg-amber-50"
              : "text-green-800 hover:bg-green-50";

            return (
              <button
                key={statusOption}
                type="button"
                role="menuitemradio"
                aria-checked={value === statusOption}
                disabled={saving}
                onClick={() => void changeStatus(statusOption)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition disabled:opacity-50 ${optionStyle}`}
              >
                <span className="inline-flex items-center gap-2">
                  <OptionIcon className="size-3.5" />
                  {orderStatusLabels[statusOption]}
                </span>
                {value === statusOption ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
