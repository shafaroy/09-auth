import { NextRequest, NextResponse } from "next/server";
import { parseSetCookie } from "cookie";

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

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);

  const refreshedCookies: ReturnType<typeof parseSetCookie>[] = [];

  if (!accessToken && refreshToken) {
    try {
      const response = await fetch(
        "https://notehub-api.goit.study/auth/session",
        {
          headers: {
            Cookie: request.headers.get("cookie") ?? "",
          },
          cache: "no-store",
        },
      );

      if (response.ok) {
        const setCookies = response.headers.getSetCookie();

        for (const cookieString of setCookies) {
          const parsed = parseSetCookie(cookieString);

          if (parsed.value) {
            refreshedCookies.push(parsed);
          }
        }

        isAuthenticated = refreshedCookies.some(
          (cookie) => cookie.name === "accessToken",
        );
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
    }
  }

  let result: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    result = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublicRoute && isAuthenticated) {
    result = NextResponse.redirect(new URL("/", request.url));
  } else {
    const requestHeaders = new Headers(request.headers);

    for (const cookie of refreshedCookies) {
      if (cookie.value !== undefined) {
        request.cookies.set(cookie.name, cookie.value);
      }
    }

    requestHeaders.set("cookie", request.cookies.toString());

    result = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  for (const cookie of refreshedCookies) {
    if (cookie.value === undefined) {
      continue;
    }

    result.cookies.set({
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

  return result;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
