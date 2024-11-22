import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { userId: string }; // Extend the Request interface to include the user property
}

const authenticateMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // Get the token from the request headers

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Unauthorized1"));
  }

  const token = authorizationHeader.split(" ")[1]; // Get the token without the "Bearer " prefix
  if (!token) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Unauthorized2"));
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, "solyKey") as { userId: string };
    // Attach the user data to the request object
    req.user = decodedToken;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.BAD_REQUEST, error as any));
  }
};

export default authenticateMiddleware;
