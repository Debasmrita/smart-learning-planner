import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "../backend/authRoutes.js";
import topicRoutes from "../backend/topicRoutes.js";

const app = express();

// CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);

// MongoDB Connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export default app;