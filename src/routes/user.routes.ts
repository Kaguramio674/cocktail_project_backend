import { Router } from "express";
import { expressjwt } from "express-jwt";
import UserController from "../controllers/user.controller";

const JWT_SECRET = "cockTailMio";

class UserRoutes {
  router = Router();
  controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get("/", this.controller.findAll);
    // Create a new user
    this.router.post("/", this.controller.create);

    // Update a user with id
    this.router.put("/:id", this.controller.update);

    // Delete a user with id
    this.router.delete("/:id", this.controller.delete);

    this.router.post("/login", this.controller.login);

    this.router.get(
      "/api/checkLogin",
      expressjwt({ secret: JWT_SECRET, algorithms: ["HS256"] }),
      this.controller.checkLogin
    );
  }
}

export default new UserRoutes().router;