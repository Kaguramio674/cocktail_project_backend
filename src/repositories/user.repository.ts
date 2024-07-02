import { OkPacket } from "mysql2";
import connection from "../db";
import User from "../models/user.model";

class UserRepository {
    save(user: User): Promise<User> {
        return new Promise((resolve, reject) => {
            connection.query<OkPacket>(
                "INSERT INTO users (username, email, identity, password) VALUES(?,?,?,?)",
                [user.username, user.email, user.identity, user.password],
                (err, res) => {
                    if (err) {
                        console.error("Error executing query:", err);
                        reject(err);
                    } else {
                        this.retrieveById(res.insertId)
                            .then((user) => resolve(user!))
                            .catch((err) => {
                                console.error("Error retrieving user after insertion:", err);
                                reject(err);
                            });
                    }
                }
            );
        });
    }
    retrieveById(userId: number): Promise<User> {
        return new Promise((resolve, reject) => {
            connection.query<User[]>(
                "SELECT * FROM users WHERE id = ?",
                [userId],
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res[0] as User);
                }
            );
        });
    }
    retrieveByUsername(username: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
          connection.query<User[]>(
            "SELECT * FROM users WHERE username = ?",
            [username],
            (err, res) => {
              if (err) reject(err);
              else resolve(res[0] || null);
            }
          );
        });
      }
    retrieveAll(searchParams: { username?: string, email?: string, sortBy?: string }): Promise<User[]> {
        let query = "SELECT * FROM users";
        const conditions = [];

        if (searchParams.username) {
            conditions.push(`username LIKE '%${searchParams.username}%'`);
        }

        if (searchParams.email) {
            conditions.push(`email LIKE '%${searchParams.email}%'`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        if (searchParams.sortBy) {
            query += ` ORDER BY ${searchParams.sortBy}`;
        }

        return new Promise((resolve, reject) => {
            connection.query<User[]>(query, (err, users) => {
                if (err) reject(err);
                else resolve(users);
            });
        });
    }
    update(user: User): Promise<number> {
        return new Promise((resolve, reject) => {
            const updateFields = [];
            const params = [];

            if (user.username) {
                updateFields.push("username = ?");
                params.push(user.username);
            }

            if (user.email) {
                updateFields.push("email = ?");
                params.push(user.email);
            }

            if (user.password) {
                updateFields.push("password = ?");
                params.push(user.password);
            }

            if (user.liked !== undefined) {
                updateFields.push("liked = ?");
                params.push(user.liked);
              }
          
              if (user.stared !== undefined) {
                updateFields.push("stared = ?");
                params.push(user.stared);
              }

            params.push(user.id);

            connection.query<OkPacket>(
                `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
                params,
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res.affectedRows);
                }
            );
        });
    }

    delete(userId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            connection.query<OkPacket>(
                "DELETE FROM users WHERE id = ?",
                [userId],
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res.affectedRows);
                }
            );
        });
    }
}

export default new UserRepository();