import { RowDataPacket } from "mysql2"

export default interface Recipe extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  identity: string;
  createdAt?: Date;
  password: string;
  liked?: string;
  stared?:string;
}