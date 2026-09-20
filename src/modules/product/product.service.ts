import { AppError } from "../../utils/app-error.js";
import { findVendorByUserId } from "../vendor/vendor.repository.js";
import {
  createProduct as CreateProductRepository,
  deactivateProductByVendor,
  findAllProducts,
  findProductByIdAndVendorId,
  findProductById as findProductByIdRepository,
  findProducts as findProductsRepository,
} from "./product.repository.js";
import type {
  CreateProductInput,
  Product,
  ProductListQuery,
  ProductListResult,
} from "./product.types.js";

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  if (input.name.trim().length === 0) {
    throw new Error("Product name is Required");
  }
  if (input.sku.trim().length === 0) {
    throw new Error("Product SKU is required");
  }
  if (input.price < 0) {
    throw new Error("Product Price cannot be negative");
  }

  return CreateProductRepository(input);
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

export async function findProducts(
  query: ProductListQuery,
): Promise<ProductListResult> {
  return findProductsRepository(query);
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

  const product = await findProductByIdAndVendorId(productId, vendor.id);

  if (!product) {
    throw new AppError("Product not found or you do not own this product", 404);
  }

  if (!product.isActive) {
    throw new AppError("Cannot update an inactive product", 400);
  }

  const updatedProduct = await updateVendorProduct(productId, vendor.id, input);

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

  const product = await findProductByIdAndVendorId(productId, vendor.id);

  if (!product) {
    throw new AppError("Product not found or you do not own this product", 404);
  }

  const deletedProduct = await deactivateProductByVendor(productId, vendor.id);

  if (!deletedProduct) {
    throw new AppError("Product could not be deactivated", 409);
  }

  return deletedProduct;
}
