import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft, MapPin, Phone, UserRound } from "lucide-react";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { type OrderStatus } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/auth/require-admin";

type OrderDetails = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
};

const money = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const { supabase } = await requireAdmin();
  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("order_items")
        .select("id, product_name, unit_price, quantity")
        .eq("order_id", id)
        .order("id"),
    ]);

  if (orderError || itemsError) {
    console.error("Không thể tải chi tiết đơn hàng:", orderError ?? itemsError);
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-800">
        Chưa tải được chi tiết đơn hàng. Vui lòng kiểm tra kết nối và thử lại.
      </p>
    );
  }
  if (!order) notFound();

  const orderData = order as OrderDetails;
  const orderItems = (items ?? []) as OrderItem[];

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-bold text-brown/65 hover:text-terracotta">
        <ArrowLeft className="size-4" /> Quay lại danh sách đơn
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Chi tiết đơn hàng</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-brown">{orderData.order_code}</h1>
          <p className="mt-1 text-sm text-brown/55">
            {new Intl.DateTimeFormat("vi-VN", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Asia/Ho_Chi_Minh",
            }).format(new Date(orderData.created_at))}
          </p>
        </div>
        <OrderStatusSelect id={id} status={orderData.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-brown/10 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-serif text-xl font-bold">Sản phẩm đặt mua</h2>
          {orderItems.length === 0 ? (
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Đơn hàng chưa có sản phẩm. Vui lòng kiểm tra dữ liệu trong Supabase.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-brown/10">
              {orderItems.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-2 py-4 first:pt-0">
                  <div>
                    <p className="font-bold">{item.product_name}</p>
                    <p className="mt-1 text-sm text-brown/55">
                      {item.quantity} × {money(item.unit_price)} / 500g
                    </p>
                  </div>
                  <p className="font-bold">{money(item.quantity * item.unit_price)}</p>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 space-y-2 border-t border-brown/10 pt-4 text-sm">
            <div className="flex justify-between gap-3 text-brown/60">
              <dt>Tạm tính</dt><dd>{money(orderData.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-brown/60">
              <dt>Phí giao hàng</dt><dd>{money(orderData.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-brown/10 pt-3 text-base font-extrabold">
              <dt>Tổng cộng</dt><dd className="text-terracotta">{money(orderData.total)}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-3xl border border-brown/10 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-serif text-xl font-bold">Thông tin nhận hàng</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-terracotta" />
              <div><dt className="text-xs text-brown/50">Khách hàng</dt><dd className="mt-1 font-bold">{orderData.customer_name}</dd></div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-terracotta" />
              <div><dt className="text-xs text-brown/50">Số điện thoại</dt><dd className="mt-1 font-bold"><a href={`tel:${orderData.phone}`}>{orderData.phone}</a></dd></div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-terracotta" />
              <div><dt className="text-xs text-brown/50">Địa chỉ</dt><dd className="mt-1 font-semibold leading-6">{orderData.address}</dd></div>
            </div>
            <div className="border-t border-brown/10 pt-4">
              <dt className="text-xs text-brown/50">Phương thức thanh toán</dt>
              <dd className="mt-1 font-semibold">
                {orderData.payment_method === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brown/50">Ghi chú</dt>
              <dd className="mt-1 whitespace-pre-wrap leading-6">
                {orderData.note || <span className="text-brown/40">Không có ghi chú</span>}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
