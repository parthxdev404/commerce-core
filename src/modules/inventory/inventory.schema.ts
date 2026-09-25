import { z } from "zod";

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateInventorySchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export const inventoryQuantitySchema = z.object({
  quantity: z.coerce.number().int().positive(),
});
