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
