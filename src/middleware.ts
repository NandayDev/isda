import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const ROUTES = {
  HOME: "/",
  SIGNIN: "/signin",
  VOTE: "/vote",
  VOTERS: "/voters",
};

export const PRIVATE_ROUTES = [ROUTES.VOTERS, ROUTES.VOTE];
export const PUBLIC_ROUTES = [ROUTES.SIGNIN];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (PRIVATE_ROUTES.includes(req.nextUrl.pathname) && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = ROUTES.SIGNIN;
    return NextResponse.redirect(redirectUrl);
  }

  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname) && session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = ROUTES.HOME;
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [...PRIVATE_ROUTES, ...PUBLIC_ROUTES],
};
