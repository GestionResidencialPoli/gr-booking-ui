import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  HEADERS_TO_STRIP_ON_FORWARD,
  authUiLoginUrl,
  decideSessionAccess,
} from "@gestionresidencial/auth-client";

const GUARD_CONFIG = {
  publicPaths: ["/auth/sso/callback"],
  loginPath: authUiLoginUrl(),
};

function forwardToBackend(request: NextRequest) {
  const headers = new Headers(request.headers);
  HEADERS_TO_STRIP_ON_FORWARD.forEach((header) => headers.delete(header));
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  const decision = decideSessionAccess(
    request.nextUrl.pathname,
    request.cookies.has(ACCESS_TOKEN_COOKIE),
    GUARD_CONFIG,
  );

  switch (decision.type) {
    case "forward-to-backend":
      return forwardToBackend(request);
    case "redirect":
      return NextResponse.redirect(new URL(decision.to, request.url));
    default:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|favicon.ico|.*\\..*).*)"],
};
