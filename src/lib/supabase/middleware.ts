import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";

import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  console.log("[Auth Middleware] Starting session update", {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log("[Auth Middleware] Getting cookies", {
            cookieCount: cookies.length,
            cookieNames: cookies.map((c) => c.name),
          });
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log("[Auth Middleware] Setting cookies", {
            cookieCount: cookiesToSet.length,
            cookieNames: cookiesToSet.map((c) => c.name),
          });

          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[Auth Middleware] Get user result", {
    hasUser: !!user,
    error: userError,
    path: request.nextUrl.pathname,
  });

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    console.log("[Auth Middleware] Redirecting to login", {
      from: request.nextUrl.pathname,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
