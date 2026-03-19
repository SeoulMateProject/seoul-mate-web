import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/sign-in", "/auth/sign-up", "/docs", "/api"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/sign-in";
    signInUrl.search = `callbackUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|images/|map/).*)"],
};
