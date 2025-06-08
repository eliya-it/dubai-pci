import { Request, Response } from "express";
import app from "./app";

app.get("/health", function (req: Request, res: Response) {
  res.status(200).json({
    status: "success",
    message: "Server is healthy and running.",
  });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[**] Server is listnening on port: ${port}`);
});
