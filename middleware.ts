import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge middleware cannot touch Prisma, so it only checks for the presence of a
// session cookie. Role enforcement (customer vs. admin) happens in the server
// layouts via requireCustomer()/requireAdmin().
const SESSION_COOKIE = "vault_session";

export function middleware(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallets/:path*",
    "/send/:path*",
    "/recipients/:path*",
    "/transactions/:path*",
    "/cards/:path*",
    "/settings/:path*",
    "/convert/:path*",
    "/admin/:path*",
  ],
};
