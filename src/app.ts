import express from "express";
import healthRouter from "./routes/health.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.js";
import { securityHeaders } from "./middleware/security.middlware.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";

const app = express();

app.disable("x-powered-by");
app.use(
  express.json({
    limit: "1mb",
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use("/health", healthRouter);
app.use("/api/products", productRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
