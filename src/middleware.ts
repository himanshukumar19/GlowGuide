import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_PROTECTED_ROUTES = [
  "/dashboard",
  "/quiz",
  "/analysis",
  "/cart",
  "/wishlist",
  "/checkout",
  "/complete-profile",
];

const ADMIN_PROTECTED_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.svg" ||
    pathname === "/favicon.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/og-image.png"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;

  const isCustomerProtected = CUSTOMER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isCustomerProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = ADMIN_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute && pathname !== "/admin/login" && !sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/", request.url));
      
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|favicon.png|apple-touch-icon.png|og-image.png).*)"],
};
