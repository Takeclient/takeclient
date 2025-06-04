import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "./prisma";
import { Adapter } from "next-auth/adapters";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Cast the adapter to resolve type incompatibility issues
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            tenant: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Return user with properly typed fields to match NextAuth User interface
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId || undefined, // Convert null to undefined to match User interface
          tenantSlug: user.tenant?.slug,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId || null;
        token.tenantSlug = user.tenantSlug || null;
        token.isSuperAdmin = user.isSuperAdmin;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role; // Fix: cast to Role enum instead of string
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
};