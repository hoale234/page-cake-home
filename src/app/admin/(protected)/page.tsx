import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  ClipboardCheck,
  Wallet,
} from "lucide-react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount);

const statusCards = [
  { key: "new_count", title: "Mới", icon: AlertCircle, color: "text-amber-700 bg-amber-50" },
  { key: "confirmed_count", title: "Lên đơn", icon: ClipboardCheck, color: "text-green-700 bg-green-50" },
] as const;

export default async function AdminDashboardPage() {
  await connection();
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("admin_dashboard_summary").single();

  if (error) {
    console.error("Không thể tải số liệu dashboard:", error);
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
        Chưa tải được số liệu quản trị. Hãy kiểm tra migration, quyền admin và thử tải lại trang.
      </div>
    );
  }

  const summary = data as {
    new_today: number;
    revenue: number;
    new_count: number;
    confirmed_count: number;
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Tổng quan cửa hàng</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-brown">Xin chào, chủ tiệm!</h1>
          <p className="mt-1 text-sm text-brown/60">Theo dõi đơn bánh và hoạt động hôm nay.</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-terracotta px-4 text-sm font-bold text-white transition hover:bg-terracotta-dark"
        >
          Xem đơn hàng <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl bg-terracotta p-5 text-white shadow-lg shadow-terracotta/15 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/75">Đơn mới hôm nay</p>
              <p className="mt-3 font-serif text-4xl font-bold">{summary.new_today}</p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <ClipboardList className="size-6" />
            </span>
          </div>
        </article>
        <article className="rounded-3xl border border-brown/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brown/60">Doanh thu đơn đang xử lý/hoàn tất</p>
              <p className="mt-3 font-serif text-3xl font-bold text-brown">
                {formatPrice(Number(summary.revenue))}đ
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Wallet className="size-6" />
            </span>
          </div>
        </article>
      </div>

      <section>
        <h2 className="mb-4 font-serif text-xl font-bold text-brown">Đơn theo trạng thái</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {statusCards.map(({ key, title, icon: Icon, color }) => (
            <article key={key} className="rounded-2xl border border-brown/10 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-5" />
                </span>
                <span className="font-serif text-2xl font-bold text-brown">
                  {Number(summary[key])}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-brown/65">{title}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
