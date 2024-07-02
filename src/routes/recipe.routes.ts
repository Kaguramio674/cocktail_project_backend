import { Router } from "express";
import RecipeController from "../controllers/recipe.controller";
import multer from 'multer';
import UserController from "../controllers/user.controller";


const upload = multer({ dest: 'uploads/' });
class RecipeRoutes {
  router = Router();
  controller = new RecipeController();
  userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Create a new Recipe
    this.router.post('/', this.controller.create);

    // Retrieve all Recipes
    this.router.get("/", this.controller.findAll);


    // Retrieve a single Recipe with id
    this.router.get("/:id", this.controller.findOne);

    // Update a Recipe with id
    this.router.put('/:id', upload.single('image'), this.controller.update);

    // Delete a Recipe with id
    this.router.delete("/:id", this.controller.delete);

    //test router
    this.router.post('/upload', upload.single('image'), this.controller.uploadImage);

    //like&star action
    this.router.put('/engagement/:id',
      this.userController.updateUserEngagement,
      this.controller.updateRecipeEngagement
    );
  }
}

export default new RecipeRoutes().router;