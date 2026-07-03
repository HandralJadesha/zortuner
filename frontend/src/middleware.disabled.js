import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // Check if we are on the admin subdomain
  // This accounts for localhost testing like admin.localhost:3000
  // as well as production like admin.zortuner.com
  if (hostname.startsWith("admin.")) {
    // If accessing the root of the admin subdomain, rewrite to /admin
    if (url.pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    // If accessing /login on the admin subdomain, rewrite to /admin/login
    if (url.pathname === "/login") {
      url.pathname = "/admin/login";
      return NextResponse.rewrite(url);
    }
  }

  // Allow the request to proceed normally if it doesn't match above rules
  return NextResponse.next();
}

export const config = {
  // Match all paths except static assets and api routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
