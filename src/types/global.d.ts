import { User } from "../entities/User";
import "express-session";

declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      user?: Partial<User> | User;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    id: string;
  }
}

// This export is needed to make the file a module
export {};
