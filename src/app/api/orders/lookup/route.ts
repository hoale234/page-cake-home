import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkSubmissionRateLimit } from "@/lib/storefront/rate-limit";
import { orderLookupSchema } from "@/lib/validation/order";

function getRequestIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",").at(-1)?.trim() || "unknown";

  return "unknown";
}

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const rateLimit = checkSubmissionRateLimit(`order-lookup:${getRequestIp(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bạn tra cứu hơi nhanh. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Thông tin tra cứu không hợp lệ." }, 400);
  }

  const parsed = orderLookupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Vui lòng kiểm tra lại số điện thoại." }, 400);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Shop chưa cấu hình tra cứu đơn hàng. Vui lòng liên hệ shop." }, 503);
  }

  const supabase = createServiceRoleClient();
  const pageSize = 500;
  const orders = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, phone, address, note, payment_method, subtotal, shipping_fee, total, status, created_at")
      .eq("phone", parsed.data.phone)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Không thể tra cứu đơn hàng:", error);
      return jsonResponse({ error: "Chưa thể tra cứu đơn hàng. Vui lòng thử lại sau." }, 500);
    }
    orders.push(...data);
    if (data.length < pageSize) break;
  }

  if (!orders.length) {
    return jsonResponse({ orders: [] }, 200);
  }

  const itemsByOrderId = new Map<
    string,
    Array<{ order_id: string; product_name: string; unit_price: number; unit: string; quantity: number }>
  >();
  const itemBatchSize = 40;
  for (let start = 0; start < orders.length; start += itemBatchSize) {
    const orderIds = orders.slice(start, start + itemBatchSize).map((order) => order.id);
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("order_id, product_name, unit_price, unit, quantity")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Không thể tải sản phẩm trong đơn hàng:", itemsError);
      return jsonResponse({ error: "Chưa thể tải chi tiết đơn hàng. Vui lòng thử lại sau." }, 500);
    }

    for (const item of items) {
      const orderItems = itemsByOrderId.get(item.order_id) ?? [];
      orderItems.push(item);
      itemsByOrderId.set(item.order_id, orderItems);
    }
  }

  return jsonResponse(
    {
      orders: orders.map((order) => ({
        orderCode: order.order_code,
        customerName: order.customer_name,
        phone: order.phone,
        address: order.address,
        note: order.note,
        paymentMethod: order.payment_method,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        items: (itemsByOrderId.get(order.id) ?? []).map((item) => ({
          name: item.product_name,
          unitPrice: item.unit_price,
          unit: item.unit,
          quantity: item.quantity,
        })),
      })),
    },
    200,
  );
}
