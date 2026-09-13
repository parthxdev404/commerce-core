import {
  createProduct as CreateProductRepository,
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

export async function findProductById(productId: number): Promise<Product> {
  const product = await findProductByIdRepository(productId);

  if (!product) {
    throw new Error("Product not found");
  }
  return product;
}

export async function findProducts(
  query: ProductListQuery,
): Promise<ProductListResult> {
  return findProductsRepository(query);
}
