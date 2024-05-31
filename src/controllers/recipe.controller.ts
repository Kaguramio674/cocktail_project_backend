import { Request, Response } from "express";
import Recipe from "../models/recipe.model";
import recipeRepository from "../repositories/recipe.repository";

export default class RecipeController {
  async create(req: Request, res: Response) {
    if (!req.body.name) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    try {
      const recipe: Recipe = req.body;
      const savedRecipe = await recipeRepository.save(recipe);
      res.status(201).send(savedRecipe);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving recipes."
      });
    }
  }

  async findAll(req: Request, res: Response) {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const name = typeof req.query.name === "string" ? req.query.name : "";
    const base = req.query.base as string[] || [];
    const alcohol = req.query.alcohol as string[] || [];
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";

    console.log("Received request parameters:", { name, base, alcohol, current, pageSize,sortBy});
  
    try {
      const result = await recipeRepository.retrieveAll({ name, base, alcohol, current, pageSize, sortBy});
      const response = {
        data: result.data,
        success: true,
        total: result.total
      };
  
      res.status(200).send(response);
    } catch (err) {
      console.error("Error retrieving recipes:", err);
      res.status(500).send({ message: "Some error occurred while retrieving recipes." });
    }
  }

  async findOne(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    try {
      const recipe = await recipeRepository.retrieveById(id);
      if (recipe) res.status(200).send(recipe);
      else
        res.status(404).send({
          message: `Cannot find Recipe with id=${id}.`
        });
    } catch (err) {
      res.status(500).send({
        message: `Error retrieving Recipe with id=${id}.`
      });
    }
  }

  async update(req: Request, res: Response) {
    let recipe: Recipe = req.body;
    recipe.id = parseInt(req.params.id);

    try {
      const num = await recipeRepository.update(recipe);
      if (num == 1) {
        res.send({
          message: "Recipe was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Recipe with id=${recipe.id}. Maybe Recipe was not found or req.body is empty!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Error updating Recipe with id=${recipe.id}.`
      });
    }
  }

  async delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const num = await recipeRepository.delete(id);
      if (num == 1) {
        res.send({
          message: "Recipe was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Recipe with id=${id}. Maybe Recipe was not found!`,
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Could not delete Recipe with id==${id}.`
      });
    }
  }

  async findAllPublished(req: Request, res: Response) {
    try {
      const recipes = await recipeRepository.retrieveAll({ published: true });
      res.status(200).send(recipes);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving recipes."
      });
    }
  }
}