### Step 8 Part 2: Product Edit & Archive

**a. Goal**
Allow Managers and Owners to update product details (like changing the price) and archive old products. We strictly use "soft delete" (`isArchived: true`) instead of permanently deleting products from the database so we never break historical accounting records.

**b. Commands to run**
No terminal commands needed.

**c. Files to create or edit**

---

**File 1: `src/modules/products/actions.ts`** — Replace the entire file to add the `updateProduct` and `archiveProduct` actions:

```ts
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
```

---

**File 2: `src/modules/products/components/product-form.tsx`** — Replace the entire file so it accepts `initialData` for editing:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { productSchema, type ProductInput } from "../schemas";
import { createProduct, updateProduct } from "../actions";

// NEW: We accept optional initialData. If it exists, we are in "Edit" mode.
export function ProductForm({ initialData }: { initialData?: any }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!initialData;

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { 
      name: initialData?.name || "", 
      sku: initialData?.sku || "", 
      unit: initialData?.unit || "piece", 
      costPrice: initialData?.costPrice || 0, 
      sellingPrice: initialData?.sellingPrice || 0, 
      lowStockLevel: initialData?.lowStockLevel || 5 
    },
  });

  async function handleSubmit(values: ProductInput) {
    setServerError(null);
    setIsLoading(true);

    const result = isEditing 
      ? await updateProduct(initialData.id, values)
      : await createProduct(values);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{isEditing ? "Edit Product" : "Create New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {serverError && <div className="text-sm text-destructive">{serverError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="Laptop" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU (Stock Keeping Unit)</FormLabel><FormControl><Input placeholder="LAP-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="costPrice" render={({ field }) => (
                <FormItem><FormLabel>Cost Price (PHP)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                <FormItem><FormLabel>Selling Price (PHP)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit (e.g., piece, kg, box)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="lowStockLevel" render={({ field }) => (
                <FormItem><FormLabel>Low Stock Warning Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (isEditing ? "Update Product" : "Save Product")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

---

**File 3: `src/app/(dashboard)/products/[id]/edit/page.tsx`** — Create the `[id]` folder inside `products/`, then an `edit` folder inside `[id]/`, then this file:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";
import { ProductForm } from "@/modules/products/components/product-form";

// In Next.js, [id] in the folder name becomes params.id here
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { companyId } = await requireCompany();
  const { id } = await params;
  
  // Fetch the product, ensuring it belongs to this company
  const product = await db.product.findUnique({
    where: { id, companyId }
  });

  // If they type a random ID in the URL, show a 404 page
  if (!product) {
    notFound();
  }

  // We convert Prisma Decimals to raw JavaScript numbers so the React form can read them
  const formattedProduct = {
    ...product,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice)
  };

  return (
    <div className="py-6">
      <ProductForm initialData={formattedProduct} />
    </div>
  );
}
```

---

**File 4: `src/app/(dashboard)/products/page.tsx`** — Replace the entire file to add the Actions column with Edit and Archive buttons:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { archiveProduct } from "@/modules/products/actions";

export default async function ProductsPage() {
  const { companyId, role } = await requireCompany();

  const products = await db.product.findMany({
    where: { companyId, isArchived: false },
    orderBy: { createdAt: "desc" }
  });

  const canEdit = role === "OWNER" || role === "MANAGER";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your inventory catalogue.</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/products/new">Add Product</Link>
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Cost Price</th>
              <th className="p-4 font-medium">Selling Price</th>
              <th className="p-4 font-medium">Unit</th>
              {/* NEW: Actions Column Header */}
              {canEdit && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="p-8 text-center text-muted-foreground">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-4 font-medium">{product.sku}</td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">₱{Number(product.costPrice).toFixed(2)}</td>
                  <td className="p-4">₱{Number(product.sellingPrice).toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">{product.unit}</td>
                  
                  {/* NEW: Actions Column */}
                  {canEdit && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/products/${product.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={async () => {
                          "use server";
                          await archiveProduct(product.id);
                        }}>
                          <Button variant="destructive" size="sm" type="submit">Archive</Button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**d. Line-by-line explanation**
* **`existingProduct.id !== id` (actions.ts)**: When updating, if we find a product with the same SKU, we check if the ID matches the one we are editing. If it matches, they are just saving without changing the SKU (which is fine). If it doesn't match, they are trying to steal another product's SKU, so we block it.
* **`isEditing = !!initialData` (product-form.tsx)**: A clever trick. `!!` forces the value to a boolean. If `initialData` was passed in, this becomes `true`, and we dynamically change the button text to "Update Product".
* **`{ params }: { params: Promise<{ id: string }> }` (edit/page.tsx)**: In the Next.js App Router, folders with brackets like `[id]` capture that part of the URL (e.g., `/products/123/edit` makes `id = "123"`). We `await params` to read it securely.
* **`form action={async () => {...}}` (page.tsx)**: Server Actions can be run directly inside buttons by wrapping them in an HTML `<form>`. This lets us archive a product without needing to write any complex client-side React code.

**e. How to test**
1. Visit your Products page (`http://localhost:3000/products`).
2. You should now see **Edit** and **Archive** buttons on the right side of every row.
3. Click **Edit** on a product, change the selling price, and click "Update Product". Verify the price changes in the table.
4. Click **Archive**. The page will reload instantly and the product will disappear from the list (it is now soft-deleted!).

**f. Git checkpoint**
```bash
git add .
git commit -m "feat: implement product editing and archiving"
```

**g. Recap** 
We completed the Product feature! You built a dynamic edit form that reuses our Zod schema and UI, and implemented a robust soft-delete system that preserves data integrity for our future accounting ledger.
