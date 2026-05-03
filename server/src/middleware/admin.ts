import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-admin-key"] as string | undefined;
  const envKey = process.env.ADMIN_SECRET_KEY;

  if (!envKey) {
    res.status(503).json({ error: "Admin key not configured on server" });
    return;
  }
  if (!key || key !== envKey) {
    res.status(403).json({ error: "Invalid admin key" });
    return;
  }
  next();
}
