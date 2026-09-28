"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { productSchema } from "./schemas";
import type { ProductInput } from "./schemas";

export async function createProduct(values: ProductInput): Promise<{ error: string | null }> {
  // We added userId here so we know who is doing the action
  const { companyId, userId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { name, sku, unit, costPrice, sellingPrice, lowStockLevel } = parsed.data;

  const existingProduct = await db.product.findUnique({
    where: { companyId_sku: { companyId, sku } }
  });

  if (existingProduct) return { error: "A product with this SKU already exists in your company." };

  const product = await db.product.create({
    data: { companyId, name, sku, unit, costPrice, sellingPrice, lowStockLevel }
  });

  // RECORD THE AUDIT LOG
  await logAction(companyId, userId, "CREATE_PRODUCT", `Created product ${name} with SKU ${sku}`);

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string, values: ProductInput): Promise<{ error: string | null }> {
  const { companyId, userId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { name, sku, unit, costPrice, sellingPrice, lowStockLevel } = parsed.data;

  const existingProduct = await db.product.findUnique({
    where: { companyId_sku: { companyId, sku } }
  });

  if (existingProduct && existingProduct.id !== id) {
    return { error: "Another product with this SKU already exists." };
  }

  await db.product.update({
    where: { id, companyId },
    data: { name, sku, unit, costPrice, sellingPrice, lowStockLevel }
  });

  // RECORD THE AUDIT LOG
  await logAction(companyId, userId, "UPDATE_PRODUCT", `Updated product ${name} (ID: ${id})`);

  revalidatePath("/products");
  redirect("/products");
}

export async function archiveProduct(id: string): Promise<{ error: string | null }> {
  const { companyId, userId } = await requireRole(["OWNER", "MANAGER"]);

  await db.product.update({
    where: { id, companyId },
    data: { isArchived: true }
  });

  // RECORD THE AUDIT LOG
  await logAction(companyId, userId, "ARCHIVE_PRODUCT", `Archived product ID: ${id}`);

  revalidatePath("/products");
  return { error: null };
}