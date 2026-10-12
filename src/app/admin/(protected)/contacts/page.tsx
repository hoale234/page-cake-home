import Link from "next/link";
import { Suspense } from "react";
import { ContactMessageCard } from "@/components/admin/contact-message-card";
import { requireAdmin } from "@/lib/auth/require-admin";

const pageSize = 20;
type SearchParams = Promise<{ page?: string }>;
type ContactRow = {
  id: string;
  name: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

async function ContactsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedPage = /^\d+$/.test(params.page ?? "") ? Number(params.page) : 1;
  const page = Math.max(1, Math.min(requestedPage, 100_000));
  const { supabase } = await requireAdmin();
  const { data, count, error } = await supabase
    .from("contacts")
    .select("id, name, phone, message, is_read, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) console.error("Không thể tải tin nhắn liên hệ:", error);
  const contacts = (data ?? []) as ContactRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">Hộp thư cửa hàng</p>
        <h1 className="mt-2 font-bold text-3xl font-bold text-brown">Tin nhắn liên hệ</h1>
        <p className="mt-1 text-sm text-brown/60">Có {totalCount} lời nhắn từ khách hàng.</p>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-800">
          Chưa tải được tin nhắn. Hãy kiểm tra kết nối và quyền admin rồi tải lại trang.
        </p>
      ) : contacts.length === 0 ? (
        <div className="rounded-3xl border border-brown/10 bg-white px-5 py-16 text-center">
          <h2 className="font-serif text-xl font-bold text-brown">Hộp thư đang trống</h2>
          <p className="mt-2 text-sm text-brown/55">Tin nhắn từ khách sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <ContactMessageCard
                key={contact.id}
                id={contact.id}
                name={contact.name}
                phone={contact.phone}
                message={contact.message}
                isRead={contact.is_read}
                createdAt={contact.created_at}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-brown/60">
            <span>Trang {Math.min(page, totalPages)} / {totalPages}</span>
            <div className="flex gap-2">
              <Link
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : undefined}
                className={`rounded-xl border border-brown/15 bg-white px-4 py-2 font-semibold ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-terracotta"}`}
                href={`/admin/contacts?page=${Math.max(page - 1, 1)}`}
              >
                Trước
              </Link>
              <Link
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : undefined}
                className={`rounded-xl border border-brown/15 bg-white px-4 py-2 font-semibold ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-terracotta"}`}
                href={`/admin/contacts?page=${Math.min(page + 1, totalPages)}`}
              >
                Sau
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminContactsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-white" />}>
      <ContactsContent searchParams={searchParams} />
    </Suspense>
  );
}
