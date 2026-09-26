export interface Cart {
  id: number;
  userId: number;
  created_at: number;
  updated_at: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  productName: string;
  price: number;
  isActive: boolean;
}

export interface AddCartItemsInput {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemsInput {
  quantity: number;
}
