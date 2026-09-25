export interface CreateProductInput {
  vendorId: number;
  categoryId: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
}

export interface Product {
  id: number;
  vendorId: number;
  categoryId: number;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort: "created_at" | "price" | "name";
  order: "asc" | "desc";
}
