"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { stockMovementSchema } from "./schemas";
import type { StockMovementInput } from "./schemas";

export async function createMovement(values: StockMovementInput): Promise<{ error: string | null }> {
  const { companyId, userId } = await requireRole(["OWNER", "MANAGER", "STAFF"]);

  const parsed = stockMovementSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { productId, type, quantity, note } = parsed.data;

  const product = await db.product.findUnique({
    where: { id: productId, companyId }
  });

  if (!product) {
    return { error: "Product not found or you do not have access to it." };
  }

  await db.stockMovement.create({
    data: {
      companyId,
      productId,
      type,
      quantity,
      note,
      userId
    }
  });

  revalidatePath("/movements");
  revalidatePath("/dashboard");
  redirect("/movements");
}