"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Chưa thể đăng xuất. Vui lòng thử lại.");
        console.error("Đăng xuất admin không thành công:", error.message);
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Đăng xuất admin không thành công:", error);
      toast.error("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-brown/10 bg-white px-3 text-sm font-semibold text-brown/70 transition hover:border-terracotta/40 hover:text-terracotta disabled:opacity-50"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">{loading ? "Đang thoát..." : "Đăng xuất"}</span>
    </button>
  );
}
