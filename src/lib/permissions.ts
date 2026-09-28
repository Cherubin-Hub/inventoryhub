import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Helper 1: Ensures the user is logged in
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in");
  }
  return session.user;
}

// Helper 2: Ensures the user has a company attached (Multi-tenancy rule)
export async function requireCompany() {
  const user = await requireAuth();
  if (!user.companyId) {
    throw new Error("Forbidden: No company attached");
  }
  return { userId: user.id, companyId: user.companyId, role: user.role };
}

// Helper 3: Ensures the user has a specific role (Server-side security)
export async function requireRole(allowedRoles: UserRole[]) {
  const context = await requireCompany();
  
  if (!allowedRoles.includes(context.role)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  
  return context;
}
