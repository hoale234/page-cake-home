import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { orderStatuses, type OrderStatus } from "@/lib/admin/orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !isAdminEmail(user.email) || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Bạn chưa có quyền xuất dữ liệu đơn hàng." }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const search = (params.get("search") ?? "").replace(/[^0-9A-Za-z-]/g, "").trim().slice(0, 50);
  const phone = (params.get("phone") ?? "").replace(/\D/g, "").slice(0, 10);
  const validStatus =
    status && orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : "";

  const rows: {
    order_code: string;
    customer_name: string;
    phone: string;
    address: string;
    payment_method: string;
    subtotal: number;
    shipping_fee: number;
    total: number;
    status: string;
    created_at: string;
  }[] = [];

  for (let offset = 0; offset < 50_000; offset += 500) {
    let query = supabase
      .from("orders")
      .select("order_code, customer_name, phone, address, payment_method, subtotal, shipping_fee, total, status, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + 499);

    if (validStatus) query = query.eq("status", validStatus);
    if (search) query = query.ilike("order_code", `%${search}%`);
    if (phone) query = query.ilike("phone", `%${phone}%`);

    const { data, error } = await query;
    if (error) {
      console.error("Không thể xuất danh sách đơn hàng:", error);
      return NextResponse.json({ error: "Chưa thể xuất CSV. Vui lòng thử lại." }, { status: 500 });
    }

    rows.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }

  const header = [
    "Mã đơn",
    "Khách hàng",
    "Số điện thoại",
    "Địa chỉ",
    "Thanh toán",
    "Tạm tính",
    "Phí giao hàng",
    "Tổng tiền",
    "Trạng thái",
    "Thời gian tạo",
  ];
  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.order_code,
        row.customer_name,
        row.phone,
        row.address,
        row.payment_method,
        row.subtotal,
        row.shipping_fee,
        row.total,
        row.status,
        row.created_at,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  const csv = `\uFEFF${lines.join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="don-hang.csv"',
      "Cache-Control": "no-store",
    },
  });
}
