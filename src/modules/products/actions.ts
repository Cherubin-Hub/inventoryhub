"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { productSchema } from "./schemas";
import type { ProductInput } from "./schemas";

export async function createProduct(values: ProductInput): Promise<{ error: string | null }> {
  // SERVER SECURITY: Only Owners and Managers can create products. Staff are blocked.
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { name, sku, unit, costPrice, sellingPrice, lowStockLevel } = parsed.data;

  // Check the compound unique constraint (SKU must be unique WITHIN this company)
  const existingProduct = await db.product.findUnique({
    where: { 
      companyId_sku: { companyId, sku } 
    }
  });

  if (existingProduct) {
    return { error: "A product with this SKU already exists in your company." };
  }

  // Create the product. Prisma automatically converts the numbers to Decimals for the DB.
  await db.product.create({
    data: {
      companyId,
      name,
      sku,
      unit,
      costPrice,
      sellingPrice,
      lowStockLevel,
    }
  });

  // Clear the cache so the list updates, then go back to the list page.
  revalidatePath("/products");
  redirect("/products");
}