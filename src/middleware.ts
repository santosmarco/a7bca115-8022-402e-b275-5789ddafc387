import { log } from "@logtail/next";
import type { NextRequest } from "next/server";

import { updateSession } from "~/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  log.info(`=> ${request.method.toUpperCase()} ${request.url}`, {
    url: request.url,
    method: request.method.toUpperCase(),
    headers: Object.fromEntries(request.headers.entries()),
    nextUrl: {
      pathname: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    },
  });

  const response = await updateSession(request);

  log.info(`<= ${response.status} ${response.statusText}`, {
    status: response.status,
    statusText: response.statusText,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|embed|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
