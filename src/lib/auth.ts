import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";

// Tells TypeScript about the custom fields we added to User and Session.
declare module "next-auth" {
  interface User {
    role: UserRole;
    companyId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Connects Auth.js to our Prisma database so it can store users and sessions.
  adapter: PrismaAdapter(db),

  // Use JSON Web Tokens instead of database sessions.
  // Required when using the Credentials provider (email/password).
  session: { strategy: "jwt" },

  // The pages option tells Auth.js where our custom login page lives.
  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      // This function runs when a user tries to log in.
      // It checks the email and password against the database.
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) {
          return null;
        }

        // Look up the user by email.
        const user = await db.user.findUnique({ where: { email } });

        // If no user found or user has no password (OAuth-only account), reject.
        if (!user || !user.password) {
          return null;
        }

        // Compare the plain-text password with the stored hash.
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return the user object. Auth.js will use this to create the session.
        return user;
      },
    }),
  ],

    callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.companyId = user.companyId;
      }

      // AUTO-REFRESH TRICK: If the token is missing a companyId (like right after signup),
      // check the database. If they just created one, update the token!
      if (!token.companyId && token.id) {
        const dbUser = await db.user.findUnique({ where: { id: token.id as string } });
        if (dbUser?.companyId) {
          token.companyId = dbUser.companyId;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.companyId = (token.companyId as string | null) || null;
      return session;
    },
  },
});
