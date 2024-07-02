import { RowDataPacket } from "mysql2"

export default interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  identity: string;
  createdAt?: Date;
  password: string;
  liked: string;
  stared:string;
  imageUrl: string;
}