import type { AuthTokenResponse } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { setGoogleCredentials } from "~/lib/google-calendar/client";
import { createClient } from "~/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const provider = searchParams.get("provider");
    const next = searchParams.get("next") ?? "/";

    if (code) {
      const supabase = await createClient();
      const authTokenResponse =
        await supabase.auth.exchangeCodeForSession(code);

      if (authTokenResponse.error) {
        console.error("Auth exchange error:", authTokenResponse.error);
        throw authTokenResponse.error;
      }

      void handleIntegrationCredentials(authTokenResponse, provider);
    }

    // Handle redirect
    const forwardedHost = request.headers.get("x-forwarded-host");
    if (env.NODE_ENV === "development") {
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error("Callback error:", error);
    // Redirect to error page or home with error param
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/error`);
  }
}

async function handleIntegrationCredentials(
  authTokenResponse: AuthTokenResponse,
  provider: string | null,
) {
  if (!authTokenResponse.data.user || !provider) return;

  const supabase = await createClient();
  const user_id = authTokenResponse.data.user.id;
  const access_token = authTokenResponse.data.session?.provider_token;
  const refresh_token = authTokenResponse.data.session?.provider_refresh_token;
  const expires_at = authTokenResponse.data.session?.expires_at;

  if (!access_token || !refresh_token) {
    throw new Error("Missing OAuth tokens from auth response");
  }

  const expiry_date = expires_at
    ? new Date(expires_at * 1000).toISOString()
    : null;

  // Upsert credentials instead of delete/insert
  const { error } = await supabase.from("integration_credentials").upsert(
    {
      user_id,
      provider,
      access_token,
      refresh_token,
      expiry_date,
      requires_reauth: false,
      last_refresh_attempt: new Date().toISOString(),
      refresh_error: null,
    },
    {
      onConflict: "user_id,provider",
    },
  );

  if (error) {
    console.error("Failed to upsert credentials:", error);
    throw error;
  }

  // Handle Google-specific setup
  if (provider === "google") {
    try {
      await setGoogleCredentials(user_id, refresh_token);
    } catch (error) {
      console.error("Google setup error:", error);
      await supabase
        .from("integration_credentials")
        .update({
          requires_reauth: true,
          refresh_error:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("user_id", user_id)
        .eq("provider", "google");
    }
  }
}
