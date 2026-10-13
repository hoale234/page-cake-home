import { randomInt } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkSubmissionRateLimit } from "@/lib/storefront/rate-limit";
import { getProductUnit } from "@/lib/storefront/product-unit";
import { checkoutSchema, isValidVietnamesePhone } from "@/lib/validation/order";
import { siteConfig } from "@/config/site";

function getRequestIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",").at(-1)?.trim() || "unknown";
  }

  return "unknown";
}

function createOrderCode() {
  const date = new Date();
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const datePart = ["year", "month", "day"]
    .map((type) => dateParts.find((part) => part.type === type)?.value ?? "")
    .join("");
  return `BT-${datePart}-${randomInt(100000, 1_000_000)}`;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkSubmissionRateLimit(`orders:${getRequestIp(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bạn gửi đơn hơi nhanh. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nội dung đơn hàng không hợp lệ." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json(
      { error: parsed.success ? "Yêu cầu không hợp lệ." : "Vui lòng kiểm tra lại thông tin đặt hàng." },
      { status: 400 },
    );
  }

  if (!isValidVietnamesePhone(parsed.data.phone)) {
    return NextResponse.json({ error: "Số điện thoại Việt Nam chưa đúng." }, { status: 400 });
  }

  const requestedItems = new Map<string, number>();
  for (const item of parsed.data.items) {
    requestedItems.set(
      item.slug,
      (requestedItems.get(item.slug) ?? 0) + item.quantity,
    );
  }
  if ([...requestedItems.values()].some((quantity) => quantity > 10)) {
    return NextResponse.json({ error: "Số lượng mỗi sản phẩm tối đa là 10." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Shop chưa cấu hình kết nối đặt hàng. Vui lòng liên hệ trực tiếp." },
      { status: 503 },
    );
  }

  const supabase = createServiceRoleClient();
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, price, unit")
    .in("slug", [...requestedItems.keys()])
    .eq("is_active", true);

  if (productsError) {
    console.error("Không thể đọc giá sản phẩm khi tạo đơn:", productsError);
    return NextResponse.json({ error: "Chưa thể xác nhận giá bánh. Vui lòng thử lại." }, { status: 500 });
  }

  if (!products || products.length !== requestedItems.size) {
    return NextResponse.json(
      { error: "Một sản phẩm trong giỏ hàng vừa ngừng bán. Vui lòng tải lại trang." },
      { status: 400 },
    );
  }

  const items = products.map((product) => ({
    product_id: product.id,
    product_name: product.name,
    unit_price: product.price,
    unit: getProductUnit(product.slug, product.unit),
    quantity: requestedItems.get(product.slug)!,
  }));
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const shippingFee = siteConfig.shippingFee;
  const order = {
    customer_name: parsed.data.customer_name,
    phone: parsed.data.phone.replace(/[\s().-]/g, ""),
    address: [
      parsed.data.house_number,
      parsed.data.ward,
      parsed.data.province,
    ].join(", "),
    note: parsed.data.note,
    payment_method: parsed.data.payment_method,
    subtotal,
    shipping_fee: shippingFee,
    total: subtotal + shippingFee,
  };

  let createdOrder: { id: string; order_code: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase
      .from("orders")
      .insert({ ...order, order_code: createOrderCode() })
      .select("id, order_code")
      .single();

    if (!error && data) {
      createdOrder = data;
      break;
    }
    if (error?.code !== "23505") {
      console.error("Không thể lưu đơn hàng:", error);
      return NextResponse.json({ error: "Chưa thể lưu đơn hàng. Vui lòng thử lại." }, { status: 500 });
    }
  }

  if (!createdOrder) {
    console.error("Không thể tạo mã đơn hàng duy nhất sau 3 lần thử.");
    return NextResponse.json({ error: "Chưa thể tạo mã đơn hàng. Vui lòng thử lại." }, { status: 503 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({ ...item, order_id: createdOrder.id })),
  );

  if (itemsError) {
    console.error("Không thể lưu sản phẩm trong đơn hàng:", itemsError);
    const { error: rollbackError } = await supabase
      .from("orders")
      .delete()
      .eq("id", createdOrder.id);
    if (rollbackError) {
      console.error("Không thể hoàn tác đơn hàng chưa đủ sản phẩm:", rollbackError);
    }
    return NextResponse.json({ error: "Chưa thể lưu đầy đủ đơn hàng. Vui lòng thử lại." }, { status: 500 });
  }

  return NextResponse.json(
    { orderCode: createdOrder.order_code, total: order.total },
    { status: 201 },
  );
}
