import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";

import { getInventory, updateInventory } from "./inventory.service.js";

export async function getInventoryController(
  _req: Request,
  res: Response,
): Promise<void> {
  const { id } = res.locals.validatedParams;

  const inventory = await getInventory(id);

  res.status(200).json({
    success: true,
    data: {
      inventory,
    },
  });
}

export async function updateInventoryController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { id } = res.locals.validatedParams;

  const inventory = await updateInventory(
    req.user.id,
    id,
    res.locals.validatedBody,
  );

  res.status(200).json({
    success: true,
    data: {
      inventory,
    },
  });
}
