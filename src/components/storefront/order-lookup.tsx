"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { lastOrderPhoneStorageKey } from "@/lib/storefront/order-lookup";

type OrderDetails = {
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "new" | "confirmed";
  createdAt: string;
  items: Array<{
    name: string;
    unitPrice: number;
    unit: string;
    quantity: number;
  }>;
};

const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price);
const statusLabels: Record<OrderDetails["status"], string> = {
  new: "Mới",
  confirmed: "Lên đơn",
};

export function OrderLookup() {
  const [orders, setOrders] = useState<OrderDetails[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const lookupOrders = useCallback(async (phoneToLookup: string) => {
    setLoading(true);
    setError("");
    setOrders(null);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToLookup }),
      });
      const result = (await response.json()) as {
        error?: string;
        orders?: OrderDetails[];
      };

      if (!response.ok) {
        setError(result.error ?? "Chưa thể tra cứu đơn hàng. Vui lòng thử lại.");
        return;
      }
      if (
        !Array.isArray(result.orders) ||
        result.orders.some((order) => !Array.isArray(order.items))
      ) {
        setError("Thông tin đơn hàng chưa đầy đủ. Vui lòng thử lại.");
        return;
      }

      setOrders(result.orders);
    } catch (cause) {
      console.error("Không thể tra cứu đơn hàng:", cause);
      setError("Kết nối chưa ổn định. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      try {
        const savedPhone = window.localStorage.getItem(lastOrderPhoneStorageKey);
        if (!savedPhone) {
          setLoading(false);
          return;
        }
        await lookupOrders(savedPhone);
      } catch (cause) {
        console.error("Không thể đọc số điện thoại tra cứu đã lưu:", cause);
        setError("Không thể đọc số điện thoại đã lưu trên thiết bị này.");
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lookupOrders]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {loading ? (
        <p role="status" className="flex items-center justify-center gap-2 rounded-2xl bg-white p-5 text-sm text-brown/65 shadow-sm">
          <LoaderCircle className="size-4 animate-spin" />
          Đang tải đơn hàng...
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      {!loading && !error && orders === null ? (
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-brown/65">
            Chưa có số điện thoại được lưu trên thiết bị này. Hãy đặt hàng để xem các đơn của bạn.
          </p>
          <Link
            href="/dat-hang"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-terracotta px-5 text-sm font-bold text-white transition hover:bg-terracotta-dark"
          >
            Đến trang đặt hàng
          </Link>
        </div>
      ) : null}

      {orders ? (
        orders.length === 0 ? (
          <p role="status" className="rounded-2xl bg-white p-5 text-center text-sm text-brown/65 shadow-sm">
            Chưa tìm thấy đơn hàng nào với số điện thoại này.
          </p>
        ) : (
          <div aria-live="polite" className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-brown">
              Đơn hàng của bạn ({orders.length})
            </h2>
            {orders.map((order) => (
              <section
                key={order.orderCode}
                className="rounded-3xl border border-brown/10 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brown/10 pb-4">
                  <div>
                    <p className="text-xs text-brown/55">Mã đơn hàng</p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-terracotta">{order.orderCode}</h3>
                    <p className="mt-1 text-xs text-brown/55">
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Ho_Chi_Minh",
                      }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <span className="rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-bold text-terracotta">
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-brown">Sản phẩm đã đặt</h4>
                  <ul className="mt-2 divide-y divide-brown/10">
                    {order.items.map((item, index) => (
                      <li key={`${item.name}-${index}`} className="flex justify-between gap-3 py-2 first:pt-0">
                        <span className="text-sm text-brown">
                          {item.name} ({item.unit}) × {item.quantity}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-brown">
                          {formatPrice(item.unitPrice * item.quantity)}đ
                        </span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-2 space-y-1.5 border-t border-brown/10 pt-3 text-sm">
                    <div className="flex justify-between gap-3 text-brown/65">
                      <dt>Tạm tính</dt><dd>{formatPrice(order.subtotal)}đ</dd>
                    </div>
                    <div className="flex justify-between gap-3 text-brown/65">
                      <dt>Phí giao hàng</dt><dd>{formatPrice(order.shippingFee)}đ</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-brown/10 pt-2 font-extrabold text-brown">
                      <dt>Tổng cộng</dt><dd className="text-terracotta">{formatPrice(order.total)}đ</dd>
                    </div>
                  </dl>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-brown/10 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-brown/55">Người nhận</dt>
                    <dd className="mt-0.5 font-semibold text-brown">{order.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brown/55">Số điện thoại</dt>
                    <dd className="mt-0.5 font-semibold text-brown">{order.phone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-brown/55">Địa chỉ nhận hàng</dt>
                    <dd className="mt-0.5 font-semibold text-brown">{order.address}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brown/55">Thanh toán</dt>
                    <dd className="mt-0.5 font-semibold text-brown">
                      {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản"}
                    </dd>
                  </div>
                  {order.note ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-brown/55">Ghi chú</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap font-semibold text-brown">{order.note}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
