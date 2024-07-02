import { Request, Response } from "express";
import Recipe from "../models/recipe.model";
import recipeRepository from "../repositories/recipe.repository";
import AWS, { S3 } from "aws-sdk";
import fs from 'fs';

const bucketName = process.env.AWS_BUCKET_NAME as string;
const region = process.env.AWS_BUCKET_REGION as string;
const accessKeyId = process.env.AWS_ACCESS_KEY as string;
const secretAccessKey = process.env.AWS_SECRET_KEY as string;

const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});


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

      if (recipe.spirits) {
      // split Spirits to Spirit and SpiritAmount
      const spiritArray = recipe.spirits.map((item: { spirits: string; amount: string }) => item.spirits);
      const spiritAmountArray = recipe.spirits.map((item: { spirits: string; amount: string }) => item.amount);
      recipe.spirit = spiritArray.join(',');
      recipe.spiritAmount = spiritAmountArray.join(',');

      }

      if (recipe.basics) {
        // split Basics to Basic and BasicAmount
        const basicArray = recipe.basics.map((item: { basics: string; amount: string }) => item.basics);
        const basicAmountArray = recipe.basics.map((item: { basics: string; amount: string }) => item.amount);
        recipe.basic = basicArray.join(',');
        recipe.basicAmount = basicAmountArray.join(',');

      }
      if (recipe.juices) {
        // split Juices to Juice and JuiceAmount
        const juiceArray = recipe.juices.map((item: { juices: string; amount: string }) => item.juices);
        const juiceAmountArray = recipe.juices.map((item: { juices: string; amount: string }) => item.amount);
        recipe.juice = juiceArray.join(',');
        recipe.juiceAmount = juiceAmountArray.join(',');
      }
      if (recipe.others) {
        // split Juices to Juice and JuiceAmount
        const otherArray = recipe.others.map((item: { others: string; amount: string }) => item.others);
        const otherAmountArray = recipe.others.map((item: { others: string; amount: string }) => item.amount);
        recipe.other = otherArray.join(',');
        recipe.otherAmount = otherAmountArray.join(',');

      }




      const savedRecipe = await recipeRepository.save(recipe);
      res.status(201).send(savedRecipe);
    } catch (err) {
      console.error("Error creating recipe:", err);
      res.status(500).send({
        message: "Some error occurred while retrieving recipes."
      });
    }
  }

  async findAll(req: Request, res: Response) {
    const current = Number(req.query.current) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const name = typeof req.query.name === "string" ? req.query.name : "";
    const spirit = req.query.spirit as string[] || [];
    const alcohol = req.query.alcohol as string[] || [];
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";

    //console.log("Received request parameters:", { name, spirit, alcohol, current, pageSize,sortBy});

    try {
      const result = await recipeRepository.retrieveAll({ name, spirit, alcohol, current, pageSize, sortBy });
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
  async uploadImage(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).send({ message: "No file uploaded." });
      return;
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;

    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: bucketName,
      Key: `public/recipe-img/${fileName}`,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    try {
      const data = await s3.upload(params).promise();
      //show data in console
      //console.log(data);
      res.status(200).send({ message: "File uploaded successfully.", url: data.Location });
    } catch (err) {
      console.error("Error uploading file:", err);
      res.status(500).send({ message: "Error uploading file." });
    }
  }

  async updateRecipeEngagement(req: Request, res: Response) {
    const recipeId: number = parseInt(req.params.id);
    const action: string = req.query.action as string;
    const type: string = req.query.type as string;

    try {
      const recipe = await recipeRepository.retrieveById(recipeId);
      if (!recipe) {
        res.status(404).send({
          message: `Cannot find Recipe with id=${recipeId}.`
        });
        return;
      }

      if (type === 'like') {
        recipe.likeCount = action === 'add' ? recipe.likeCount + 1 : recipe.likeCount - 1;
      } else if (type === 'star') {
        recipe.starCount = action === 'add' ? recipe.starCount + 1 : recipe.starCount - 1;
      } else {
        res.status(400).send({
          message: 'Invalid engagement type.'
        });
        return;
      }

      await recipeRepository.update(recipe);

      res.status(200).send({
        message: `${type} ${action === 'add' ? 'added' : 'removed'} successfully.`
      });

    } catch (err) {
      //show error message in console
      console.error("Error updating engagement:", err);
      res.status(500).send({
        message: `Error updating ${type} for Recipe with id=${recipeId}.`
      });
    }
  }

}