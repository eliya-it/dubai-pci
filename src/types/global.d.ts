import { Request as ExpressRequest } from "express";
import "express-session";

declare module "express" {
  interface Request {
    sessionID: string;
  }
}

declare module "express-session" {
  interface SessionData {
    id: string;
  }
}
