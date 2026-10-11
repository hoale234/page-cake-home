"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Thiếu cấu hình Supabase công khai. Vui lòng kiểm tra .env.local.");
  }

  return createBrowserClient(url, anonKey);
}
