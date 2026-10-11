import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isLoginPage) return NextResponse.next();
    return redirectWithCookies(request, NextResponse.next(), "/admin/login");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Không thể kiểm tra phiên đăng nhập admin:", error.message);
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = Boolean(
    user?.email &&
      adminEmails.includes(user.email.toLowerCase()) &&
      user.app_metadata?.role === "admin",
  );

  if (isLoginPage && isAdmin) {
    return redirectWithCookies(request, response, "/admin");
  }

  if (!isLoginPage && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (user) loginUrl.searchParams.set("error", "not_admin");
    const loginResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      loginResponse.cookies.set(cookie);
    });
    return loginResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
