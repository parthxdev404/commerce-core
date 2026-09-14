import type { Request, Response, NextFunction } from "express";

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Prevent browsers from MIME-sniffing responses
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent the page from being embedded in frames
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent browsers from sending referrer information
  // to other origins
  res.setHeader("Referrer-Policy", "no-referrer");

  // Disable unnecessary browser features
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  next();
}
