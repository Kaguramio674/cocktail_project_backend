import { Router } from "express";
import RecipeController from "../controllers/recipe.controller";

class RecipeRoutes {
  router = Router();
  controller = new RecipeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Create a new Recipe
    this.router.post("/", this.controller.create);

    // Retrieve all Recipes
    this.router.get("/", this.controller.findAll);

    // Retrieve all published Recipes
    this.router.get("/published", this.controller.findAllPublished);

    // Retrieve a single Recipe with id
    this.router.get("/:id", this.controller.findOne);

    // Update a Recipe with id
    this.router.put("/:id", this.controller.update);

    // Delete a Recipe with id
    this.router.delete("/:id", this.controller.delete);

  }
}

export default new RecipeRoutes().router;