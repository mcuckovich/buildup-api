import express from "express";
import { getClient } from "../db";
import Build from "../models/Build";
import { ObjectId } from "mongodb";

const buildRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

buildRouter.get("/builds", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client.db().collection<Build>("builds").find();
    const results = await cursor.toArray();
    res.status(200).json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

buildRouter.post("/builds", async (req, res) => {
  try {
    const client = await getClient();
    const newBuild: Build = req.body;
    const { title, kitColor, images } = newBuild;
    console.log(newBuild);
    const existingBuild = await client
      .db()
      .collection<Build>("builds")
      .findOne({ title, kitColor });

    if (existingBuild) {
      // If a document with the same title and kit color exists, update the images property
      existingBuild.images = [...existingBuild.images, ...images];
      await client
        .db()
        .collection<Build>("builds")
        .updateOne(
          { title, kitColor },
          { $set: { images: existingBuild.images } }
        );
      res.status(201).json(existingBuild);
    } else {
      // If no document exists with the same title and kit color, create a new document
      await client.db().collection<Build>("builds").insertOne(newBuild);
      res.status(201).json(newBuild);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

buildRouter.put("/builds/:id", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const client = await getClient();
    const build: Build = req.body;
    delete build._id;
    const result = await client
      .db()
      .collection<Build>("builds")
      .replaceOne({ _id }, build);
    if (result.modifiedCount) {
      res.status(200).json(build);
    } else {
      res.status(404).json({ message: `Build with id ${_id} not found` });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

buildRouter.delete("/builds/:id", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const client = await getClient();
    const result = await client
      .db()
      .collection<Build>("builds")
      .deleteOne({ _id });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: `Build with id ${_id} not found` });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default buildRouter;
