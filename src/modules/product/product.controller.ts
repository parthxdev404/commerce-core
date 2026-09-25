import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";

import {
  createProduct,
  deleteVendorProduct,
  findProductById,
  getProducts,
  updateVendorProduct,
} from "./product.service.js";

export async function createProductController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const product = await createProduct(req.user.id, res.locals.validated);

  res.status(201).json({
    success: true,
    data: {
      product,
    },
  });
}

export async function getProductByIdController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validated;

  const product = await findProductById(id);

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
}

export async function getProductsController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { products, total } = await getProducts(res.locals.validated);

  const { page, limit } = res.locals.validated;

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

export async function updateProductController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { id } = res.locals.validatedParams;

  const product = await updateVendorProduct(
    req.user.id,
    id,
    res.locals.validatedBody,
  );

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
}

export async function deleteProductController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { id } = res.locals.validatedParams;

  const product = await deleteVendorProduct(req.user.id, id);

  res.status(200).json({
    success: true,
    message: "Product deactivated successfully",
    data: {
      product,
    },
  });
}
