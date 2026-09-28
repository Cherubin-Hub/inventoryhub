"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { addMemberSchema } from "./schemas";
import type { AddMemberInput } from "./schemas";

export async function addTeamMember(values: AddMemberInput): Promise<{ error: string | null }> {
  // SERVER-SIDE SECURITY: Only Owners and Managers can run this action.
  // If a Staff member tries to hack the form and send a request, this throws an error.
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = addMemberSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, email, password, role } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { error: "An account with this email already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      companyId, // MULTI-TENANCY RULE: We force the new user into the creator's company!
    },
  });

  // Refreshes the Team page so the new user appears instantly
  revalidatePath("/team");
  return { error: null };
}
