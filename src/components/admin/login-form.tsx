"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, LoaderCircle, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  adminLoginSchema,
  type AdminLoginValues,
} from "@/lib/validation/admin-login";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  supabaseConfigured: boolean;
};

export function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState(
    searchParams.get("error") === "not_admin"
      ? "Tài khoản này chưa được cấp quyền quản trị."
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: AdminLoginValues) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setSubmitError("Email hoặc mật khẩu chưa chính xác.");
        return;
      }

      const requestedPath = searchParams.get("next");
      router.replace(
        requestedPath?.startsWith("/admin/") || requestedPath === "/admin"
          ? requestedPath
          : "/admin",
      );
      router.refresh();
    } catch (error) {
      console.error("Đăng nhập admin không thành công:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Chưa thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
      {!supabaseConfigured ? (
        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Hãy cấu hình URL và anon key của Supabase trong <code>.env.local</code> trước khi đăng nhập.
        </p>
      ) : null}
      {submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">
          {submitError}
        </p>
      ) : null}
      <label className="block text-sm font-semibold text-brown">
        Email quản trị
        <span className="relative mt-2 block">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown/45" />
          <input
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className="h-12 w-full rounded-xl border border-brown/15 bg-white pl-10 pr-3 outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
        </span>
        {errors.email?.message ? (
          <span className="mt-1 block text-xs font-medium text-red-700">{errors.email.message}</span>
        ) : null}
      </label>
      <label className="block text-sm font-semibold text-brown">
        Mật khẩu
        <span className="relative mt-2 block">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown/45" />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
            className="h-12 w-full rounded-xl border border-brown/15 bg-white pl-10 pr-3 outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
        </span>
        {errors.password?.message ? (
          <span className="mt-1 block text-xs font-medium text-red-700">{errors.password.message}</span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={submitting || !supabaseConfigured}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-bold text-white shadow-lg shadow-terracotta/15 transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-55"
      >
        {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="text-center text-xs text-brown/50">
        Khu vực dành riêng cho quản trị viên. Không có chức năng đăng ký.
      </p>
    </form>
  );
}
