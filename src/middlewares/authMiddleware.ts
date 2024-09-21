import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token tidak ada" });
  }
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ada" });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      JWT_SECRET as string
    ) as UserPayload;
    const { role } = decodedToken;

    if (role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Anda tidak diizinkan mengakses halaman ini" });
    }

    next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};