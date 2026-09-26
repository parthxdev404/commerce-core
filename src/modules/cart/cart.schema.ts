import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const cartItemIdParamSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});
