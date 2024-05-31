import { Application } from "express";
import tutorialRoutes from "./tutorial.routes";
import homeRoutes from "./home.routes";
import recipesRoutes from "./recipe.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/tutorials", tutorialRoutes);
    app.use("/api/recipes", recipesRoutes);
    app.use("/api", homeRoutes);
  }
}
