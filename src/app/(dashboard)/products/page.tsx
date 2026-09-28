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
          <Link href="/products/new">
            <Button>Add Product</Button>
          </Link>
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
                  No products found. Click Add Product to create one.
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
                        <Link href={`/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
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