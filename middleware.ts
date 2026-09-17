import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminPath, isOperationalMemberRoute } from "@/lib/role-policy";

// Routes that require the visitor to simply be logged in.
const MEMBER_ROUTES = ["/dashboard"];
// Routes that require an admin_roles entry (checked again via RLS on every
// query - this middleware check is a UX convenience, NOT the security
// boundary. The real boundary is Postgres Row Level Security.)
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isMemberRoute = MEMBER_ROUTES.some((r) => path.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => path.startsWith(r));

  if ((isMemberRoute || isAdminRoute) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user) {
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!canAccessAdminPath(adminRole?.role ?? null, path)) {
      return NextResponse.redirect(new URL("/dashboard?error=not_admin", request.url));
    }
  }

  if (user && isOperationalMemberRoute(path)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("membership_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.membership_status !== "active") {
      return NextResponse.redirect(new URL("/dashboard?error=member_not_active", request.url));
    }
  }

  return response;
}

export const config = {
  // Only protected route trees need server-side session refresh and redirects.
  // Public pages use the browser auth client for navigation state.
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
