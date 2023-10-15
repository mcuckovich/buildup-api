import express from "express";
import { getClient } from "../db";
import Part from "../models/Part";
import { ObjectId } from "mongodb";

const partRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

partRouter.get("/parts", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client.db().collection<Part>("parts").find();
    const results = await cursor.toArray();
    res.status(200).json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

partRouter.put("/parts/:id/add/request", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const requestedPart: any = req.body;
    const client = await getClient();
    const partCollection = client.db().collection<Part>("parts");

    // Check if a matching request already exists
    const existingRequestIndex = await partCollection.countDocuments({
      _id,
      "requests.hospital": requestedPart.hospital,
      "requests.employee": requestedPart.employee,
    });

    if (existingRequestIndex > 0) {
      // If an existing request exists, update it
      const result = await partCollection.updateOne(
        { _id, "requests.hospital": requestedPart.hospital },
        {
          $inc: {
            "requests.$.quantity": requestedPart.quantity,
            quantity: requestedPart.quantity,
          },
        }
      );

      if (result.modifiedCount) {
        res.status(200).json({
          message: `Request for part with id:${_id} has been updated`,
        });
      } else {
        res.status(500).json({ message: "Failed to update the request" });
      }
    } else {
      // If no matching request exists, push a new one
      const result = await partCollection.updateOne(
        { _id },
        {
          $push: { requests: requestedPart },
          $inc: { quantity: requestedPart.quantity },
          // You can update other fields here if needed
        }
      );
      if (result.modifiedCount) {
        res
          .status(200)
          .json({ message: `Request for part with id:${_id} has been added` });
      } else {
        res.status(404).json({ message: `Part with id:${_id} not found` });
      }
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

partRouter.put("/parts/:id/delete/request", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const requestedPart: any = req.body;
    const client = await getClient();
    const result = await client
      .db()
      .collection<Part>("parts")
      .updateOne(
        { _id },
        {
          $pull: { requests: requestedPart },
          $inc: { quantity: -requestedPart.quantity },
        }
      );
    if (result.modifiedCount) {
      res.status(200).json(requestedPart);
    } else {
      res.status(404).json({ message: `Part with id:${_id} not found` });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

partRouter.put("/parts/:id/delete-all/requests", async (req, res) => {
  try {
    const _id: ObjectId = new ObjectId(req.params.id);
    const client = await getClient();
    const result = await client
      .db()
      .collection<Part>("parts")
      .updateOne(
        { _id },
        {
          $unset: { requests: 1 },
          $set: { quantity: 0 },
        }
      );
    if (result.modifiedCount) {
      res.status(200).json({ message: `Part with id:${_id} has been updated` });
    } else {
      res.status(404).json({ message: `Part with id:${_id} not found` });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default partRouter;
