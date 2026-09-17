import type { Request, Response, NextFunction } from "express";

import { ZodError, type ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validate(
  schema: ZodType,
  target: ValidationTarget = "body",
  outputKey = "validated",
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req[target]);

      res.locals[outputKey] = validatedData;

      next();
    } catch (error) {
      next(error);
    }
  };
}
