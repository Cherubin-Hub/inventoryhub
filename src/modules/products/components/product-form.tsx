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
              <Link href="/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
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