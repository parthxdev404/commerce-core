import express from "express";
import healthRouter from "./routes/health.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(requestId);
app.use(requestLogger);
app.use("/health", healthRouter);
app.use("/api/products", productRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
