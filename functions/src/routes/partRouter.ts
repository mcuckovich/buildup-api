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

partRouter.put("/parts/add/request", async (req, res) => {
  try {
    const requestedPart = req.body;

    const employee = requestedPart.employee;
    const hospital = requestedPart.hospital;

    const client = await getClient();
    const partCollection = client.db().collection("parts");

    const bulkUpdate = [];

    for (const part of requestedPart.parts) {
      const _id = new ObjectId(part.id);

      const existingRequest = await partCollection.findOne({
        _id,
        "requests.employee": employee,
        "requests.hospital": hospital,
      });

      if (existingRequest) {
        // Existing request found, update the quantity
        const update = {
          $inc: {
            "requests.$.quantity": part.quantity,
            quantity: part.quantity,
          },
        };

        bulkUpdate.push({
          updateOne: {
            filter: {
              _id,
              "requests.employee": employee,
              "requests.hospital": hospital,
            },
            update,
          },
        });
      } else {
        // No existing request found, create a new one
        const update = {
          $inc: { quantity: part.quantity },
          $push: {
            requests: {
              ...part,
              hospital,
              employee,
            },
          },
        };

        bulkUpdate.push({
          updateOne: {
            filter: { _id },
            update,
          },
        });
      }
    }

    const result = await partCollection.bulkWrite(bulkUpdate);

    if (result.modifiedCount === requestedPart.parts.length) {
      res.status(200).json({
        message: `Requests for all parts have been updated`,
      });
    } else {
      res.status(500).json({ message: "Failed to update the requests" });
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
