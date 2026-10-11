"use client";

import { useState } from "react";
import { CheckCheck, LoaderCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { updateContactRead } from "@/app/admin/(protected)/contacts/actions";

type ContactMessageCardProps = {
  id: string;
  name: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function ContactMessageCard(contact: ContactMessageCardProps) {
  const [isRead, setIsRead] = useState(contact.isRead);
  const [saving, setSaving] = useState(false);

  async function markAsRead() {
    setSaving(true);
    try {
      const result = await updateContactRead({ id: contact.id, is_read: true });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setIsRead(true);
      toast.success("Đã đánh dấu tin nhắn đã đọc.");
    } catch (error) {
      console.error("Không thể đánh dấu tin nhắn đã đọc:", error);
      toast.error("Chưa thể cập nhật tin nhắn. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${isRead ? "border-brown/10" : "border-terracotta/35 shadow-terracotta/5"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-brown">{contact.name}</h2>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isRead ? "bg-brown/5 text-brown/55" : "bg-terracotta/10 text-terracotta"}`}>
              {isRead ? "Đã đọc" : "Chưa đọc"}
            </span>
          </div>
          <a
            href={`tel:${contact.phone}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta"
          >
            <Phone className="size-3.5" /> {contact.phone}
          </a>
        </div>
        <time className="text-xs text-brown/50">
          {new Intl.DateTimeFormat("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date(contact.createdAt))}
        </time>
      </div>
      <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-cream/65 p-3 text-sm leading-6 text-brown/80">
        {contact.message}
      </p>
      {!isRead ? (
        <button
          type="button"
          onClick={markAsRead}
          disabled={saving}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-brown/15 px-3 text-xs font-bold text-brown transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
        >
          {saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
          Đánh dấu đã đọc
        </button>
      ) : null}
    </article>
  );
}
