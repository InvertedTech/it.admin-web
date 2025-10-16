import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "token"
const PUBLIC_PATHS = ["/login"]

/**
 * Require a `token` cookie for dashboard routes. Redirect unauthenticated users
 * to the auth zone.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (
    isPublicPath ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value

  if (!token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
