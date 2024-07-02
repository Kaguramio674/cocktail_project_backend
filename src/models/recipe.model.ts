import { RowDataPacket } from "mysql2"

export default interface Recipe extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  createdAt?: Date;
  imageUrl: string;
  spirit: string;
  spiritAmount: string;
  basic: string;
  basicAmount: string;
  juice: string;
  juiceAmount: string;
  other: string;
  otherAmount: string;
  alcohol: string;
  likeCount:number;
  starCount:number;
  method: string;
}