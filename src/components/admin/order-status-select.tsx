"use client";

import { useState } from "react";
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

  async function changeStatus(nextStatus: OrderStatus) {
    setValue(nextStatus);
    setSaving(true);
    try {
      const result = await updateOrderStatus({ id, status: nextStatus });
      if (!result.success) {
        setValue(status);
        toast.error(result.error);
        return;
      }
      toast.success("Đã cập nhật trạng thái đơn hàng.");
    } catch (error) {
      console.error("Không thể cập nhật trạng thái đơn:", error);
      setValue(status);
      toast.error("Chưa thể cập nhật đơn hàng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="sr-only">
      Trạng thái đơn
      <select
        value={value}
        disabled={saving}
        onChange={(event) => void changeStatus(event.target.value as OrderStatus)}
        className="h-9 min-w-32 rounded-lg border border-brown/15 bg-white px-2 text-xs font-semibold text-brown outline-none focus:border-terracotta disabled:opacity-50"
      >
        {orderStatuses.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {orderStatusLabels[statusOption]}
          </option>
        ))}
      </select>
    </label>
  );
}
