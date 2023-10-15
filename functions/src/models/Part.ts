import { ObjectId } from "mongodb";
import RequestedPart from "./RequestedPart";

export default interface Part {
  _id?: ObjectId;
  pic: string;
  name: string;
  colorCode: number | null;
  color: string;
  kits: string[];
  partNumber: string;
  quantity: number;
  requests: RequestedPart[];
}
