import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import partRouter from "./routes/partRouter";
import buildRouter from "./routes/buildRouter";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", partRouter);
app.use("/", buildRouter);
export const api = functions.https.onRequest(app);
