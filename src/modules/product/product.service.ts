import { AppError } from "../../utils/app-error.js";

import { findVendorByUserId } from "../vendor/vendor.repository.js";

import {
  createProduct as createProductRepository,
  deactivateProductByVendor,
  findAllProducts,
  findProductByIdAndVendorId,
  findProductById as findProductByIdRepository,
  updateProductByVendor,
} from "./product.repository.js";

import type {
  CreateProductInput,
  Product,
  ProductListQuery,
} from "./product.types.js";

export async function createProduct(
  userId: number,
  input: Omit<CreateProductInput, "vendorId">,
): Promise<Product> {
  const vendor = await findVendorByUserId(userId);

  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  if (!vendor.isActive) {
    throw new AppError("Vendor account is inactive", 403);
  }

  return createProductRepository({
    ...input,
    vendorId: vendor.id,
  });
}

export async function getProducts(query: ProductListQuery) {
  return findAllProducts(query);
}

export async function findProductById(productId: number): Promise<Product> {
  const product = await findProductByIdRepository(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
}

export async function updateVendorProduct(
  userId: number,
  productId: number,
  input: {
    categoryId?: number;
    name?: string;
    description?: string;
    price?: number;
  },
): Promise<Product> {
  const vendor = await findVendorByUserId(userId);

  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  if (!vendor.isActive) {
    throw new AppError("Vendor account is inactive", 403);
  }

  const product = await findProductByIdAndVendorId(productId, vendor.id);

  if (!product) {
    throw new AppError("Product not found or you do not own this product", 404);
  }

  if (!product.isActive) {
    throw new AppError("Cannot update an inactive product", 400);
  }

  const updatedProduct = await updateProductByVendor(
    productId,
    vendor.id,
    input,
  );

  if (!updatedProduct) {
    throw new AppError("Product could not be updated", 409);
  }

  return updatedProduct;
}

export async function deleteVendorProduct(
  userId: number,
  productId: number,
): Promise<Product> {
  const vendor = await findVendorByUserId(userId);

  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  if (!vendor.isActive) {
    throw new AppError("Vendor account is inactive", 403);
  }

  const product = await findProductByIdAndVendorId(productId, vendor.id);

  if (!product) {
    throw new AppError("Product not found or you do not own this product", 404);
  }

  if (!product.isActive) {
    throw new AppError("Product is already inactive", 400);
  }

  const deletedProduct = await deactivateProductByVendor(productId, vendor.id);

  if (!deletedProduct) {
    throw new AppError("Product could not be deactivated", 409);
  }

  return deletedProduct;
}
