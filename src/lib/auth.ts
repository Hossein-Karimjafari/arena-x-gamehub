import type { NextAuthOptions, DefaultSession, User as AuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import "@/lib/env"; // fail-fast env validation

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      balance: number;
      xp: number;
      level: number;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    balance: number;
    xp: number;
    level: number;
  }
}

// Whitelisted fields that a client-triggered session update may set.
// Prevents attackers from escalating role/balance/id via useSession().update().
function applyClientUpdate(token: Record<string, unknown>, session: Record<string, unknown> | null) {
  const user = (session as { user?: Record<string, unknown> } | null)?.user;
  if (!user || typeof user !== "object") return;
  if (typeof user.name === "string") token.name = user.name;
  if (typeof user.phone === "string") token.phone = user.phone;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "حساب کاربری",
      credentials: {
        id: { label: "ایمیل یا نام کاربری", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(creds) {
        const raw = creds?.id?.trim() ?? "";
        const password = creds?.password ?? "";
        if (!raw || !password) return null;
        const id = raw.toLowerCase(); // normalized for email/username
        const user = await db.user.findFirst({
          where: { OR: [{ email: id }, { username: creds?.id?.trim() }, { phone: raw }] },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password); // async, non-blocking
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name ?? user.username ?? "گیمر",
          email: user.email,
          role: user.role,
          balance: user.balance,
          xp: user.xp,
          level: user.level,
          phone: user.phone,
        } as AuthUser & { role: string; balance: number; xp: number; level: number; phone: string | null };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID
      ? [GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "" })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as AuthUser & { role?: string; balance?: number; xp?: number; level?: number };
        token.id = u.id;
        token.role = u.role ?? "USER";
        token.balance = u.balance ?? 0;
        token.xp = u.xp ?? 0;
        token.level = u.level ?? 1;
      }
      if (trigger === "update") applyClientUpdate(token as unknown as Record<string, unknown>, session as unknown as Record<string, unknown> | null);
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.balance = token.balance as number;
      session.user.xp = token.xp as number;
      session.user.level = token.level as number;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
};
