### Step 8 Part 1: Product List & Creation

**a. Goal**
We are going to build the core of our inventory: the Products page. We will build a page to list the products and a form to create new ones. We will strictly enforce our rule that only OWNER and MANAGER roles can create products, and we will filter the list so users only see their own company's products.

**b. Commands to run**
No terminal commands needed.

**c. Files to create or edit**

---

**File 1: `src/modules/products/schemas.ts`** — Create the products folder in modules/, then this file:

```ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // .toUpperCase() ensures SKUs are always saved in uppercase for consistency
  sku: z.string().min(1, "SKU is required").toUpperCase(), 
  unit: z.string().min(1, "Unit is required (e.g., piece, box)"),
  // z.coerce.number() safely turns the string from the HTML input into a real number
  costPrice: z.coerce.number().min(0, "Price cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Price cannot be negative"),
  lowStockLevel: z.coerce.number().int().min(0, "Must be zero or greater"),
});

export type ProductInput = z.infer<typeof productSchema>;
```

---

**File 2: `src/modules/products/actions.ts`** — Create this new file:

```ts
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
```

---

**File 3: `src/modules/products/components/product-form.tsx`** — Create the components folder in products/, then this file:

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
import { createProduct } from "../actions";

export function ProductForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", sku: "", unit: "piece", costPrice: 0, sellingPrice: 0, lowStockLevel: 5 },
  });

  async function handleSubmit(values: ProductInput) {
    setServerError(null);
    setIsLoading(true);

    const result = await createProduct(values);
    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Product</CardTitle>
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
                {isLoading ? "Saving..." : "Save Product"}
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

**File 4: `src/app/(dashboard)/products/new/page.tsx`** — Create products and new folders in (dashboard)/, then this file:

```tsx
import { ProductForm } from "@/modules/products/components/product-form";

export default function NewProductPage() {
  return (
    <div className="py-6">
      <ProductForm />
    </div>
  );
}
```

---

**File 5: `src/app/(dashboard)/products/page.tsx`** — Create this file in the products folder:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

export default async function ProductsPage() {
  // 1. Get the current user's company and role
  const { companyId, role } = await requireCompany();

  // 2. Fetch ONLY the products for this company that aren't archived
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
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-4 font-medium">{product.sku}</td>
                  <td className="p-4">{product.name}</td>
                  {/* We convert the Decimal object to a Number, then format it as PHP */}
                  <td className="p-4">₱{Number(product.costPrice).toFixed(2)}</td>
                  <td className="p-4">₱{Number(product.sellingPrice).toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">{product.unit}</td>
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

---

**File 6: `src/app/(dashboard)/layout.tsx`** — Open this file, find the navigation links (around line 14), and add the Products link so it looks like this:

```tsx
<Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
<Link href="/products" className="text-sm font-medium hover:text-primary">Products</Link>
<Link href="/team" className="text-sm font-medium hover:text-primary">Team</Link>
```

**d. Line-by-line explanation**
* **`z.coerce.number()` (schemas.ts)**: HTML `<input type="number">` always sends data as a string (e.g., "250.00"). Coerce tells Zod to automatically convert that string into a real JavaScript number so it doesn't crash the server.
* **`companyId_sku` (actions.ts)**: In Step 5, we created a "compound unique constraint" in the database. This line checks if that exact combination of companyId and sku already exists, ensuring no two products in your company share an SKU, but allowing another company to use the same SKU.
* **`step="0.01"` (product-form.tsx)**: Tells the HTML browser that this number input allows decimals (cents), not just whole numbers.
* **`Number(product.costPrice).toFixed(2)` (page.tsx)**: Prisma returns database Decimal values as complex objects. Because this is a Server Component, we can easily convert them to standard numbers and format them with 2 decimal places and the ₱ sign before sending the raw HTML to the user.

**e. How to test**
1. Click the new Products link in your Top Navigation bar.
2. Since we seeded the database earlier, you should already see the 5 demo products!
3. Click Add Product and try creating a new one (e.g., SKU: TEST-01, Price: 150.50).
4. Try creating another product with the exact same SKU — you should see an error blocking you!

**f. Git checkpoint**
```bash
git add .
git commit -m "feat: add product list and creation flow"
```

**g. Recap** 
We built the core view of our application. Users can now see a clean list of their products with properly formatted PHP currency. Owners and Managers can safely create new products through a protected form that guarantees SKU uniqueness inside their company.
