import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let supabaseClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getSetCookie().map((cookie) => {
          const [name, ...rest] = cookie.split("=");
          const value = rest.join("=");
          return { name, value };
        });
      },
      setAll(cookiesToSet) {
        const response = NextResponse.next();
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        return response;
      },
    },
  });

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith("/login") && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/api/chat"],
};
