import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  MessageSquareText,
  Package,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: BarChart3, exact: true },
  { href: "/admin/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/contacts", label: "Tin nhắn", icon: MessageSquareText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-brown/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-terracotta font-serif text-lg font-bold text-white">
              T
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif font-bold text-brown">Bánh Tai Quê Nhà</span>
              <span className="block text-[11px] text-brown/55">Trang quản trị</span>
            </span>
          </Link>
          <SignOutButton />
        </div>
        <nav
          aria-label="Quản trị"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 sm:px-6 lg:px-8"
        >
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brown/65 transition hover:bg-cream hover:text-terracotta"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {children}
      </main>
    </div>
  );
}
