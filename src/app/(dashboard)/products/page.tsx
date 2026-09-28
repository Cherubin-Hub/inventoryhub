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
                  No products found. Click Add Product to create one.
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