import express from "express";

const hospitals: string[] = [
  "Mott",
  "CHM",
  "CHOP",
  "COMER",
  "Colorado",
  "Utah",
];

const hospitalRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

hospitalRouter.get("/hospitals", async (req, res) => {
  try {
    res.status(200).json(hospitals);
  } catch (err) {
    errorResponse(err, res);
  }
});

export default hospitalRouter;
