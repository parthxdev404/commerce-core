import type { Request, Response } from "express";
import {
  createProduct,
  deleteVendorProduct,
  findProductById,
  findProducts,
  getProducts,
  updateVendorProduct,
} from "./product.service.js";
import { AppError } from "../../utils/app-error.js";

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
  const products = await getProducts(res.locals.validated);

  res.status(200).json({
    success: true,
    data: {
      products,
    },
  });
}

export async function updateProductController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication Required", 401);
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

export async function deletedProductController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication Required", 401);
  }

  const { id } = res.locals.validatedParams;

  const product = await deleteVendorProduct(req.user.id, id);

  res.status(200).json({
    success: true,
    message: "Product Deactivated Successfully",
    data: {
      product,
    },
  });
}
