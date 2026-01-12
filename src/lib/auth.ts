import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow @drinkbrez.com emails or specific allowed emails
      const allowedDomains = ["drinkbrez.com"];
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];

      const email = user.email || "";
      const domain = email.split("@")[1];

      if (allowedDomains.includes(domain) || allowedEmails.includes(email)) {
        return true;
      }

      // For development, allow all emails
      if (process.env.NODE_ENV === "development") {
        return true;
      }

      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
