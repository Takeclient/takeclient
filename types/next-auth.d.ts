import { Role } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID */
      id: string;
      /** The user's name */
      name?: string | null;
      /** The user's email */
      email?: string | null;
      /** The user's image */
      image?: string | null;
      /** The user's role */
      role: Role;
      /** The tenant ID if user belongs to a tenant */
      tenantId: string | null;
      /** The tenant slug if user belongs to a tenant */
      tenantSlug: string | null;
      /** Whether the user is a super admin */
      isSuperAdmin: boolean;
      /** Whether the user is active */
      isActive: boolean;
    };
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    /** The user's ID */
    id: string;
    /** The user's role */
    role: Role;
    /** The tenant ID if user belongs to a tenant */
    tenantId?: string;
    /** The tenant slug if user belongs to a tenant */
    tenantSlug?: string;
    /** Whether the user is a super admin */
    isSuperAdmin: boolean;
    /** Whether the user is active */
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's ID */
    id: string;
    /** The user's role */
    role: Role;
    /** The tenant ID if user belongs to a tenant */
    tenantId: string | null;
    /** The tenant slug if user belongs to a tenant */
    tenantSlug: string | null;
    /** Whether the user is a super admin */
    isSuperAdmin: boolean;
    /** Whether the user is active */
    isActive: boolean;
  }
}
