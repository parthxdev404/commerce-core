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
  _req: Request,
  res: Response,
): Promise<void> {
  const query = res.locals.validated;

  const result = await findProducts(query);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
}
