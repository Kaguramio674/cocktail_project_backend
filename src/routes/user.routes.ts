import { Router } from "express";
import RecipeController from "../controllers/recipe.controller";

class RecipeRoutes {
  router = Router();
  controller = new RecipeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Create a new user
    this.router.post("/", this.controller.create);

    // Update a user with id
    this.router.put("/:id", this.controller.update);

    // Delete a user with id
    this.router.delete("/:id", this.controller.delete);

  }
}

export default new RecipeRoutes().router;