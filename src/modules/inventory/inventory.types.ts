export interface Inventory {
  productId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: Date;
}

export interface UpdateInventoryInput {
  quantity: number;
}
