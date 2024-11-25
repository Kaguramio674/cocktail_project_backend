import { Request, Response } from "express";

export function welcome(req: Request, res: Response): Response {
  return res.json({ message: "Welcome to aasd application." });
}
export function healthCheck(req: Request, res: Response): Response {
  return res.status(200).json({ status: "healthy" });
}