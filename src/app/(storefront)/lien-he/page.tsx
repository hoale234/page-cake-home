import type { Metadata } from "next";
import { Clock3, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Liên hệ cửa hàng",
  description: "Gọi điện, nhắn Facebook hoặc gửi lời nhắn cho cửa hàng bánh tai.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta sm:text-xs">
          Shop luôn sẵn lòng
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-brown sm:text-3xl">
          Liên hệ cửa hàng
        </h1>
        <p className="mt-1 text-xs text-brown/60 sm:text-sm">
          Cần tư vấn vị bánh hay hỏi về đơn hàng? Nhắn shop nhé.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={siteConfig.phone ? `tel:${siteConfig.phone}` : "#contact-message"}
          className="flex min-h-16 items-center gap-3 rounded-2xl border border-brown/10 bg-white p-3.5 transition hover:border-terracotta/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
            <Phone className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-brown/50">Gọi điện</span>
            <span className="mt-0.5 block truncate text-sm font-bold text-brown">
              {siteConfig.phone || "Shop cập nhật số điện thoại"}
            </span>
          </span>
        </a>
        <a
          href={siteConfig.facebookUrl || "#contact-message"}
          target={siteConfig.facebookUrl ? "_blank" : undefined}
          rel={siteConfig.facebookUrl ? "noreferrer" : undefined}
          className="flex min-h-16 items-center gap-3 rounded-2xl border border-brown/10 bg-white p-3.5 transition hover:border-[#1877f2]/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1877f2]/10 text-[#1877f2]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
              <path d="M13.5 21.95v-8.1h2.7l.4-3.15h-3.1V8.69c0-.91.25-1.53 1.56-1.53h1.66V4.34c-.29-.04-1.28-.12-2.43-.12-2.41 0-4.06 1.47-4.06 4.17v2.32H7.5v3.15h2.73v8.1h3.27Z" />
            </svg>
          </span>
          <span>
            <span className="block text-[11px] font-semibold text-brown/50">Facebook</span>
            <span className="mt-0.5 block text-sm font-bold text-brown">Nhắn shop ngay</span>
          </span>
        </a>
        <div className="flex items-center gap-2 px-1 text-[11px] text-brown/50 sm:col-span-2">
          <Clock3 className="size-3.5" />
          Shop sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
        </div>
      </div>
    </section>
  );
}
