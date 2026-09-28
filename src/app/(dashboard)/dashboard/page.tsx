import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { companyId } = await requireCompany();

  // 1. Fetch active products
  const products = await db.product.findMany({
    where: { companyId, isArchived: false },
  });

  // 2. Fetch all movements for the company separately (bypassing the schema relation issue)
  const allMovements = await db.stockMovement.findMany({
    where: { companyId }
  });

  // 3. Match them up and calculate stock dynamically
  const stockData = products.map((product) => {
    // Find only the movements that belong to this specific product
    const productMovements = allMovements.filter((m) => m.productId === product.id);

    const currentStock = productMovements.reduce((total, move) => {
      if (move.type === "IN") return total + move.quantity;
      if (move.type === "OUT") return total - move.quantity;
      // For ADJUSTMENT, we just add the quantity
      return total + move.quantity; 
    }, 0);

    return { ...product, currentStock };
  });

  // 4. Filter products that have dropped to or below their low stock warning level
  const lowStockProducts = stockData.filter(
    (p) => p.currentStock <= p.lowStockLevel
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* High-level Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Items Needing Attention</h2>
      
      {/* Low Stock Warning Cards */}
      {lowStockProducts.length === 0 ? (
        <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground">
          All stock levels are healthy! No items are running low.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockProducts.map((product) => (
            <Card key={product.id} className="border-destructive/50 bg-destructive/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">[{product.sku}] {product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Current Stock: <span className="font-bold text-destructive">{product.currentStock}</span> {product.unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  Warning Level: {product.lowStockLevel}
                </p>
                <div className="mt-4">
                  <Link href="/movements/new">
                    <Button size="sm" variant="outline" className="bg-white hover:bg-gray-100">
                      Restock Item
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}