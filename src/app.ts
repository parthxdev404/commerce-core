import express from "express";
import healthRouter from "./routes/health.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use("/api/products", productRouter);

export default app;
