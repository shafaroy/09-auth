import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { checkSession } from "./lib/api/serverApi";
const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  let isAuthenticated = Boolean(accessToken);

  const refreshedCookies: ReturnType<typeof parseSetCookie>[] = [];

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();

      if (sessionResponse.data.success) {
        const rawCookies = sessionResponse.headers["set-cookie"];
        const setCookies = rawCookies
          ? Array.isArray(rawCookies)
            ? rawCookies
            : [rawCookies]
          : [];
        for (const cookieString of setCookies) {
          const parsed = parseSetCookie(cookieString);

          if (parsed.name && parsed.value !== undefined) {
            refreshedCookies.push(parsed);
          }
        }

        isAuthenticated = refreshedCookies.some(
          (cookie) => cookie.name === "accessToken" && Boolean(cookie.value),
        );
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      isAuthenticated = false;
    }
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));

    for (const cookie of refreshedCookies) {
      if (cookie.value === undefined) continue;

      redirectResponse.cookies.set({
        name: cookie.name,
        value: cookie.value,
        path: cookie.path ?? "/",
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as "strict" | "lax" | "none" | undefined,
        expires: cookie.expires,
        maxAge: cookie.maxAge,
      });
    }

    return redirectResponse;
  }

  const requestHeaders = new Headers(request.headers);

  const currentCookies = new Map(
    cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
  );

  for (const cookie of refreshedCookies) {
    if (cookie.value !== undefined) {
      currentCookies.set(cookie.name, cookie.value);
    }
  }

  const updatedCookieHeader = Array.from(currentCookies.entries())
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

  requestHeaders.set("cookie", updatedCookieHeader);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const cookie of refreshedCookies) {
    if (cookie.value === undefined) continue;

    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path ?? "/",
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as "strict" | "lax" | "none" | undefined,
      expires: cookie.expires,
      maxAge: cookie.maxAge,
    });
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
