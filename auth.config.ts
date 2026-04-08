import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/map") ||
        nextUrl.pathname.startsWith("/countries") ||
        nextUrl.pathname.startsWith("/settings");
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
};
