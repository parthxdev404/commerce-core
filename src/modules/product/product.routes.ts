import { Router } from "express";

import {
  createProductController,
  getProductByIdController,
  getProductsController,
} from "./product.controller.js";

const productRouter = Router();

productRouter.post("/", createProductController);
productRouter.get("/", getProductsController);
productRouter.get("/:id", getProductByIdController);
export { productRouter };
