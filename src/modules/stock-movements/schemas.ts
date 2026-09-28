import { z } from "zod";
import { MovementType } from "@prisma/client";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  type: z.nativeEnum(MovementType),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;