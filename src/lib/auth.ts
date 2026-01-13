import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Check if Google OAuth is properly configured
const isGoogleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "" &&
  process.env.GOOGLE_CLIENT_SECRET !== ""
);

export const authOptions: NextAuthOptions = {
  providers: [
    // Only add Google provider if credentials are configured
    ...(isGoogleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    // Demo/bypass provider for when Google isn't configured
    CredentialsProvider({
      id: "demo",
      name: "Demo Access",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // Allow demo access with any @drinkbrez.com email
        const email = credentials?.email || "";
        if (email.endsWith("@drinkbrez.com") || email === "demo@brez.com") {
          return {
            id: "demo-user",
            email: email,
            name: email.split("@")[0],
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow demo provider
      if (account?.provider === "demo") {
        return true;
      }

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
