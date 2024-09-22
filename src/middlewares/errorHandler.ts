import { Request, Response, NextFunction } from "express";
import { ApiError } from "../error/ApiError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

export default errorHandler;
