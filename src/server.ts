import { Request, Response } from "express";
import app from "./app";
import { AppDataSource } from "./config/database";
import "reflect-metadata";

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("[**] Database connection established");
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
  });

app.get("/health", function (req: Request, res: Response) {
  res.status(200).json({
    status: "success",
    message: "Server is healthy and running.",
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[**] Server is listening on port ${port}`);
});
