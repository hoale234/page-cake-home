export const orderStatuses = [
  "new",
  "confirmed",
  "shipping",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Đơn mới",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};
