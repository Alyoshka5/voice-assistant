import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth();

    const { pathname } = request.nextUrl;

    if (pathname === '/' && session?.user) {
        return NextResponse.redirect(new URL('/ai', request.url));
    }

    const isProtectedRoute = pathname !== '/' && pathname !== '/privacy' && !pathname.startsWith('/api');
    if (isProtectedRoute && !session?.user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
      "/",
      "/((?!api|_next/static|_next/image|.*\\..*|favicon.svg).*)",
    ],
  };