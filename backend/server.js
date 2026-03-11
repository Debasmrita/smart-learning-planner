import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./authRoutes.js";
import topicRoutes from "./topicRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("StudyBuddy Backend Running ✅");
});

// MongoDB connect + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
  });
