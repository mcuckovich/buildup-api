import { ObjectId } from "mongodb";

export default interface Build {
  _id?: ObjectId;
  title: string;
  kitColor: string;
  images: string[];
}
