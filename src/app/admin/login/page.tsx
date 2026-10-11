import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#f1d6b4_0%,#fbf6ec_58%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-brown/10 bg-white p-6 shadow-2xl shadow-brown/10 sm:p-9">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brown/60 transition hover:text-terracotta"
        >
          <ArrowLeft className="size-4" /> Về trang cửa hàng
        </Link>
        <div className="mt-8 flex size-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <LockKeyhole className="size-6" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
          Khu vực quản trị
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brown">
          Chào mừng trở lại
        </h1>
        <p className="mt-2 text-sm leading-6 text-brown/60">
          Đăng nhập bằng tài khoản admin đã tạo trong Supabase.
        </p>
        <Suspense
          fallback={
            <div className="mt-7 h-56 animate-pulse rounded-2xl bg-cream" />
          }
        >
          <LoginForm supabaseConfigured={supabaseConfigured} />
        </Suspense>
      </div>
    </main>
  );
}
