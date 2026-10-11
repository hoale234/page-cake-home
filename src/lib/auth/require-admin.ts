import "server-only";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Không thể xác minh phiên admin:", error.message);
  }

  if (!user || !isAdminEmail(user.email) || user.app_metadata?.role !== "admin") {
    redirect("/admin/login?error=not_admin");
  }

  return { supabase, user };
}
