import express from "express";
import * as functions from "firebase-functions";

const secretRouter = express.Router();

const password: string = functions.config().secret.password;

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

secretRouter.post("/secret", async (req, res) => {
  try {
    const body = req.body;
    if (body.guess === password) {
      res.status(200).json({ access: true });
    } else {
      res.status(200).json({ access: false });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default secretRouter;
