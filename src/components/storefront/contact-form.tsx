"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { contactSchema, type ContactValues } from "@/lib/validation/contact";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="mt-1 block text-xs font-medium text-red-700">{message}</span>
  ) : null;
}

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", message: "", website: "" },
  });

  async function onSubmit(values: ContactValues) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(result.error ?? "Chưa gửi được lời nhắn. Vui lòng thử lại.");
        return;
      }

      reset();
      toast.success("Shop đã nhận được lời nhắn và sẽ sớm liên hệ với bạn.");
    } catch (error) {
      console.error("Không thể gửi lời nhắn liên hệ:", error);
      toast.error("Kết nối chưa ổn định. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-3xl border border-brown/10 bg-cream/45 p-5 sm:p-8"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h3 className="font-sans text-xl font-bold">Gửi lời nhắn cho shop</h3>
      <p className="mt-1 text-sm text-brown/55">Để lại thông tin, shop sẽ liên hệ lại sớm nhé.</p>
      <div className="absolute -left-[10000px] top-auto size-px overflow-hidden">
        <label htmlFor="contact-website">Để trống trường này</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Tên của bạn
          <input
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
            className="mt-2 h-11 w-full rounded-xl border border-brown/15 bg-white px-3.5 font-normal outline-none placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="text-sm font-semibold">
          Số điện thoại
          <input
            autoComplete="tel"
            inputMode="tel"
            maxLength={10}
            placeholder="09xx xxx xxx"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
            className="mt-2 h-11 w-full rounded-xl border border-brown/15 bg-white px-3.5 font-normal outline-none placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
          <FieldError message={errors.phone?.message} />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Nội dung
          <textarea
            rows={4}
            placeholder="Bạn muốn shop hỗ trợ điều gì?"
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
            className="mt-2 w-full resize-y rounded-xl border border-brown/15 bg-white px-3.5 py-3 font-normal outline-none placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
          <FieldError message={errors.message?.message} />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-brown px-5 text-sm font-bold text-white transition hover:bg-terracotta disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? "Đang gửi..." : "Gửi lời nhắn"}
        {!submitting ? <ArrowRight className="size-4" /> : null}
      </button>
    </form>
  );
}
