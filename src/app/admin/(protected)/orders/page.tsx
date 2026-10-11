import Link from "next/link";
import { Suspense } from "react";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { orderStatuses, orderStatusLabels, type OrderStatus } from "@/lib/admin/orders";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

const pageSize = 20;

type SearchParams = Promise<{
  page?: string;
  status?: string;
  search?: string;
  phone?: string;
}>;

type OrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  total: number;
  status: OrderStatus;
  created_at: string;
};

function OrdersLoading() {
  return <div className="h-80 animate-pulse rounded-3xl bg-white" />;
}

function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = orderStatuses.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : "";
  const search = (params.search ?? "").replace(/[^0-9A-Za-z-]/g, "").trim().slice(0, 50);
  const phone = (params.phone ?? "").replace(/\D/g, "").slice(0, 10);
  const requestedPage = /^\d+$/.test(params.page ?? "") ? Number(params.page) : 1;
  const page = Math.max(1, Math.min(requestedPage, 100_000));
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("orders")
    .select("id, order_code, customer_name, phone, total, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("order_code", `%${search}%`);
  if (phone) query = query.ilike("phone", `%${phone}%`);

  const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) {
    console.error("Không thể tải danh sách đơn hàng:", error);
  }

  const orders = (data ?? []) as OrderRow[];
  const customerOrderCounts = new Map<string, number>();
  let customerCountsError = false;
  if (orders.length > 0) {
    const customerPhones = [...new Set(orders.map((order) => order.phone))];
    const { data: customerCounts, error: countError } = await supabase.rpc(
      "admin_order_customer_counts",
      { customer_phones: customerPhones },
    );
    if (countError) {
      console.error("Không thể đếm đơn của khách theo số điện thoại:", countError);
      customerCountsError = true;
    } else {
      for (const entry of customerCounts ?? []) {
        customerOrderCounts.set(entry.phone, Number(entry.order_count));
      }
    }
  }
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const baseQuery = new URLSearchParams();
  if (status) baseQuery.set("status", status);
  if (search) baseQuery.set("search", search);
  if (phone) baseQuery.set("phone", phone);
  const pageHref = (pageNumber: number) => {
    const nextQuery = new URLSearchParams(baseQuery);
    nextQuery.set("page", String(pageNumber));
    return `/admin/orders?${nextQuery.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Quản lý bán hàng</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-brown">Đơn hàng</h1>
          <p className="mt-1 text-sm text-brown/60">Có {totalCount} đơn hàng</p>
        </div>
        <a
          href={`/api/admin/orders/export${baseQuery.size ? `?${baseQuery.toString()}` : ""}`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-brown/15 bg-white px-4 text-sm font-bold text-brown transition hover:border-terracotta hover:text-terracotta"
        >
          <Download className="size-4" /> Xuất CSV
        </a>
      </div>

      <form className="grid gap-3 rounded-2xl border border-brown/10 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_180px_auto] lg:items-end">
        <label className="text-xs font-bold text-brown/65">
          Mã đơn
          <span className="relative mt-1.5 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown/40" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="BT-..."
              className="h-10 w-full rounded-xl border border-brown/15 bg-[#fffefa] pl-9 pr-3 text-sm font-normal outline-none focus:border-terracotta"
            />
          </span>
        </label>
        <label className="text-xs font-bold text-brown/65">
          Số điện thoại
          <input
            type="search"
            inputMode="numeric"
            name="phone"
            defaultValue={phone}
            placeholder="Tìm theo SĐT"
            className="mt-1.5 h-10 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3 text-sm font-normal outline-none focus:border-terracotta"
          />
        </label>
        <label className="text-xs font-bold text-brown/65">
          Trạng thái
          <select
            name="status"
            defaultValue={status}
            className="mt-1.5 h-10 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3 text-sm font-semibold text-brown outline-none focus:border-terracotta"
          >
            <option value="">Tất cả trạng thái</option>
            {orderStatuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {orderStatusLabels[statusOption]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-xl bg-brown px-5 text-sm font-bold text-white transition hover:bg-terracotta"
        >
          Lọc đơn hàng
        </button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-brown/10 bg-white shadow-sm">
        {customerCountsError ? (
          <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            Chưa xác định được nhãn khách quen; hãy chạy migration cập nhật để bật thống kê này.
          </p>
        ) : null}
        {error ? (
          <div role="alert" className="p-6 text-sm text-red-800">
            Chưa tải được danh sách đơn hàng. Kiểm tra kết nối và quyền admin rồi tải lại.
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-serif text-xl font-bold text-brown">Chưa tìm thấy đơn hàng</p>
            <p className="mt-2 text-sm text-brown/55">Thử thay đổi điều kiện lọc hoặc kiểm tra lại sau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wide text-brown/60">
                <tr>
                  <th className="px-4 py-3 font-bold">Mã đơn</th>
                  <th className="px-4 py-3 font-bold">Khách hàng</th>
                  <th className="px-4 py-3 font-bold">Số điện thoại</th>
                  <th className="px-4 py-3 text-right font-bold">Tổng tiền</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Thời gian</th>
                  <th className="px-4 py-3 font-bold">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown/10">
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle hover:bg-[#fffefa]">
                    <td className="px-4 py-3 font-bold text-terracotta">{order.order_code}</td>
                    <td className="px-4 py-3 font-semibold">{order.customer_name}</td>
                    <td className="px-4 py-3">
                      <span>{order.phone}</span>
                      {!customerCountsError && (customerOrderCounts.get(order.phone) ?? 0) >= 2 ? (
                        <span className="ml-2 inline-flex rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-bold text-terracotta">
                          Khách quen
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect id={order.id} status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-brown/60">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-bold text-terracotta hover:underline"
                      >
                        Xem đơn
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brown/60">
        <p>Trang {Math.min(page, totalPages)} / {totalPages}</p>
        <div className="flex gap-2">
          <Link
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`rounded-xl border border-brown/15 bg-white px-4 py-2 font-semibold ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-terracotta"}`}
            href={pageHref(Math.max(1, page - 1))}
          >
            Trước
          </Link>
          <Link
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={`rounded-xl border border-brown/15 bg-white px-4 py-2 font-semibold ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-terracotta"}`}
            href={pageHref(Math.min(totalPages, page + 1))}
          >
            Sau
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
