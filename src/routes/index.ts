import { Application } from "express";
import userRoutes from "./user.routes";
import homeRoutes from "./home.routes";
import recipesRoutes from "./recipe.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/recipes", recipesRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api", homeRoutes);
  }
}
