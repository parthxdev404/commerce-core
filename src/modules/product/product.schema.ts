import { z } from "zod";

export const createProductSchema = z.object({
  vendorId: z.coerce.number().int().positive(),

  categoryId: z.coerce.number().int().positive(),

  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(100, "SKU cannot exceed 100 characters"),

  price: z.coerce.number().nonnegative("Price cannot be negative"),
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().min(1).max(100).optional(),

  categoryId: z.coerce.number().int().positive().optional(),

  minPrice: z.coerce.number().nonnegative().optional(),

  maxPrice: z.coerce.number().nonnegative().optional(),

  sort: z.enum(["created_at", "price", "name"]).default("created_at"),

  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductListQueryInput = z.infer<typeof productListQuerySchema>;

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateProductSchema = z
  .object({
    categoryId: z.coerce.number().int().positive().optional(),

    name: z.string().trim().min(1).max(200).optional(),

    description: z.string().trim().max(5000).optional(),

    price: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (data) =>
      data.categoryId !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.price !== undefined,
    {
      message: "At least one field is required",
    },
  );
