import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const protect = (req, res, next) => {
  try {

    const header = req.headers.authorization;

    // Check if token exists
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided, unauthorized"
      });
    }

    // Extract token
    const token = header.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach student info to request
    req.student = decoded; // { id }

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};