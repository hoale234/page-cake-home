import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { checkSubmissionRateLimit } from "@/lib/storefront/rate-limit";
import { contactSchema } from "@/lib/validation/contact";

function getRequestIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",").at(-1)?.trim() || "unknown";

  return "unknown";
}

export async function POST(request: NextRequest) {
  const rateLimit = checkSubmissionRateLimit(`contacts:${getRequestIp(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Bạn gửi lời nhắn hơi nhanh. Vui lòng thử lại sau ít phút." },
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
    return NextResponse.json({ error: "Nội dung gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json(
      { error: parsed.success ? "Yêu cầu không hợp lệ." : "Vui lòng kiểm tra lại thông tin liên hệ." },
      { status: 400 },
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Shop chưa cấu hình hộp thư liên hệ. Vui lòng gọi hoặc nhắn Zalo." },
      { status: 503 },
    );
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("contacts").insert({
    name: parsed.data.name,
    phone: parsed.data.phone.replace(/[\s().-]/g, ""),
    message: parsed.data.message,
  });

  if (error) {
    console.error("Không thể lưu lời nhắn liên hệ:", error);
    return NextResponse.json(
      { error: "Chưa gửi được lời nhắn. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
