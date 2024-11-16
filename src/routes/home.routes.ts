import { Router } from "express";
import { welcome,healthCheck } from "../controllers/home.controller";

class HomeRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/", welcome);
    this.router.get("/health", healthCheck);
  }
}

export default new HomeRoutes().router;
