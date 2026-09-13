import type { Request, Response } from "express";
import {
  createProduct,
  findProductById,
  findProducts,
} from "./product.service.js";

export async function createProductController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const product = await createProduct({
      vendorId: Number(req.body.vendorId),
      categoryId: Number(req.body.categoryId),
      name: req.body.name,
      description: req.body.description,
      sku: req.body.sku,
      price: Number(req.body.price),
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("does not exist")) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getProductByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  const productId = Number(req.params.id);
  const product = await findProductById(productId);

  res.status(200).json({
    success: true,
    data: product,
  });
}

export async function getProductsController(
  req: Request,
  res: Response,
): Promise<void> {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const categoryId =
    typeof req.query.search === "string"
      ? Number(req.query.categoryId)
      : undefined;

  const allowedSorts = ["created_at", "price", "name"] as const;

  const requestedSort =
    typeof req.query.sort === "string" ? req.query.sort : "created_at";

  const sort = allowedSorts.includes(
    requestedSort as (typeof allowedSorts)[number],
  )
    ? (requestedSort as (typeof allowedSorts)[number])
    : "created_at";

  const requestedOrder =
    typeof req.query.order === "string" ? req.query.order : "desc";

  const order = requestedOrder === "asc" ? "asc" : "desc";

  const result = await findProducts({
    page,
    limit,
    search,
    categoryId,
    sort,
    order,
  });

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
}
