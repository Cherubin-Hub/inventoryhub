"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createCompanySchema } from "./schemas";
import type { CreateCompanyInput } from "./schemas";

export async function createCompany(values: CreateCompanyInput): Promise<{ error: string | null }> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const parsed = createCompanySchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  try {
    // A database transaction ensures BOTH operations succeed, or BOTH fail.
    // We don't want a company created if the user update fails.
    await db.$transaction(async (tx) => {
      // 1. Create the new company
      const newCompany = await tx.company.create({
        data: { name: parsed.data.name },
      });

      // 2. Attach the user to the company and promote them to OWNER
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          companyId: newCompany.id,
          role: "OWNER",
        },
      });
    });
  } catch (error) {
    return { error: "Failed to create company. Please try again." };
  }

  // Navigate to the dashboard. The middleware will let them pass now!
  redirect("/dashboard");
}
