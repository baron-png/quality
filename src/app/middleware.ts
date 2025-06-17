import { NextRequest, NextResponse } from "next/server";

const roleRoutes = {
  SUPER_ADMIN: "/admin",
  STAFF: "/lecturer/dashboard",
  ADMIN: "/admin",
  SYSTEM_ADMIN: "/admin",
  TRAINER: "/lecturer/dashboard",
  TRAINEE: "/student/dashboard",
  AUDITOR: "/auditor-staff/dashboard",
  MR: "/mr/dashboard",
  default: "/dashboard",
};

type RoleKey = keyof typeof roleRoutes;

const getRedirectRoute = (role: string) =>
  roleRoutes[role as RoleKey] || roleRoutes.default;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected and auth routes
  const protectedRoutes = [
    "/admin",
    "/lecturer/dashboard",
    "/student/dashboard",
    "/auditor-staff/dashboard",
    "/mr/dashboard",
    "/dashboard",
  ];
  const authRoutes = ["/login", "/sign-in", "/signup"];

  // Get accessToken from cookies or Authorization header
  const accessToken = request.cookies.get("accessToken")?.value || request.headers.get("Authorization")?.replace("Bearer ", "");

  let user = null;

  // Check authentication status by calling /me
  if (accessToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        user = await response.json();
      }
    } catch (error) {
      console.error("Middleware auth check failed:", error);
    }
  }

  // Redirect logic
  if (pathname === "/") {
    if (user) {
      const primaryRole = user.roles?.[0]?.name || "default";
      return NextResponse.redirect(new URL(getRedirectRoute(primaryRole), request.url));
    } else {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Protect routes: Redirect unauthenticated users to sign-in
  if (protectedRoutes.includes(pathname) && !user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (user && authRoutes.includes(pathname)) {
    const primaryRole = user.roles?.[0]?.name || "default";
    return NextResponse.redirect(new URL(getRedirectRoute(primaryRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/sign-in", "/signup", "/admin", "/lecturer/dashboard", "/student/dashboard", "/auditor-staff/dashboard", "/mr/dashboard", "/dashboard"],
};