"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Home, MessageCircle, Package, Phone, ShoppingBasket } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/lib/store/cart";

const tabs = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/dat-hang", label: "Đặt hàng", icon: ShoppingBasket, cart: true },
  { href: "/lien-he", label: "Liên hệ", icon: MessageCircle },
];

function StorefrontNavigation() {
  const pathname = usePathname();
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brown/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-terracotta font-serif text-xl font-bold text-cream">
              T
            </span>
            <span className="truncate font-serif text-base font-bold text-brown sm:text-lg">
              {siteConfig.name}
            </span>
          </Link>
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
            {tabs.map(({ href, label, cart }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition ${
                    active
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-brown/65 hover:bg-white hover:text-terracotta"
                  }`}
                >
                  {label}
                  {cart ? <CartBadge count={count} /> : null}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/dat-hang"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-brown/15 bg-white px-3.5 text-sm font-bold text-brown shadow-sm transition hover:border-terracotta hover:text-terracotta md:hidden"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <ShoppingBasket className="size-4" />
            <CartBadge count={count} />
          </Link>
        </div>
      </header>
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-brown/10 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_rgba(80,53,42,.08)] backdrop-blur md:hidden"
      >
        <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-4">
          {tabs.map(({ href, label, icon: Icon, cart }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                  active ? "text-terracotta" : "text-brown/55 hover:text-brown"
                }`}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                  {cart && count > 0 ? (
                    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] leading-4 text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function CartBadge({ count }: { count: number }) {
  return (
    <span className="flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] leading-5 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function StorefrontUtilities() {
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-[5.5rem] right-3 z-40 flex flex-col gap-2 sm:right-5 md:bottom-5">
        <a
          href={siteConfig.zaloUrl || "/lien-he"}
          aria-label="Chat Zalo"
          className="flex size-11 items-center justify-center rounded-full bg-[#1778f2] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1168d6]"
        >
          <MessageCircle className="size-5" />
        </a>
        <a
          href={siteConfig.phone ? `tel:${siteConfig.phone}` : "/lien-he"}
          aria-label="Gọi ngay"
          className="flex size-11 items-center justify-center rounded-full bg-terracotta text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-terracotta-dark"
        >
          <Phone className="size-5" />
        </a>
      </div>
      <footer className="border-t border-brown/10 bg-white px-4 pb-20 pt-3 text-xs text-brown/55 md:pb-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-between">
          <span>
            {siteConfig.name}
            {siteConfig.phone ? (
              <>
                {" · "}
                <a className="font-semibold text-brown/75 hover:text-terracotta" href={`tel:${siteConfig.phone}`}>
                  {siteConfig.phone}
                </a>
              </>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => setPolicyOpen(true)}
            className="font-semibold underline decoration-brown/30 underline-offset-2 hover:text-terracotta"
          >
            Chính sách
          </button>
        </div>
      </footer>
      {policyOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brown/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPolicyOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-title"
            className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl"
          >
            <h2 id="policy-title" className="font-serif text-xl font-bold text-brown">
              Chính sách giao hàng
            </h2>
            <p className="mt-3 text-sm leading-6 text-brown/70">
              Giao hàng toàn quốc, phí ship đồng giá 15.000đ/đơn. Shop đóng gói
              cẩn thận; nếu đơn hàng gặp vấn đề, vui lòng liên hệ shop để được hỗ trợ.
            </p>
            <button
              type="button"
              onClick={() => setPolicyOpen(false)}
              className="mt-5 h-10 w-full rounded-full bg-brown text-sm font-bold text-white transition hover:bg-terracotta"
            >
              Đã hiểu
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-brown">
      <StorefrontNavigation />
      <main className="flex flex-1 flex-col">{children}</main>
      <StorefrontUtilities />
    </div>
  );
}
