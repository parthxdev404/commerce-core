import { AppError } from "../../utils/app-error.js";

import {
  createInventory,
  findInventoryByProductId,
  updateInventoryQuantity,
  reserveInventory,
  releaseInventoryReservation,
  confirmInventoryReservation,
} from "./inventory.repository.js";

import { findVendorByUserId } from "../vendor/vendor.repository.js";
import { findProductByIdAndVendorId } from "../product/product.repository.js";

import type { UpdateInventoryInput } from "./inventory.types.js";

export async function getInventory(productId: number) {
  const inventory = await findInventoryByProductId(productId);

  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }

  return inventory;
}

export async function initializeInventory(productId: number, quantity = 0) {
  return createInventory(productId, quantity);
}

export async function updateInventory(
  userId: number,
  productId: number,
  input: UpdateInventoryInput,
) {
  const vendor = await findVendorByUserId(userId);

  if (!vendor) {
    throw new AppError("Vendor profile not found", 404);
  }

  const product = await findProductByIdAndVendorId(productId, vendor.id);

  if (!product) {
    throw new AppError("Product not found or you do not own this product", 404);
  }

  const inventory = await updateInventoryQuantity(productId, input);

  if (!inventory) {
    throw new AppError(
      "Inventory quantity cannot be lower than reserved quantity",
      409,
    );
  }

  return inventory;
}

export async function reserveProductInventory(
  productId: number,
  quantity: number,
) {
  if (quantity <= 0) {
    throw new AppError("Quantity must be greater than zero", 400);
  }

  const inventory = await reserveInventory(productId, quantity);

  if (!inventory) {
    throw new AppError("Insufficient inventory", 409);
  }

  return inventory;
}

export async function releaseProductInventory(
  productId: number,
  quantity: number,
) {
  const inventory = await releaseInventoryReservation(productId, quantity);

  if (!inventory) {
    throw new AppError("Invalid inventory reservation", 409);
  }

  return inventory;
}

export async function confirmProductInventory(
  productId: number,
  quantity: number,
) {
  const inventory = await confirmInventoryReservation(productId, quantity);

  if (!inventory) {
    throw new AppError("Inventory reservation not found", 409);
  }

  return inventory;
}
