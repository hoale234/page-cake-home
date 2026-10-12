export const orderStatuses = [
  "new",
  "confirmed",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Mới",
  confirmed: "Lên đơn",
};
