import { NextResponse } from "next/server";

import { createClient } from "~/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("[Auth Callback] Starting auth callback", {
    hasCode: !!code,
    next,
    origin,
  });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      console.log("[Auth Callback] Session exchange successful", {
        forwardedHost,
        isLocalEnv,
        origin,
        next,
      });

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    console.error("[Auth Callback] Failed to exchange code for session", {
      error,
    });
  }

  console.log("[Auth Callback] Redirecting to error page", { origin });
  return NextResponse.redirect(`${origin}${next}`);
}
