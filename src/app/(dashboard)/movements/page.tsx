import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

export default async function MovementsPage() {
  const { companyId } = await requireCompany();

  // Fetch all movements for the company and include the linked Product data
  const movements = await db.stockMovement.findMany({
    where: { companyId },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Ledger</h1>
          <p className="text-muted-foreground">Immutable history of all inventory changes.</p>
        </div>
        <Link href="/your-link">
          <Button>Record Movement</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium text-right">Quantity</th>
              <th className="p-4 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No stock movements recorded yet.
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id} className="border-b last:border-0 hover:bg-muted/20">
                  {/* .toLocaleDateString formats the DB timestamp to a human readable date */}
                  <td className="p-4 text-muted-foreground">
                    {movement.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium">
                    [{movement.product.sku}] {movement.product.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      movement.type === "IN" ? "bg-green-100 text-green-700" :
                      movement.type === "OUT" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {movement.type === "OUT" ? "-" : "+"}{movement.quantity}
                  </td>
                  <td className="p-4 text-muted-foreground truncate max-w-[200px]">
                    {movement.note || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}