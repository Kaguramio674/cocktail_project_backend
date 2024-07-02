import { OkPacket, RowDataPacket } from "mysql2";
import connection from "../db";

import Recipe from "../models/recipe.model";

interface IRecipeRepository {
  save(recipe: Recipe): Promise<Recipe>;
  retrieveAll(searchParams: {name?: string, current?: number, pageSize?: number}): Promise<{data: Recipe[], total: number}>;
  retrieveById(recipeId: number): Promise<Recipe | undefined>;
  update(recipe: Recipe): Promise<number>;
  delete(recipeId: number): Promise<number>;
}

class RecipeRepository implements IRecipeRepository {
  save(recipe: Recipe): Promise<Recipe> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "INSERT INTO recipes (name, description, imageUrl, spirit,spiritAmount,basic,basicAmount,juice,juiceAmount,other,otherAmount, alcohol, method ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [recipe.name, recipe.description, recipe.imageurl, recipe.spirit, recipe.spiritAmount, recipe.basic, recipe.basicAmount, recipe.juice, recipe.juiceAmount, recipe.other, recipe.otherAmount, recipe.alcohol, recipe.method],
        (err, res) => {
          if (err) reject(err);
          else
            this.retrieveById(res.insertId)
              .then((recipe) => resolve(recipe!))
              .catch(reject);
        }
      );
    });
  }

  
  retrieveAll(searchParams: {name?: string, spirit?: string[], alcohol?: string[],current?: number, pageSize?: number, sortBy?: string}): Promise<{data: Recipe[], total: number}> {
    const current = searchParams?.current || 1;
    const pageSize = searchParams?.pageSize || 10;
  
    let query: string = "SELECT * FROM recipes";
    let conditions: string[] = [];
  
    if (searchParams?.name) conditions.push(`LOWER(name) LIKE '%${searchParams.name}%'`);
    // OR
    // if (searchParams?.spirit?.length) {
    //   const spiritConditions = searchParams.spirit.map(spirit => `FIND_IN_SET('${spirit}', spirit)`);
    //   conditions.push(`(${spiritConditions.join(" OR ")})`);
    // }
    // AND
    if (searchParams?.spirit?.length) {
      const spiritConditions = searchParams.spirit.map(spirit => `FIND_IN_SET('${spirit}', spirit)`);
      conditions.push(`(${spiritConditions.join(" AND ")})`);
    }
    if (searchParams?.alcohol?.length) conditions.push(`alcohol IN ('${searchParams.alcohol.join("','")}')`);
  
    if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  
    const countQuery = `SELECT COUNT(*) AS total FROM recipes ${conditions.length ? 'WHERE ' + conditions.join(" AND ") : ''}`;
  
    const offset = (current - 1) * pageSize;
  
    let orderBy = 'id';
    if (searchParams?.sortBy === 'createdAt') orderBy = 'createdAt';
    else if (searchParams?.sortBy === 'likeCount') orderBy = 'likeCount DESC';
    else if (searchParams?.sortBy === 'starCount') orderBy = 'starCount DESC';
  
    query += ` ORDER BY ${orderBy} LIMIT ${pageSize} OFFSET ${offset}`;
  
  
    return new Promise((resolve, reject) => {
      connection.query<RowDataPacket[]>(countQuery, (err, countResult) => {
        if (err) reject(err);
        else {
          const total = countResult[0].total;
          connection.query<Recipe[]>(query, (err, recipes) => {
            if (err) reject(err);
            else {
              resolve({data: recipes, total: total});
            }
          });
        }
      });
    });
  }

  retrieveById(recipeId: number): Promise<Recipe> {
    return new Promise((resolve, reject) => {
      connection.query<Recipe[]>(
        "SELECT * FROM recipes WHERE id = ?",
        [recipeId],
        (err, res) => {
          if (err) reject(err);
          else resolve(res?.[0]);
        }
      );
    });
  }

  update(recipe: Recipe): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "UPDATE recipes SET name = ?, description = ?, likeCount=?, starCount=? WHERE id = ?",
        [recipe.name, recipe.description,recipe.likeCount,recipe.starCount, recipe.id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  delete(recipeId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "DELETE FROM recipes WHERE id = ?",
        [recipeId],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }
}

export default new RecipeRepository();