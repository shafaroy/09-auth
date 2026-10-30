import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  let isAuthenticated = false;

  try {
    const response = await fetch(new URL("/api/auth/session", request.url), {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const session: { success: boolean } = await response.json();
      isAuthenticated = session.success;
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
