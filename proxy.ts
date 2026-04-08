import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Auth.js v5's `auth` function acts as a proxy/middleware handler when exported
// directly. The `authorized` callback in authConfig handles the redirect logic.
export const proxy = auth;

export const config = {
  matcher: ["/map/:path*", "/countries/:path*", "/settings/:path*"],
};
