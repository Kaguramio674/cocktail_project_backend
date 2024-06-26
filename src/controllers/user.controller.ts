import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import userRepository from "../repositories/user.repository";


const JWT_SECRET = "cocktailMio";
export default class UserController {
  async create(req: Request, res: Response) {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.identity) {
      res.status(400).send({
        message: "Username, email and password are required."
      });
      return;
    }

    try {
      const user: User = req.body;
      const salt = await bcrypt.genSalt(10);//
      user.password = await bcrypt.hash(user.password, salt);
      const savedUser = await userRepository.save(user);
      res.status(201).send(savedUser);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).send({
        message: "Some error occurred while creating the User."
      });
    }
  }

  async update(req: Request, res: Response) {
    let user: User = req.body;
    user.id = parseInt(req.params.id);

    try {
      const num = await userRepository.update(user);
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${user.id}. Maybe User was not found or req.body is empty!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Error updating User with id=${user.id}.`
      });
    }
  }

  async delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const num = await userRepository.delete(id);
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Could not delete User with id==${id}.`
      });
    }
  }
  async findAll(req: Request, res: Response) {
    const username = typeof req.query.username === "string" ? req.query.username : "";
    const email = typeof req.query.email === "string" ? req.query.email : "";
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";

    try {
      const users = await userRepository.retrieveAll({ username, email, sortBy });
      res.status(200).send(users);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving users."
      });
    }
  }
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      const user = await userRepository.retrieveByUsername(username);
      if (!user) {
        res.status(401).send({ success: false, message: "Invalid username or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).send({ success: false, message: "Invalid username or password" });
        return;
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: 60 * 60 });
      res.status(200).send({ success: true, token, user });
    } catch (err) {
      res.status(500).send({ success: false, message: "Error logging in" });
    }
  }
  async checkLogin(req: Request, res: Response) {
    res.status(200).send({ isLoggedIn: true });
  }


  async updateUserEngagement(req: Request, res: Response, next: NextFunction) {
    const userId: number = req.query.userId as unknown as number;
    const recipeId: number = parseInt(req.params.id);
    const action: string = req.query.action as string;
    const type: string = req.query.type as string;
  
    try {
      const user = await userRepository.retrieveById(userId);
      if (!user) {
        res.status(404).send({
          message: `Cannot find User with id=${userId}.`
        });
        return;
      }
      console.log(user.liked);
      if (type === 'like') {
        const likedRecipes = user.liked ? user.liked.split(',').map(Number) : [];
        if (action === 'add') {
          if (!likedRecipes.includes(recipeId)) {
            likedRecipes.push(recipeId);
          }
        } else if (action === 'remove') {
          const index = likedRecipes.indexOf(recipeId);
          if (index !== -1) {
            likedRecipes.splice(index, 1);
          }
        }
        user.liked = likedRecipes.join(',');
      } else if (type === 'star') {
        const starredRecipes = user.stared ? user.stared.split(',').map(Number) : [];
        if (action === 'add') {
          if (!starredRecipes.includes(recipeId)) {
            starredRecipes.push(recipeId);
          }
        } else if (action === 'remove') {
          const index = starredRecipes.indexOf(recipeId);
          if (index !== -1) {
            starredRecipes.splice(index, 1);
          }
        }
        user.stared = starredRecipes.join(',');
      }
      console.log(user.liked);
  
      await userRepository.update(user);
      next();
    } catch (err) {
      res.status(500).send({
        message: `Error updating user engagement for User with id=${userId}.`
      });
    }
  }

}