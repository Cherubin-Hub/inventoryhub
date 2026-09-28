"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { productSchema } from "./schemas";
import type { ProductInput } from "./schemas";

export async function createProduct(values: ProductInput): Promise<{ error: string | null }> {
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { name, sku, unit, costPrice, sellingPrice, lowStockLevel } = parsed.data;

  const existingProduct = await db.product.findUnique({
    where: { companyId_sku: { companyId, sku } }
  });

  if (existingProduct) return { error: "A product with this SKU already exists in your company." };

  await db.product.create({
    data: { companyId, name, sku, unit, costPrice, sellingPrice, lowStockLevel }
  });

  revalidatePath("/products");
  redirect("/products");
}

// NEW: Update an existing product
export async function updateProduct(id: string, values: ProductInput): Promise<{ error: string | null }> {
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);

  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input data." };

  const { name, sku, unit, costPrice, sellingPrice, lowStockLevel } = parsed.data;

  const existingProduct = await db.product.findUnique({
    where: { companyId_sku: { companyId, sku } }
  });

  // If a product with this SKU exists, and it's NOT the product we are currently editing, block it.
  if (existingProduct && existingProduct.id !== id) {
    return { error: "Another product with this SKU already exists." };
  }

  // The where clause includes companyId to guarantee they own the product they are editing
  await db.product.update({
    where: { id, companyId },
    data: { name, sku, unit, costPrice, sellingPrice, lowStockLevel }
  });

  revalidatePath("/products");
  redirect("/products");
}

// NEW: Archive a product (Soft Delete)
export async function archiveProduct(id: string): Promise<{ error: string | null }> {
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);

  await db.product.update({
    where: { id, companyId },
    data: { isArchived: true }
  });

  revalidatePath("/products");
  return { error: null };
}