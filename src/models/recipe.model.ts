import { RowDataPacket } from "mysql2"

export default interface Recipe extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  published?: boolean;
  createdAt?: Date;
  base: string;
  alcohol: string;
  likeCount:number;
  starCount:number;
}